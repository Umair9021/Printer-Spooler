#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include "../include/spooler.h"

WorkerThread workers[NUM_WORKERS];

void init_workers() {
    for (int i = 0; i < NUM_WORKERS; i++) {
        workers[i].id = i + 1;
        workers[i].busy = false;
        workers[i].current_job_id = -1;
        workers[i].progress = 0;
        pthread_create(&workers[i].thread, NULL, worker_routine, &workers[i]);
    }
}

void *worker_routine(void *arg) {
    WorkerThread *worker = (WorkerThread *)arg;
    
    while (1) {
        pthread_mutex_lock(&queue.lock);
        
        int selected_index = -1;
        while (1) {
            if (is_paused || worker->id > active_workers) {
                pthread_cond_wait(&queue.not_empty, &queue.lock);
                continue;
            }
            
            selected_index = -1;
            for (int i = 0; i < queue.count; i++) {
                if (!can_job_run_safely(queue.jobs[i])) continue;
                
                if (selected_index == -1) {
                    selected_index = i;
                    continue;
                }
                
                if (queue.policy == POLICY_PRIORITY) {
                    if (queue.jobs[i].priority > queue.jobs[selected_index].priority) selected_index = i;
                } else if (queue.policy == POLICY_SJF) {
                    if (queue.jobs[i].pages < queue.jobs[selected_index].pages) selected_index = i;
                }
            }
            
            if (selected_index != -1) {
                break; // Found a safe job!
            }
            
            // Queue is empty OR all jobs are unsafe (blocked). Wait for a signal.
            pthread_cond_wait(&queue.not_empty, &queue.lock);
        }
        
        PrintJob job = queue.jobs[selected_index];
        for (int i = selected_index; i < queue.count - 1; i++) {
            queue.jobs[i] = queue.jobs[i+1];
        }
        queue.count--;
        
        // At this point we already know it's safe to run. We just need to formally allocate it.
        worker->busy = true;
        worker->current_job_id = job.id;
        worker->progress = 0;
        
        int req[NUM_RESOURCES] = {job.priority, job.pages / 2 + 1, job.pages / 3 + 1};
        int process_idx = job.id % MAX_JOBS;
        
        if (bankers.n_processes <= process_idx) bankers.n_processes = process_idx + 1;
        
        for (int i = 0; i < NUM_RESOURCES; i++) {
            bankers.maximum[process_idx][i] = req[i];
            bankers.need[process_idx][i] = req[i] - bankers.allocation[process_idx][i];
        }
        
        request_resources(process_idx, req);
        pthread_mutex_unlock(&queue.lock);
        
        // Job Started
        char start_msg[512];
        sprintf(start_msg, "{\"job_id\": %d, \"doc\": \"%s\", \"thread\": %d}", job.id, job.doc, worker->id);
        emit_json("JOB_STARTED", start_msg);
        emit_queue_update();
        emit_stats();
        
        // Simulate printing
        for (int p = 0; p <= 100; p += (100 / job.pages + 1)) {
            if (p > 100) p = 100;
            worker->progress = p;
            char prog_msg[256];
            sprintf(prog_msg, "{\"thread\": %d, \"progress\": %d, \"job_id\": %d}", worker->id, p, job.id);
            emit_json("JOB_PROGRESS", prog_msg);
            usleep(200000); // 200ms per "page chunk"
        }
        
        // End Job
        worker->progress = 100;
        char end_msg[512];
        sprintf(end_msg, "{\"job_id\": %d, \"doc\": \"%s\", \"thread\": %d}", job.id, job.doc, worker->id);
        emit_json("JOB_DONE", end_msg);
        
        // Release resources
        pthread_mutex_lock(&queue.lock);
        release_resources(process_idx, req);
        queue.total_printed++;
        pthread_cond_broadcast(&queue.not_empty); // Wake up threads to re-evaluate queue!
        pthread_mutex_unlock(&queue.lock);
        
        worker->busy = false;
        worker->current_job_id = -1;
        emit_queue_update();
        emit_stats();
        
        char log_msg[512];
        sprintf(log_msg, "T%02d \u2192 finished printing %s", worker->id, job.doc);
        emit_log(log_msg);
    }
    return NULL;
}
