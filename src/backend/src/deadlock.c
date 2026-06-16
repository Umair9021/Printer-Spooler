#include <stdio.h>
#include <stdbool.h>
#include "../include/spooler.h"

BankersState bankers;

void init_bankers() {
    bankers.available[RES_INK] = 12;
    bankers.available[RES_PAPER] = 10;
    bankers.available[RES_TONER] = 9;
    bankers.n_processes = 0;
    
    // Clear allocations and maximums
    for(int i = 0; i < MAX_JOBS; i++) {
        for(int j = 0; j < NUM_RESOURCES; j++) {
            bankers.allocation[i][j] = 0;
            bankers.maximum[i][j] = 0;
            bankers.need[i][j] = 0;
        }
    }
}

bool is_safe() {
    int work[NUM_RESOURCES];
    bool finish[MAX_JOBS];
    
    for (int i = 0; i < NUM_RESOURCES; i++) {
        work[i] = bankers.available[i];
    }
    for (int i = 0; i < bankers.n_processes; i++) {
        finish[i] = false;
    }
    
    int count = 0;
    while (count < bankers.n_processes) {
        bool found = false;
        for (int p = 0; p < bankers.n_processes; p++) {
            if (!finish[p]) {
                int j;
                for (j = 0; j < NUM_RESOURCES; j++) {
                    if (bankers.need[p][j] > work[j])
                        break;
                }
                
                if (j == NUM_RESOURCES) {
                    for (int k = 0; k < NUM_RESOURCES; k++) {
                        work[k] += bankers.allocation[p][k];
                    }
                    finish[p] = true;
                    found = true;
                    count++;
                }
            }
        }
        if (!found) {
            return false; // Not safe
        }
    }
    return true; // Safe
}

bool request_resources(int job_id, int request[NUM_RESOURCES]) {
    // Check if request exceeds available
    for (int i = 0; i < NUM_RESOURCES; i++) {
        if (request[i] > bankers.available[i]) {
            return false;
        }
    }
    
    // Temporarily allocate
    for (int i = 0; i < NUM_RESOURCES; i++) {
        bankers.available[i] -= request[i];
        bankers.allocation[job_id][i] += request[i];
        bankers.need[job_id][i] -= request[i];
    }
    
    // Check if safe
    if (is_safe()) {
        return true;
    } else {
        // Revert
        for (int i = 0; i < NUM_RESOURCES; i++) {
            bankers.available[i] += request[i];
            bankers.allocation[job_id][i] -= request[i];
            bankers.need[job_id][i] += request[i];
        }
        return false;
    }
}

void release_resources(int job_id, int release[NUM_RESOURCES]) {
    for (int i = 0; i < NUM_RESOURCES; i++) {
        bankers.available[i] += release[i];
        bankers.allocation[job_id][i] -= release[i];
    }
}

void run_safety_check() {
    bool safe = is_safe();
    char buf[1024];
    sprintf(buf, "{\"safe\": %s, \"available\": [%d, %d, %d]}", 
            safe ? "true" : "false",
            bankers.available[RES_INK], bankers.available[RES_PAPER], bankers.available[RES_TONER]);
    emit_json("BANKERS", buf);
}
