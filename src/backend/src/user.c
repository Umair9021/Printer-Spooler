#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/wait.h>
#include "../include/spooler.h"

int ipc_pipe[2];
int job_id_counter = 1;

void submit_job(const char *user, const char *doc, int priority, int pages) {
    pid_t pid = fork();
    
    if (pid < 0) {
        emit_log("Failed to fork user process");
        return;
    }
    
    if (pid == 0) {
        // Child process (User)
        PipeMessage msg;
        strncpy(msg.user, user, sizeof(msg.user) - 1);
        msg.user[sizeof(msg.user) - 1] = '\0';
        strncpy(msg.doc, doc, sizeof(msg.doc) - 1);
        msg.doc[sizeof(msg.doc) - 1] = '\0';
        msg.priority = priority;
        msg.pages = pages;
        
        // Write to pipe
        write(ipc_pipe[1], &msg, sizeof(PipeMessage));
        exit(0);
    } else {
        // Parent process (Spooler)
        waitpid(pid, NULL, 0); // Wait for child to write
        
        PipeMessage msg;
        int n = read(ipc_pipe[0], &msg, sizeof(PipeMessage));
        if (n == sizeof(PipeMessage)) {
            PrintJob job;
            job.id = job_id_counter++;
            strncpy(job.user, msg.user, sizeof(job.user) - 1);
            strncpy(job.doc, msg.doc, sizeof(job.doc) - 1);
            job.priority = msg.priority;
            job.pages = msg.pages;
            job.status = STATUS_QUEUED;
            job.submitted_at = time(NULL);
            job.thread_id = -1;
            
            enqueue_job(job);
        }
    }
}
