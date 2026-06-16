# Project Report: Print Spooler OS Simulation

## 1. Problem Statement
In modern Operating Systems, multiple processes (or users) frequently request access to shared hardware resources, such as printers, simultaneously. If left unmanaged, this concurrent access leads to race conditions, resource conflicts, and system deadlocks. The challenge is to design an intermediary system—a Spooler—that intercepts print requests, safely queues them, and delegates them to worker threads (printers) based on configurable scheduling policies while strictly avoiding deadlocks caused by limited system resources (such as ink, paper, and toner).

## 2. Objectives
- Design and develop a functional Spooler simulation mimicking a real OS kernel component using **C**.
- Ensure robust handling of concurrent user requests using **Multithreading** and **Synchronization** techniques.
- Implement multiple CPU **Scheduling Algorithms** to dictate the execution order of jobs.
- Prevent system deadlocks by implementing the **Banker's Algorithm** for safe resource allocation.
- Bridge the low-level C backend to a modern, interactive **React Dashboard** via WebSockets to visualize the OS concepts in real-time.

## 3. OS Concepts Used

The project extensively utilizes core Operating System concepts to build the simulation:
- **Processes & IPC**: Forking child processes to simulate users and communicating via Pipes.
- **Multithreading**: Concurrent worker threads acting as hardware printers.
- **Synchronization**: Mutexes and Condition Variables to safely manage shared memory.
- **CPU Scheduling**: FCFS, SJF, and Priority algorithms for the job queue.
- **Deadlock Handling**: Real-time safety checks using Dijkstra's Banker's Algorithm.

## 4. Screenshots
*(Please insert screenshots of the React Dashboard here, showing the Queue, Worker Threads, and Banker's Algorithm Matrix views during your demonstration).*

## 5. Evidence of Implemented OS Concepts

To provide concrete evidence of the OS concepts implemented in this project, the following are direct references and code snippets from the system's C backend source code:

### A. Processes and Inter-Process Communication (IPC)
**Evidence Location:** `src/backend/src/user.c` and `src/backend/src/main.c`
When a user submits a job, `submit_job()` uses the `fork()` system call to spawn a child process. This child process packages the job and sends it to the parent Spooler process over an anonymous pipe using `write()`, proving IPC.
```c
// From user.c
pid_t pid = fork();
if (pid == 0) {
    // Child process: write to pipe
    write(ipc_pipe[1], &msg, sizeof(PipeMessage));
    exit(0);
} else {
    // Parent process: read from pipe
    waitpid(pid, NULL, 0); 
    read(ipc_pipe[0], &msg, sizeof(PipeMessage));
}
```

### B. Multithreading (Threads)
**Evidence Location:** `src/backend/src/printer.c`
The Spooler creates a pool of POSIX worker threads representing individual printer hardware.
```c
// From printer.c (init_workers)
for (int i = 0; i < NUM_WORKERS; i++) {
    pthread_create(&workers[i].thread, NULL, worker_routine, &workers[i]);
}
```

### C. Synchronization (Mutexes & Condition Variables)
**Evidence Location:** `src/backend/src/printer.c` and `src/backend/src/spooler.c`
To prevent race conditions, the shared `JobQueue` is protected by a mutex lock. Condition variables are used to put threads to sleep when the queue is empty, and `pthread_cond_broadcast` is used to wake them up.
```c
// From printer.c (worker_routine)
pthread_mutex_lock(&queue.lock);
while (queue.count == 0 || is_paused || worker->id > active_workers) {
    // Sleep efficiently until woken by a signal
    pthread_cond_wait(&queue.not_empty, &queue.lock);
}
// ... [Dequeue logic] ...
pthread_mutex_unlock(&queue.lock);
```

### D. CPU Scheduling
**Evidence Location:** `src/backend/src/printer.c`
The dequeue logic implements specific CPU scheduling algorithms by scanning the queue to find the best job.
```c
// From printer.c (scheduling logic)
if (queue.policy == POLICY_PRIORITY) {
    if (queue.jobs[i].priority > queue.jobs[selected_index].priority) selected_index = i;
} else if (queue.policy == POLICY_SJF) {
    if (queue.jobs[i].pages < queue.jobs[selected_index].pages) selected_index = i;
}
```

### E. Deadlock Handling (Banker's Algorithm)
**Evidence Location:** `src/backend/src/deadlock.c`
The `can_job_run_safely()` function temporarily simulates the allocation of requested resources and calls `is_safe()` to verify if the allocation leaves the system in a safe state, effectively preventing deadlocks.
```c
// From deadlock.c (request_resources simulation)
for (int i = 0; i < NUM_RESOURCES; i++) {
    bankers.available[i] -= req[i];
    bankers.allocation[process_idx][i] += req[i];
    bankers.need[process_idx][i] -= req[i];
}
bool safe = is_safe(); // Banker's safety check
```

## 6. Conclusion
This project successfully synthesizes multiple fundamental Operating System principles into a single, cohesive, full-stack application. By implementing processes, threading, IPC, synchronization, scheduling, and deadlock avoidance from scratch in C—and marrying it with a modern web dashboard—the system provides a robust, visually demonstrable proof of how a real-world OS safely manages shared hardware resources.
