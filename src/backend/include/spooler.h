#ifndef SPOOLER_H
#define SPOOLER_H

#include <pthread.h>
#include <stdbool.h>
#include <time.h>

#define MAX_JOBS 50
#define NUM_WORKERS 5

// Priorities
#define PRIO_LOW 1
#define PRIO_MEDIUM 2
#define PRIO_HIGH 3

// Scheduling Policies
#define POLICY_PRIORITY 0
#define POLICY_FCFS 1
#define POLICY_SJF 2

// Job Statuses
#define STATUS_QUEUED 0
#define STATUS_PRINTING 1
#define STATUS_DONE 2

// Resource indices (for Banker's)
#define RES_INK 0
#define RES_PAPER 1
#define RES_TONER 2
#define NUM_RESOURCES 3

typedef struct {
    int id;
    char user[64];
    char doc[256];
    int priority;
    int pages;
    int status;
    time_t submitted_at;
    int thread_id;
} PrintJob;

typedef struct {
    PrintJob jobs[MAX_JOBS];
    int count;
    int policy;
    int total_submitted;
    int total_printed;
    pthread_mutex_t lock;
    pthread_cond_t not_empty;
} JobQueue;

typedef struct {
    int id;
    pthread_t thread;
    bool busy;
    int current_job_id;
    int progress; // 0-100
} WorkerThread;

typedef struct {
    int available[NUM_RESOURCES]; // INK=12, PAPER=10, TONER=9
    int maximum[MAX_JOBS][NUM_RESOURCES];
    int allocation[MAX_JOBS][NUM_RESOURCES];
    int need[MAX_JOBS][NUM_RESOURCES];
    int n_processes;
} BankersState;

typedef struct {
    char user[64];
    char doc[256];
    int priority;
    int pages;
} PipeMessage;

// Global State
extern JobQueue queue;
extern WorkerThread workers[NUM_WORKERS];
extern BankersState bankers;
extern int ipc_pipe[2];
extern int active_workers;
extern bool is_paused;

// Function Prototypes

// spooler.c
void init_queue();
void emit_json(const char *event, const char *json_data);
void emit_queue_update();
void emit_stats();
void emit_log(const char *msg);
void enqueue_job(PrintJob job);
void requeue_job(PrintJob job);
int dequeue_job();
void set_policy(int policy);
void reset_system();
void set_execution_state(int state);
void set_worker_count(int count);

// user.c
void submit_job(const char *user, const char *doc, int priority, int pages);
void process_pipe_message();

// printer.c
void init_workers();
void *worker_routine(void *arg);

// deadlock.c
void init_bankers();
bool request_resources(int job_id, int request[NUM_RESOURCES]);
void release_resources(int job_id, int release[NUM_RESOURCES]);
bool is_safe();
void run_safety_check();
bool can_job_run_safely(PrintJob job);

#endif // SPOOLER_H
