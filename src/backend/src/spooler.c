#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include "../include/spooler.h"

JobQueue queue;

void init_queue() {
    queue.count = 0;
    queue.policy = POLICY_PRIORITY;
    queue.total_submitted = 0;
    queue.total_printed = 0;
    pthread_mutex_init(&queue.lock, NULL);
    pthread_cond_init(&queue.not_empty, NULL);
}

void emit_json(const char *event, const char *json_data) {
    // Print to stdout and flush immediately so bridge.py can read it
    printf("{\"event\": \"%s\", \"data\": %s}\n", event, json_data);
    fflush(stdout);
}

void emit_queue_update() {
    pthread_mutex_lock(&queue.lock);
    char buf[4096];
    char temp[512];
    strcpy(buf, "[");
    int first = 1;
    for (int i = 0; i < queue.count; i++) {
        if (!first) strcat(buf, ", ");
        sprintf(temp, "{\"id\": %d, \"user\": \"%s\", \"doc\": \"%s\", \"priority\": %d, \"pages\": %d, \"status\": %d, \"thread_id\": %d}",
            queue.jobs[i].id, queue.jobs[i].user, queue.jobs[i].doc, 
            queue.jobs[i].priority, queue.jobs[i].pages, 
            queue.jobs[i].status, queue.jobs[i].thread_id);
        strcat(buf, temp);
        first = 0;
    }
    strcat(buf, "]");
    pthread_mutex_unlock(&queue.lock);
    emit_json("QUEUE_UPDATE", buf);
}

void emit_stats() {
    char buf[256];
    int active = 0;
    for(int i=0; i<NUM_WORKERS; i++) {
        if(workers[i].busy) active++;
    }
    sprintf(buf, "{\"submitted\": %d, \"printed\": %d, \"active\": %d}", 
            queue.total_submitted, queue.total_printed, active);
    emit_json("STATS", buf);
}

void emit_log(const char *msg) {
    char buf[1024];
    sprintf(buf, "{\"msg\": \"%s\"}", msg);
    emit_json("LOG", buf);
}

void enqueue_job(PrintJob job) {
    pthread_mutex_lock(&queue.lock);
    if (queue.count < MAX_JOBS) {
        queue.jobs[queue.count] = job;
        queue.count++;
        queue.total_submitted++;
        pthread_cond_signal(&queue.not_empty);
    }
    pthread_mutex_unlock(&queue.lock);
    
    char log_msg[512];
    sprintf(log_msg, "Job %d submitted by %s (%s)", job.id, job.user, job.doc);
    emit_log(log_msg);
    
    char job_json[512];
    sprintf(job_json, "{\"id\": %d, \"user\": \"%s\", \"doc\": \"%s\", \"priority\": %d, \"pages\": %d}",
            job.id, job.user, job.doc, job.priority, job.pages);
    emit_json("JOB_SUBMITTED", job_json);
    
    emit_queue_update();
    emit_stats();
}

void requeue_job(PrintJob job) {
    pthread_mutex_lock(&queue.lock);
    if (queue.count < MAX_JOBS) {
        queue.jobs[queue.count] = job;
        queue.count++;
        pthread_cond_signal(&queue.not_empty);
    }
    pthread_mutex_unlock(&queue.lock);
    emit_queue_update();
}

int dequeue_job() {
    if (queue.count == 0) return -1;
    
    int selected_index = 0;
    
    // Find job based on policy
    for (int i = 1; i < queue.count; i++) {
        if (queue.policy == POLICY_PRIORITY) {
            if (queue.jobs[i].priority > queue.jobs[selected_index].priority) {
                selected_index = i;
            }
        } else if (queue.policy == POLICY_SJF) {
            if (queue.jobs[i].pages < queue.jobs[selected_index].pages) {
                selected_index = i;
            }
        }
        // FCFS: just takes index 0, which is naturally FCFS since jobs are appended
    }
    
    int id = queue.jobs[selected_index].id;
    // Remove from queue
    for (int i = selected_index; i < queue.count - 1; i++) {
        queue.jobs[i] = queue.jobs[i+1];
    }
    queue.count--;
    return id;
}

void set_policy(int policy) {
    pthread_mutex_lock(&queue.lock);
    queue.policy = policy;
    pthread_mutex_unlock(&queue.lock);
    
    char* policy_str = "Priority";
    if(policy == POLICY_FCFS) policy_str = "FCFS";
    if(policy == POLICY_SJF) policy_str = "SJF";
    
    char msg[128];
    sprintf(msg, "Scheduling policy changed to %s", policy_str);
    emit_log(msg);
}

void reset_system() {
    pthread_mutex_lock(&queue.lock);
    queue.count = 0;
    queue.total_submitted = 0;
    queue.total_printed = 0;
    pthread_mutex_unlock(&queue.lock);
    emit_log("System reset by user");
    emit_queue_update();
    emit_stats();
}
