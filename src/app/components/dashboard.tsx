import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Cpu, Printer, Moon, Sun, ArrowLeft, RotateCcw, Shield, LayoutDashboard } from "lucide-react";
import { useTheme } from "./theme-context";

type Priority = "High" | "Medium" | "Low";
type Job = { id: number; name: string; user: string; priority: Priority; pages: number };
type Thread = { id: number; job: Job | null; progress: number };
type Policy = "Priority" | "FCFS" | "SJF";

const USERS = ["Alice", "Bob", "Carlos", "Dana"];
const priorityWeightInv: Record<Priority, number> = { Low: 1, Medium: 2, High: 3 };
const numToPrio: Record<number, Priority> = { 1: "Low", 2: "Medium", 3: "High" };

/* ============ Banker's ============ */
const RESOURCES = ["INK", "PAPER", "TONER"] as const;
const TOTAL = [12, 10, 9];

type BankProc = { id: string; label: string; alloc: number[]; max: number[] };

function jobsToBankProcs(jobs: Job[], threads: Thread[]): BankProc[] {
  const procs: BankProc[] = [];
  const seen = new Set<number>();
  threads.forEach((th) => {
    if (th.job) {
      const j = th.job;
      seen.add(j.id);
      const ink = priorityWeightInv[j.priority];
      const paper = Math.floor(j.pages / 2) + 1;
      const toner = Math.floor(j.pages / 3) + 1;
      const max = [ink, paper, toner];
      const ratio = th.progress / 100;
      procs.push({
        id: `J${j.id}`,
        label: `${j.name} · T${th.id}`,
        max,
        alloc: max.map((m) => Math.floor(m * ratio)),
      });
    }
  });
  jobs.forEach((j) => {
    if (seen.has(j.id)) return;
    const ink = priorityWeightInv[j.priority];
    const paper = Math.floor(j.pages / 2) + 1;
    const toner = Math.floor(j.pages / 3) + 1;
    procs.push({
      id: `J${j.id}`,
      label: `${j.name} · queued`,
      max: [ink, paper, toner],
      alloc: [0, 0, 0],
    });
  });
  return procs;
}

function bankersCheck(procs: BankProc[], total: number[]) {
  const allocSum = procs.reduce((s, p) => p.alloc.map((a, i) => a + s[i]), [0, 0, 0]);
  const available = total.map((t, i) => Math.max(0, t - allocSum[i]));
  const need = procs.map((p) => p.max.map((m, i) => Math.max(0, m - p.alloc[i])));
  const finished = procs.map(() => false);
  const work = [...available];
  const sequence: string[] = [];
  let made = true;
  while (made) {
    made = false;
    for (let i = 0; i < procs.length; i++) {
      if (!finished[i] && need[i].every((n, j) => n <= work[j])) {
        for (let j = 0; j < work.length; j++) work[j] += procs[i].alloc[j];
        finished[i] = true;
        sequence.push(procs[i].id);
        made = true;
      }
    }
  }
  return { safe: finished.every(Boolean), sequence, available, need };
}

/* ============ Dashboard ============ */
export function Dashboard({ onBack }: { onBack: () => void }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  const ws = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);

  const [view, setView] = useState<"main" | "bankers">("main");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [allJobs, setAllJobs] = useState<Record<number, Job>>({});
  const [threads, setThreads] = useState<Thread[]>([
    { id: 1, job: null, progress: 0 },
    { id: 2, job: null, progress: 0 },
    { id: 3, job: null, progress: 0 },
  ]);
  const [logs, setLogs] = useState<{ t: string; m: string }[]>([{ t: "00:00:00", m: "spooler.sys connecting..." }]);
  const [history, setHistory] = useState<{ order: number; name: string; user: string; thread: number; at: string }[]>([]);
  const [policy, setPolicy] = useState<Policy>("Priority");
  const [stats, setStats] = useState({ submitted: 0, printed: 0 });
  const [uptime, setUptime] = useState(0);
  const [running, setRunning] = useState(false);
  const [workerCount, setWorkerCount] = useState(3);

  // submit form
  const [user, setUser] = useState(USERS[0]);
  const [docName, setDocName] = useState("");
  const [prio, setPrio] = useState<Priority>("Medium");
  const [pages, setPages] = useState(5);

  const logEnd = useRef<HTMLDivElement>(null);

  // Softer B&W palette
  const t = isDark
    ? { bg: "#0b0b0d", fg: "#f5f5f5", mut: "#7a7a7a", border: "#262628", surf: "#141416", lift: "#1c1c1f", accent: "#fafafa" }
    : { bg: "#f7f7f8", fg: "#0e0e10", mut: "#6b6b6f", border: "#dedee2", surf: "#ffffff", lift: "#efeff2", accent: "#0e0e10" };

  const addLog = (m: string) => {
    const ts = new Date().toTimeString().slice(0, 8);
    setLogs((l) => [...l.slice(-80), { t: ts, m }]);
  };

  useEffect(() => {
    const i = setInterval(() => setUptime((u) => u + 1), 1000);
    return () => clearInterval(i);
  }, []);

  // WebSocket Connection
  useEffect(() => {
    const wsUrl = import.meta.env.VITE_WS_URL || "ws://localhost:8765";
    const socket = new WebSocket(wsUrl);
    ws.current = socket;

    socket.onopen = () => {
      setConnected(true);
      addLog("connected to backend");
    };
    socket.onclose = () => {
      setConnected(false);
      addLog("disconnected from backend");
    };
    
    socket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        const data = msg.data;
        
        if (msg.event === "QUEUE_UPDATE") {
           const parsedJobs = Array.isArray(data) ? data.map((j: any) => ({
              id: j.id,
              name: j.doc,
              user: j.user,
              priority: numToPrio[j.priority] || "Low",
              pages: j.pages
           })) : [];
           setJobs(parsedJobs);
           setAllJobs(prev => {
              const next = { ...prev };
              parsedJobs.forEach((j: Job) => { next[j.id] = j; });
              return next;
           });
        } else if (msg.event === "STATS") {
           setStats({ submitted: data.submitted, printed: data.printed });
           if (data.is_paused !== undefined) setRunning(data.is_paused === "false");
           if (data.active_workers !== undefined) setWorkerCount(data.active_workers);
        } else if (msg.event === "LOG") {
           addLog(data.msg);
        } else if (msg.event === "JOB_SUBMITTED") {
           setAllJobs(prev => ({
              ...prev,
              [data.id]: {
                 id: data.id,
                 name: data.doc,
                 user: data.user,
                 priority: numToPrio[data.priority] || "Low",
                 pages: data.pages
              }
           }));
        } else if (msg.event === "DEADLOCK") {
           addLog(data.msg);
        } else if (msg.event === "JOB_STARTED") {
           setAllJobs(prevAll => {
              const j = prevAll[data.job_id] || { id: data.job_id, name: data.doc, user: "Unknown", priority: "Low", pages: 5 };
              setThreads(prev => {
                const existing = prev.find(t => t.id === data.thread);
                if (existing) return prev.map(t => t.id === data.thread ? { ...t, job: j, progress: 0 } : t);
                return [...prev, { id: data.thread, job: j, progress: 0 }].sort((a, b) => a.id - b.id);
              });
              return prevAll;
           });
        } else if (msg.event === "JOB_PROGRESS") {
           setThreads(prev => prev.map(t => t.id === data.thread ? { ...t, progress: data.progress } : t));
        } else if (msg.event === "JOB_DONE") {
           setThreads(prev => prev.map(t => t.id === data.thread ? { ...t, job: null, progress: 100 } : t));
           setAllJobs(prevAll => {
              const j = prevAll[data.job_id];
              setHistory(prev => [...prev, {
                 order: prev.length + 1,
                 name: data.doc,
                 user: j?.user || "Unknown",
                 thread: data.thread,
                 at: new Date().toTimeString().slice(0, 8)
              }]);
              return prevAll;
           });
        }
      } catch (e) {
        console.error("WS Parse Error", e);
      }
    };

    return () => socket.close();
  }, []);

  useEffect(() => { logEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [logs]);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!docName.trim()) return;
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({
        cmd: "SUBMIT_JOB",
        user,
        doc: docName,
        priority: prio,
        pages
      }));
    }
    setDocName("");
  };

  const reset = () => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ cmd: "RESET" }));
    }
    setHistory([]);
  };

  const changePolicy = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPolicy = e.target.value as Policy;
    setPolicy(newPolicy);
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ cmd: "SET_POLICY", policy: newPolicy.toLowerCase() }));
    }
  };

  const runSafety = () => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ cmd: "RUN_SAFETY" }));
    }
  };

  const toggleRunning = () => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ cmd: "SET_EXECUTION", running: !running }));
    }
  };

  const changeWorkers = (count: number) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ cmd: "SET_WORKERS", count }));
    }
  };

  const fmt = (s: number) =>
    `${String(Math.floor(s / 3600)).padStart(2, "0")}:${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const active = threads.filter((th) => th.job).length;

  const btn = `border rounded px-3 py-1.5 text-xs transition hover:opacity-80 flex items-center gap-1.5`;
  const input = `border rounded px-2 py-1.5 text-xs w-full bg-transparent`;
  const prioStyle = (p: Priority) => p === "High"
    ? { borderColor: t.fg, color: t.fg, background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)" }
    : p === "Medium"
    ? { borderColor: t.mut, color: t.fg }
    : { borderColor: t.border, color: t.mut };

  return (
    <div className="min-h-screen w-full font-mono" style={{ background: t.bg, color: t.fg }}>
      <div className="max-w-5xl mx-auto p-4 md:p-6 flex flex-col gap-4">
        {/* Header */}
        <header className="flex items-center justify-between border rounded px-3 py-2" style={{ borderColor: t.border, background: t.surf }}>
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="opacity-60 hover:opacity-100"><ArrowLeft className="w-4 h-4" /></button>
            <span className="text-sm">spooler.sys<motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }}>_</motion.span></span>
            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} title={connected ? "Connected" : "Disconnected"} />
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setView(view === "main" ? "bankers" : "main")} className={btn} style={{ borderColor: t.border, color: t.fg }}>
              {view === "main" ? <><Shield className="w-3 h-3" /> BANKER'S</> : <><LayoutDashboard className="w-3 h-3" /> SPOOLER</>}
            </button>
            <button onClick={toggle} className={btn} style={{ borderColor: t.border, color: t.fg }}>
              {isDark ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {view === "main" ? (
            <motion.div key="main" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-4">

              {/* Stats strip */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Stat label="SUBMITTED" value={stats.submitted} t={t} />
                <Stat label="PRINTED" value={stats.printed} t={t} />
                <Stat label="ACTIVE" value={`${active}/${threads.length}`} t={t} />
                <Stat label="UPTIME" value={fmt(uptime)} t={t} />
              </div>

              {/* Submit form */}
              <form onSubmit={submit} className="border rounded p-3 grid grid-cols-1 md:grid-cols-12 gap-2 items-end" style={{ borderColor: t.border, background: t.surf }}>
                <Field label="USER" t={t} className="md:col-span-2">
                  <select value={user} onChange={(e) => setUser(e.target.value)} className={input} style={{ borderColor: t.border, color: t.fg }}>
                    {USERS.map((u) => <option key={u} style={{ background: t.bg, color: t.fg }}>{u}</option>)}
                  </select>
                </Field>
                <Field label="DOCUMENT" t={t} className="md:col-span-4">
                  <input value={docName} onChange={(e) => setDocName(e.target.value)} placeholder="report.pdf" className={input} style={{ borderColor: t.border, color: t.fg }} />
                </Field>
                <Field label="PRIORITY" t={t} className="md:col-span-2">
                  <select value={prio} onChange={(e) => setPrio(e.target.value as Priority)} className={input} style={{ borderColor: t.border, color: t.fg }}>
                    {(["High", "Medium", "Low"] as Priority[]).map((p) => <option key={p} style={{ background: t.bg, color: t.fg }}>{p}</option>)}
                  </select>
                </Field>
                <Field label="PAGES" t={t} className="md:col-span-1">
                  <input type="number" min={1} value={pages} onChange={(e) => setPages(+e.target.value)} className={input} style={{ borderColor: t.border, color: t.fg }} />
                </Field>
                <button type="submit" disabled={!connected} className={`${btn} md:col-span-2 justify-center disabled:opacity-30`} style={{ borderColor: t.fg, color: t.fg }}>ADD</button>
                <div className="md:col-span-1 flex gap-2 justify-end">
                  <button type="button" onClick={reset} disabled={!connected} className={btn} style={{ borderColor: t.border, color: t.fg }}>
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </div>
              </form>

              {/* Queue + Threads */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Queue */}
                <div className="border rounded p-3" style={{ borderColor: t.border, background: t.surf }}>
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[11px] tracking-widest">QUEUE · {jobs.length}</h3>
                      <button onClick={toggleRunning} disabled={!connected} className="px-2 py-0.5 rounded text-[9px] tracking-widest border transition" style={{ borderColor: running ? t.fg : t.border, background: running ? t.lift : 'transparent' }}>
                        {running ? "PAUSE" : "EXECUTE"}
                      </button>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] tracking-widest" style={{ color: t.mut }}>POLICY</span>
                      <select value={policy} onChange={changePolicy} disabled={!connected}
                        className="border rounded px-2 py-0.5 text-[10px] bg-transparent" style={{ borderColor: t.border, color: t.fg }}>
                        <option value="Priority" style={{ background: t.bg, color: t.fg }}>Priority</option>
                        <option value="FCFS" style={{ background: t.bg, color: t.fg }}>FCFS</option>
                        <option value="SJF" style={{ background: t.bg, color: t.fg }}>SJF</option>
                      </select>
                    </div>
                  </div>
                  {jobs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-2 opacity-40">
                      <Printer className="w-8 h-8 stroke-[1]" />
                      <span className="text-[10px] tracking-widest">EMPTY</span>
                    </div>
                  ) : (
                    <ul className="flex flex-col gap-1.5 max-h-[240px] overflow-y-auto pr-1">
                      <AnimatePresence>
                        {jobs.map((j, idx) => (
                          <motion.li
                            key={j.id}
                            layout
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 8 }}
                            transition={{ type: "spring", stiffness: 200, damping: 25 }}
                            className="flex items-center gap-3 px-2 py-1.5 rounded border-l-2"
                            style={{ background: t.lift, borderLeftColor: t.fg }}
                          >
                            <span className="text-[10px] w-5" style={{ color: t.mut }}>{String(idx + 1).padStart(2, "0")}</span>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs truncate">{j.name}</div>
                              <div className="text-[10px]" style={{ color: t.mut }}>{j.user} · {j.pages}p</div>
                            </div>
                            <span className="text-[9px] px-2 py-0.5 rounded border tracking-widest uppercase"
                              style={prioStyle(j.priority)}>{j.priority}</span>
                          </motion.li>
                        ))}
                      </AnimatePresence>
                    </ul>
                  )}
                </div>

                {/* Threads */}
                <div className="border rounded p-3" style={{ borderColor: t.border, background: t.surf }}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-[11px] tracking-widest">WORKER THREADS · {workerCount}</h3>
                    <div className="flex gap-1">
                      <button onClick={() => changeWorkers(workerCount - 1)} disabled={workerCount <= 1 || !connected} className="border rounded px-2 py-0.5 text-[10px]" style={{ borderColor: t.border }}>-</button>
                      <button onClick={() => changeWorkers(workerCount + 1)} disabled={workerCount >= 5 || !connected} className="border rounded px-2 py-0.5 text-[10px]" style={{ borderColor: t.border }}>+</button>
                    </div>
                  </div>
                  <div className={`grid gap-2 grid-cols-3`}>
                    {Array.from({ length: workerCount }, (_, i) => {
                      const id = i + 1;
                      const th = threads.find(t => t.id === id) || { id, job: null, progress: 0 };
                      const isActive = !!th.job;
                      return (
                        <motion.div
                          key={th.id}
                          animate={isActive ? { borderColor: [t.border, t.fg, t.border] } : {}}
                          transition={isActive ? { repeat: Infinity, duration: 1.5 } : {}}
                          className="border rounded p-2 flex flex-col items-center"
                          style={{ borderColor: isActive ? undefined : t.border, background: isActive ? t.lift : "transparent" }}
                        >
                          <div className="text-[9px] tracking-widest" style={{ color: t.mut }}>T0{th.id}</div>
                          <Cpu className="w-6 h-6 stroke-[1] my-2" style={{ opacity: isActive ? 1 : 0.35 }} />
                          <div className="text-[9px] tracking-widest text-center">{isActive ? "RUN" : "IDLE"}</div>
                          <div className="text-[9px] mt-1 text-center truncate w-full" style={{ color: t.mut }}>{th.job?.name ?? "—"}</div>
                          <div className="h-1 w-full mt-2 rounded-full overflow-hidden" style={{ background: t.border }}>
                            <div className="h-full" style={{ width: `${th.progress}%`, background: t.fg, transition: "width 200ms linear" }} />
                          </div>
                          <div className="text-[9px] mt-1" style={{ color: t.mut }}>{Math.round(th.progress)}%</div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Printing order + Log */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded p-3" style={{ borderColor: t.border, background: t.surf }}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-[11px] tracking-widest">PRINTING ORDER · {history.length}</h3>
                    <span className="text-[9px] tracking-widest" style={{ color: t.mut }}>COMPLETED</span>
                  </div>
                  {history.length === 0 ? (
                    <div className="flex items-center justify-center h-32 text-[10px] tracking-widest opacity-40">
                      NOTHING PRINTED YET
                    </div>
                  ) : (
                    <div className="h-32 overflow-y-auto pr-1 flex items-center flex-wrap gap-2 py-1">
                      <AnimatePresence initial={false}>
                        {history.map((h, i) => (
                          <span key={h.order} className="flex items-center gap-2">
                            <motion.span
                              initial={{ opacity: 0, scale: 0.8, x: -4 }}
                              animate={{ opacity: 1, scale: 1, x: 0 }}
                              transition={{ type: "spring", stiffness: 220, damping: 22 }}
                              title={`${h.name} · ${h.user} · T0${h.thread} · ${h.at}`}
                              className="px-2.5 py-1 border rounded text-[11px]"
                              style={{ borderColor: t.fg, background: t.lift }}
                            >
                              {h.name}
                            </motion.span>
                            {i < history.length - 1 && <span style={{ color: t.mut }}>→</span>}
                          </span>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </div>

                <div className="border rounded p-3" style={{ borderColor: t.border, background: t.surf }}>
                  <h3 className="text-[11px] tracking-widest mb-2">SYSTEM LOG</h3>
                  <div className="h-32 overflow-y-auto text-[11px] rounded px-2 py-1" style={{ background: t.lift }}>
                    <AnimatePresence initial={false}>
                      {logs.slice(-50).map((l, i) => (
                        <motion.div key={`${l.t}-${i}`} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3 py-0.5">
                          <span style={{ color: t.mut }}>{l.t}</span>
                          <span>{l.m}</span>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    <div ref={logEnd} />
                  </div>
                </div>
              </div>

            </motion.div>
          ) : (
            <BankersView key="bankers" t={t} jobs={jobs} threads={threads} onRun={runSafety} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ============ Bankers view ============ */
function BankersView({ t, jobs, threads, onRun }: { t: any; jobs: Job[]; threads: Thread[]; onRun: () => void }) {
  const [step, setStep] = useState(-1);
  const [running, setRunning] = useState(false);

  const procs = useMemo(() => jobsToBankProcs(jobs, threads), [jobs, threads]);
  const bank = useMemo(() => bankersCheck(procs, TOTAL), [procs]);

  useEffect(() => { setStep(-1); }, [procs.length]);

  const run = async () => {
    if (running || procs.length === 0) return;
    setRunning(true);
    setStep(-1);
    onRun(); // also send to backend just so it logs
    for (let i = 0; i < bank.sequence.length; i++) {
      await new Promise((r) => setTimeout(r, 500));
      setStep(i);
    }
    setRunning(false);
  };

  const reset = () => setStep(-1);

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col gap-4">
      <div className="border rounded p-4" style={{ borderColor: t.border, background: t.surf }}>
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm tracking-widest mb-1">BANKER'S ALGORITHM</h2>
            <p className="text-[11px]" style={{ color: t.mut }}>
              Live check on {procs.length} job{procs.length === 1 ? "" : "s"}. Add jobs in the spooler view to see them appear here.
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={reset} className="border rounded px-3 py-1.5 text-xs flex items-center gap-1.5 transition hover:opacity-80" style={{ borderColor: t.border, color: t.fg }}>
              <RotateCcw className="w-3 h-3" /> RESET
            </button>
            <button onClick={run} disabled={running || procs.length === 0} className="border rounded px-3 py-1.5 text-xs flex items-center gap-1.5 disabled:opacity-40" style={{ borderColor: t.fg, color: t.fg }}>
              <Shield className="w-3 h-3" /> {running ? "CHECKING…" : "RUN SAFETY CHECK"}
            </button>
          </div>
        </div>

        {/* Available resources */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {RESOURCES.map((r, i) => (
            <div key={r} className="border rounded p-3" style={{ borderColor: t.border, background: t.lift }}>
              <div className="text-[10px] tracking-widest" style={{ color: t.mut }}>{r}</div>
              <div className="text-2xl mt-1">{bank.available[i]} <span className="text-xs" style={{ color: t.mut }}>/ {TOTAL[i]}</span></div>
              <div className="h-1 mt-2 rounded-full overflow-hidden" style={{ background: t.border }}>
                <div className="h-full" style={{ width: `${(bank.available[i] / TOTAL[i]) * 100}%`, background: t.fg }} />
              </div>
            </div>
          ))}
        </div>

        {/* Matrix */}
        {procs.length === 0 ? (
          <div className="border rounded p-10 text-center text-xs" style={{ borderColor: t.border, color: t.mut }}>
            No jobs in system. Submit some from the spooler view, then return here to run the safety check.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead>
                  <tr style={{ color: t.mut }}>
                    <th className="text-left py-1 pr-2">PID</th>
                    <th className="text-left pr-2">JOB</th>
                    <th colSpan={3} className="text-center border-l" style={{ borderColor: t.border }}>ALLOC</th>
                    <th colSpan={3} className="text-center border-l" style={{ borderColor: t.border }}>MAX</th>
                    <th colSpan={3} className="text-center border-l" style={{ borderColor: t.border }}>NEED</th>
                    <th className="text-center border-l pl-2" style={{ borderColor: t.border }}>SEQ</th>
                  </tr>
                  <tr style={{ color: t.mut }}>
                    <th></th><th></th>
                    {[...RESOURCES, ...RESOURCES, ...RESOURCES].map((r, i) => (
                      <th key={i} className={`text-center px-1 ${i % 3 === 0 ? "border-l" : ""}`} style={{ borderColor: t.border }}>{r[0]}</th>
                    ))}
                    <th className="border-l" style={{ borderColor: t.border }}></th>
                  </tr>
                </thead>
                <tbody>
                  {procs.map((p, i) => {
                    const seqIdx = bank.sequence.indexOf(p.id);
                    const reached = step >= 0 && seqIdx >= 0 && seqIdx <= step;
                    return (
                      <motion.tr
                        key={p.id}
                        animate={{ backgroundColor: reached ? t.lift : "rgba(0,0,0,0)" }}
                        transition={{ duration: 0.4 }}
                        className="border-t"
                        style={{ borderColor: t.border }}
                      >
                        <td className="py-2 pr-2">{p.id}</td>
                        <td className="pr-2 truncate max-w-[160px]" style={{ color: t.mut }}>{p.label}</td>
                        {p.alloc.map((a, j) => <td key={`a${j}`} className={`text-center px-1 ${j === 0 ? "border-l" : ""}`} style={{ borderColor: t.border }}>{a}</td>)}
                        {p.max.map((m, j) => <td key={`m${j}`} className={`text-center px-1 ${j === 0 ? "border-l" : ""}`} style={{ borderColor: t.border }}>{m}</td>)}
                        {bank.need[i].map((n, j) => <td key={`n${j}`} className={`text-center px-1 ${j === 0 ? "border-l" : ""}`} style={{ borderColor: t.border, color: t.mut }}>{n}</td>)}
                        <td className="text-center border-l pl-2" style={{ borderColor: t.border }}>
                          <AnimatePresence>
                            {reached && (
                              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                                className="inline-block px-2 py-0.5 border rounded" style={{ borderColor: t.fg }}>
                                {seqIdx + 1}
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Status + sequence */}
            <div className="mt-5 flex flex-col gap-2">
              <div className="text-[10px] tracking-widest" style={{ color: t.mut }}>
                STATE · <span style={{ color: t.fg }}>{bank.safe ? "SAFE" : "UNSAFE"}</span>
              </div>
              {step >= 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  {bank.sequence.slice(0, step + 1).map((id, i) => (
                    <span key={id} className="flex items-center gap-1">
                      <motion.span initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }}
                        className="px-2 py-0.5 border rounded text-xs" style={{ borderColor: t.fg, background: t.lift }}>{id}</motion.span>
                      {i < step && <span style={{ color: t.mut }}>→</span>}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}

/* ============ Helpers ============ */
function Stat({ label, value, t }: { label: string; value: number | string; t: any }) {
  return (
    <div className="border rounded p-3" style={{ borderColor: t.border, background: t.surf }}>
      <div className="text-xl">{value}</div>
      <div className="text-[10px] tracking-widest mt-0.5" style={{ color: t.mut }}>{label}</div>
    </div>
  );
}

function Field({ label, children, t, className = "" }: { label: string; children: React.ReactNode; t: any; className?: string }) {
  return (
    <div className={className}>
      <label className="text-[9px] tracking-widest block mb-1" style={{ color: t.mut }}>{label}</label>
      {children}
    </div>
  );
}
