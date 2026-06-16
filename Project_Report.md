# Project Report: Print Spooler OS Simulation

## 1. Problem Statement
In modern Operating Systems, multiple processes (or users) frequently request access to shared hardware resources, such as printers, simultaneously. If left unmanaged, this concurrent access leads to race conditions, resource conflicts, and system deadlocks. The challenge is to design an intermediary system—a Spooler—that intercepts print requests, safely queues them, and delegates them to worker threads (printers) based on configurable scheduling policies while strictly avoiding deadlocks caused by limited system resources (such as ink, paper, and toner).

## 2. Objectives
- Design and develop a functional Spooler simulation mimicking a real OS kernel component using **C**.
- Ensure robust handling of concurrent user requests using **Multithreading** and **Synchronization** techniques.
- Implement multiple CPU **Scheduling Algorithms** to dictate the execution order of jobs.
- Prevent system deadlocks by implementing the **Banker's Algorithm** for safe resource allocation.
- Bridge the low-level C backend to a modern, interactive **React Dashboard** via WebSockets to visualize the OS concepts in real-time.

## 3. OS Concepts Used & Implemented

### A. Processes and Inter-Process Communication (IPC)
When a user submits a print job via the frontend dashboard, the request is received by the Python middleware and forwarded to the main C program. The C program then utilizes `fork()` to create a child process representing the user. This child process packages the job details and sends it back to the parent Spooler process using an **Anonymous Pipe** (`pipe()`). This demonstrates process creation and secure, unidirectional IPC.

### B. Multithreading
To simulate a server connected to multiple printers, the Spooler dynamically spawns a configurable number of **POSIX Worker Threads** (`pthread_create`). These threads run concurrently, pulling jobs from a central, shared memory queue, perfectly demonstrating concurrent execution within a single process space.

### C. Synchronization (Mutexes & Condition Variables)
Because multiple worker threads are constantly attempting to read from and modify the shared `JobQueue` and Banker's Algorithm resource matrices, the system relies heavily on synchronization primitives.
- **Mutex Locks (`pthread_mutex_t`)**: Ensure that only one thread can modify the queue or allocate resources at any given exact moment, preventing data corruption.
- **Condition Variables (`pthread_cond_t`)**: Used to pause worker threads when the queue is empty or the system is paused. When a user adds a job or unpauses the system, a `pthread_cond_broadcast` is triggered to efficiently wake the sleeping threads.

### D. CPU Scheduling
The Spooler does not just process jobs in the order they arrive. It features a configurable scheduler implementing three classic OS algorithms:
1. **Priority Scheduling**: Prioritizes jobs marked as "High" over "Medium" and "Low".
2. **Shortest Job First (SJF)**: Prioritizes jobs with the fewest number of pages to minimize average waiting time.
3. **First-Come, First-Served (FCFS)**: Processes jobs strictly in their arrival order.

**Queue Bypassing:** To solve the issue of Head-of-Line Blocking, the scheduler is intelligent enough to bypass a high-priority job if it is blocked by resource constraints, allowing smaller jobs further back in the queue to execute.

### E. Deadlock Handling (Banker's Algorithm)
To ensure the system never enters a state where multiple jobs are waiting indefinitely for resources held by each other, the Spooler strictly enforces the **Banker's Algorithm**.
When a worker thread selects a job, it calculates the job's resource requirements. It then temporarily simulates the allocation of these resources and runs `is_safe()` to verify if all active processes can theoretically finish. If the simulation returns an unsafe state, the system denies the allocation, leaves the resources available for other jobs, and instructs the thread to bypass the blocked job.

## 4. Conclusion
This project successfully synthesizes multiple fundamental Operating System principles into a single, cohesive, full-stack application. By implementing processes, threading, IPC, synchronization, scheduling, and deadlock avoidance from scratch in C—and marrying it with a modern web dashboard—the system provides a robust, visually demonstrable proof of how a real-world OS safely manages shared hardware resources.
