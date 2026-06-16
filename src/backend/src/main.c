#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include "../include/spooler.h"

int main() {
    // Disable buffering for stdout to ensure immediate transmission to Python bridge
    setvbuf(stdout, NULL, _IONBF, 0);

    // Initialize IPC pipe
    if (pipe(ipc_pipe) < 0) {
        emit_log("Failed to create IPC pipe");
        return 1;
    }

    init_queue();
    init_bankers();
    init_workers();
    
    emit_log("Spooler system initialized");

    char line[1024];
    while (fgets(line, sizeof(line), stdin)) {
        // Strip newline
        line[strcspn(line, "\r\n")] = 0;
        
        char *cmd = strtok(line, "|");
        if (!cmd) continue;
        
        if (strcmp(cmd, "SUBMIT_JOB") == 0) {
            char *user = strtok(NULL, "|");
            char *doc = strtok(NULL, "|");
            char *prio_str = strtok(NULL, "|");
            char *pages_str = strtok(NULL, "|");
            
            if (user && doc && prio_str && pages_str) {
                int prio = atoi(prio_str);
                int pages = atoi(pages_str);
                submit_job(user, doc, prio, pages);
            }
        } else if (strcmp(cmd, "SET_POLICY") == 0) {
            char *policy_str = strtok(NULL, "|");
            if (policy_str) {
                set_policy(atoi(policy_str));
            }
        } else if (strcmp(cmd, "RESET") == 0) {
            reset_system();
        } else if (strcmp(cmd, "RUN_SAFETY") == 0) {
            run_safety_check();
        }
    }
    
    return 0;
}
