# OS Spooler Simulation

A full-stack Operating Systems simulation demonstrating core OS concepts such as Inter-Process Communication (IPC), Multithreading, Thread Synchronization, CPU Scheduling, and Deadlock Avoidance using the Banker's Algorithm.

This project features a native C backend simulating the OS kernel layer, connected to a modern React frontend via a Python WebSocket bridge.

## Architecture

- **C Backend**: Simulates the OS Spooler. Manages job queues, multithreaded workers, IPC pipes, mutex locks, and Banker's Algorithm safety checks.
- **Python Bridge**: Acts as middleware, translating standard I/O streams from the C process into WebSocket events.
- **React Frontend**: A stunning, interactive dashboard built with Vite, React, and TailwindCSS that visualizes the C backend in real-time.

---

## 🚀 How to Run Locally

### Prerequisites
- GCC (C Compiler) & Make
- Python 3.10+
- Node.js 18+

### 1. Start the Backend

Open a terminal in the project root and run:

```bash
cd src/backend

# Install python dependencies for the bridge
pip install websockets

# Compile the C program
make

# Run the WebSocket bridge
python bridge.py
```
*The backend will now listen for WebSocket connections on `ws://localhost:8765`.*

### 2. Start the Frontend

Open a **second terminal** in the project root and run:

```bash
# Install Node dependencies
npm install

# Start the Vite development server
npm run dev
```
*Open the provided local URL (usually `http://localhost:5173`) in your browser to interact with the Spooler.*

---

## 🧠 OS Concepts Implemented

### 1. Inter-Process Communication (IPC)
When a user submits a print job from the frontend, the Python bridge sends it to the main Spooler process. The main process forks a child process to simulate the user, which then transmits the job data back to the parent Spooler via an **Anonymous Pipe** (`pipe()`).

### 2. Multithreading & Worker Pools
The system dynamically spins up multiple **POSIX Threads** (`pthread`) to simulate concurrent printer hardware. Workers pull jobs from the shared queue and process them concurrently.

### 3. Synchronization
To prevent race conditions when modifying the shared Job Queue and Banker's Matrices, the system uses **Mutex Locks** (`pthread_mutex_t`). 
**Condition Variables** (`pthread_cond_t`) are used to efficiently put worker threads to sleep when the queue is empty or paused, and wake them up (`pthread_cond_broadcast`) when a new job is submitted or resources are freed.

### 4. Scheduling Policies
The Spooler implements three distinct scheduling algorithms:
- **FCFS** (First-Come, First-Served)
- **SJF** (Shortest Job First - based on page count)
- **Priority** Scheduling

*Queue Bypassing:* If a high-priority job is blocked by resource constraints, the scheduler actively bypasses it to prevent head-of-line blocking, allowing smaller jobs to execute.

### 5. Deadlock Handling (Banker's Algorithm)
Before any thread begins a job, it must request resources (Ink, Paper, Toner). The system simulates the allocation and runs the **Banker's Algorithm** (`is_safe()`) to ensure the system remains in a safe state. If it is unsafe, the thread skips the job and waits for resources to be freed.