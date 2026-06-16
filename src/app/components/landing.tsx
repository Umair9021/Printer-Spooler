import { motion, useScroll, useTransform, useSpring, MotionValue } from "motion/react";
import { useRef } from "react";
import { ChevronDown, Printer, FileText, Cpu } from "lucide-react";
import { SmoothScroll, ScrollSpine, SceneNav, VelocityHud, Scramble, Counter, Magnetic } from "./scroll-fx";

/* ============ HERO ============ */
function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.85]);

  return (
    <section ref={ref} className="relative h-screen w-full text-[#f5ebe0] overflow-hidden">
      {/* parallax grid */}
      <motion.div
        style={{ y: useTransform(scrollYProgress, [0, 1], [0, -100]) }}
        className="absolute inset-0 opacity-[0.08]"
      >
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </motion.div>

      <motion.div style={{ y, opacity, scale }} className="relative h-full flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="font-mono text-[10px] tracking-[0.3em] text-[#8a7866] mb-6"
        >
          ◊ SYSTEM ONLINE
        </motion.div>

        <h1 className="font-mono text-center text-[14vw] md:text-[8vw] leading-none tracking-tighter">
          {"SPOOLER".split("").map((c, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 60, rotateX: -90 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ delay: 0.1 * i, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="inline-block"
              style={{ transformOrigin: "bottom" }}
            >
              {c}
            </motion.span>
          ))}
        </h1>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="h-px w-64 bg-[#e8a64d] mt-8 origin-left"
        />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
          className="font-mono text-xs tracking-[0.4em] text-[#a89580] mt-6"
        >
          QUEUE · SCHEDULE · PRINT
        </motion.div>

        {/* 3D rotating printer */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1, rotateY: [0, 360] }}
          transition={{
            opacity: { delay: 1.8, duration: 0.6 },
            scale: { delay: 1.8, duration: 0.6 },
            rotateY: { delay: 2.4, duration: 20, repeat: Infinity, ease: "linear" },
          }}
          className="mt-12"
          style={{ transformStyle: "preserve-3d", perspective: 800 }}
        >
          <Printer className="w-24 h-24 stroke-[1]" />
        </motion.div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 12, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="font-mono text-[10px] tracking-[0.3em] text-[#8a7866]">SCROLL</span>
        <ChevronDown className="w-4 h-4 text-[#8a7866]" />
      </motion.div>
    </section>
  );
}

/* ============ SCENE 2 — Chaos (sticky, scroll-linked) ============ */
function Chaos() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const prog = useSpring(scrollYProgress, { stiffness: 80, damping: 20 });

  const aliceY = useTransform(prog, [0, 0.4], [-100, 0]);
  const bobX = useTransform(prog, [0, 0.4], [-150, 0]);
  const carlosY = useTransform(prog, [0, 0.4], [100, 0]);

  const lineDraw = useTransform(prog, [0.3, 0.7], [0, 1]);
  const printerScale = useTransform(prog, [0.5, 1], [0.8, 1.2]);
  const printerShake = useTransform(prog, [0.7, 1], [0, 1]);
  const labelOpacity = useTransform(prog, [0.85, 1], [0, 1]);

  return (
    <section ref={ref} className="relative h-[300vh] text-[#f5ebe0]">
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
        <motion.div
          style={{ opacity: useTransform(prog, [0, 0.1, 0.95, 1], [0, 1, 1, 0]) }}
          className="absolute top-10 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-[0.3em] text-[#a89580]"
        >
          <Scramble text="SCENE 02 / THE PROBLEM" />
        </motion.div>

        <svg viewBox="0 0 800 500" className="w-full max-w-4xl px-4">
          {/* Users */}
          <motion.g style={{ y: aliceY }}>
            <rect x="40" y="60" width="160" height="60" fill="none" stroke="#f5ebe0" strokeWidth="1.5" />
            <text x="120" y="95" textAnchor="middle" className="font-mono" fontSize="14" fill="#f5ebe0">Alice</text>
          </motion.g>
          <motion.g style={{ x: bobX }}>
            <rect x="40" y="220" width="160" height="60" fill="none" stroke="#f5ebe0" strokeWidth="1.5" />
            <text x="120" y="255" textAnchor="middle" className="font-mono" fontSize="14" fill="#f5ebe0">Bob</text>
          </motion.g>
          <motion.g style={{ y: carlosY }}>
            <rect x="40" y="380" width="160" height="60" fill="none" stroke="#f5ebe0" strokeWidth="1.5" />
            <text x="120" y="415" textAnchor="middle" className="font-mono" fontSize="14" fill="#f5ebe0">Carlos</text>
          </motion.g>

          {/* Crossing lines that draw on scroll */}
          <motion.line x1="200" y1="90" x2="600" y2="250" stroke="#f5ebe0" strokeWidth="1.5" pathLength={lineDraw} style={{ pathLength: lineDraw }} />
          <motion.line x1="200" y1="250" x2="600" y2="250" stroke="#f5ebe0" strokeWidth="1.5" style={{ pathLength: lineDraw }} />
          <motion.line x1="200" y1="410" x2="600" y2="250" stroke="#f5ebe0" strokeWidth="1.5" style={{ pathLength: lineDraw }} />
          <motion.line x1="200" y1="90" x2="600" y2="410" stroke="#f5ebe0" strokeWidth="1" opacity="0.4" style={{ pathLength: lineDraw }} />
          <motion.line x1="200" y1="410" x2="600" y2="90" stroke="#f5ebe0" strokeWidth="1" opacity="0.4" style={{ pathLength: lineDraw }} />

          {/* Printer */}
          <motion.g style={{ scale: printerScale, originX: "600px", originY: "250px" }}>
            <motion.g
              animate={{ x: [0, -3, 3, -2, 2, 0] }}
              transition={{ repeat: Infinity, duration: 0.3 }}
              style={{ opacity: printerShake }}
            >
              <rect x="560" y="210" width="120" height="80" fill="transparent" stroke="#f5ebe0" strokeWidth="2" />
              <rect x="580" y="180" width="80" height="30" fill="transparent" stroke="#f5ebe0" strokeWidth="1.5" />
              <circle cx="660" cy="230" r="3" fill="#f5ebe0" />
            </motion.g>
          </motion.g>
        </svg>

        <motion.p
          style={{ opacity: labelOpacity }}
          className="absolute bottom-16 left-1/2 -translate-x-1/2 font-mono text-sm text-[#a89580] tracking-wide"
        >
          Multiple users. One printer. No order.
        </motion.p>
      </div>
    </section>
  );
}

/* ============ SCENE 3 — Solution (motion path) ============ */
function Solution() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const prog = useSpring(scrollYProgress, { stiffness: 60, damping: 20 });

  const queueOpacity = useTransform(prog, [0.1, 0.3], [0, 1]);
  const pathLen = useTransform(prog, [0.2, 0.6], [0, 1]);

  // Jobs follow path
  const j1 = useTransform(prog, [0.3, 0.55], [0, 1]);
  const j2 = useTransform(prog, [0.45, 0.7], [0, 1]);
  const j3 = useTransform(prog, [0.6, 0.85], [0, 1]);

  return (
    <section ref={ref} className="relative h-[300vh] text-[#f5ebe0]">
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        <motion.div className="absolute top-10 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-[0.3em] text-[#8a7866]">
          <Scramble text="SCENE 03 / ORDER" />
        </motion.div>

        <svg viewBox="0 0 900 500" className="w-full max-w-5xl px-4">
          {/* Users */}
          {["Alice", "Bob", "Carlos"].map((u, i) => (
            <g key={u}>
              <rect x="30" y={80 + i * 150} width="130" height="50" fill="none" stroke="#f5ebe0" strokeWidth="1" />
              <text x="95" y={110 + i * 150} textAnchor="middle" className="font-mono" fontSize="13" fill="#f5ebe0">{u}</text>
            </g>
          ))}

          {/* Motion paths (invisible curves jobs travel along) */}
          <path id="path1" d="M 160 105 Q 300 105 400 200 T 440 240" fill="none" stroke="none" />
          <path id="path2" d="M 160 255 L 440 255" fill="none" stroke="none" />
          <path id="path3" d="M 160 405 Q 300 405 400 310 T 440 270" fill="none" stroke="none" />

          {/* Visible faded path guides */}
          <motion.path d="M 160 105 Q 300 105 400 200 T 440 240" fill="none" stroke="#f5ebe0" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.3" style={{ pathLength: pathLen }} />
          <motion.path d="M 160 255 L 440 255" fill="none" stroke="#f5ebe0" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.3" style={{ pathLength: pathLen }} />
          <motion.path d="M 160 405 Q 300 405 400 310 T 440 270" fill="none" stroke="#f5ebe0" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.3" style={{ pathLength: pathLen }} />

          {/* Queue container */}
          <motion.g style={{ opacity: queueOpacity }}>
            <rect x="440" y="170" width="180" height="170" fill="none" stroke="#f5ebe0" strokeWidth="1.5" />
            <text x="530" y="160" textAnchor="middle" className="font-mono" fontSize="10" fill="#666">QUEUE</text>
            <rect x="455" y="185" width="150" height="40" fill="none" stroke="#f5ebe0" strokeWidth="0.8" opacity="0.4" />
            <rect x="455" y="235" width="150" height="40" fill="none" stroke="#f5ebe0" strokeWidth="0.8" opacity="0.4" />
            <rect x="455" y="285" width="150" height="40" fill="none" stroke="#f5ebe0" strokeWidth="0.8" opacity="0.4" />
          </motion.g>

          {/* Jobs travelling along paths */}
          <JobOnPath progress={j1} pathD="M 160 105 Q 300 105 400 200 T 440 240" label="HIGH" />
          <JobOnPath progress={j2} pathD="M 160 255 L 440 255" label="MED" />
          <JobOnPath progress={j3} pathD="M 160 405 Q 300 405 400 310 T 440 270" label="LOW" />

          {/* Arrow + printer */}
          <motion.line x1="620" y1="255" x2="730" y2="255" stroke="#f5ebe0" strokeWidth="1.5" style={{ pathLength: pathLen }} />
          <motion.polygon points="725,250 740,255 725,260" fill="#f5ebe0" style={{ opacity: pathLen }} />

          <g transform="translate(750,215)">
            <rect width="100" height="60" fill="none" stroke="#f5ebe0" strokeWidth="2" />
            <rect x="15" y="-25" width="70" height="25" fill="none" stroke="#f5ebe0" strokeWidth="1.5" />
            <circle cx="80" cy="20" r="3" fill="#e8a64d" />
          </g>
        </svg>

        <motion.p
          style={{ opacity: useTransform(prog, [0.8, 1], [0, 1]) }}
          className="absolute bottom-16 font-mono text-sm text-[#a89580] tracking-wide"
        >
          The spooler takes control.
        </motion.p>
      </div>
    </section>
  );
}

function JobOnPath({ progress, pathD, label }: { progress: MotionValue<number>; pathD: string; label: string }) {
  // Sample point on the path using JS path API via SVG marker pattern
  const pathRef = useRef<SVGPathElement>(null);
  const x = useTransform(progress, (p) => {
    if (!pathRef.current) return 0;
    const len = pathRef.current.getTotalLength();
    return pathRef.current.getPointAtLength(len * p).x;
  });
  const y = useTransform(progress, (p) => {
    if (!pathRef.current) return 0;
    const len = pathRef.current.getTotalLength();
    return pathRef.current.getPointAtLength(len * p).y;
  });
  const opacity = useTransform(progress, [0, 0.05, 0.95, 1], [0, 1, 1, 0]);
  return (
    <>
      <path ref={pathRef} d={pathD} fill="none" stroke="none" />
      <motion.g style={{ x, y, opacity }}>
        <rect x={-30} y={-12} width="60" height="24" fill="#1a1410" stroke="#e8a64d" strokeWidth="1" />
        <text x={0} y={4} textAnchor="middle" className="font-mono" fontSize="9" fill="#e8a64d">{label}</text>
      </motion.g>
    </>
  );
}

/* ============ SCENE 4 — Scheduling: Gantt timeline ============ */
function Scheduling() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const prog = useSpring(scrollYProgress, { stiffness: 60, damping: 20 });

  // 5 jobs with page counts (= execution units)
  const jobs = [
    { id: "J1", name: "report.pdf",  user: "Alice",  prio: 1, pages: 6 },
    { id: "J2", name: "invoice.pdf", user: "Bob",    prio: 3, pages: 2 },
    { id: "J3", name: "notes.txt",   user: "Carlos", prio: 2, pages: 4 },
    { id: "J4", name: "design.pdf",  user: "Dana",   prio: 1, pages: 3 },
    { id: "J5", name: "memo.docx",   user: "Eve",    prio: 3, pages: 5 },
  ];

  // Build three orderings (indexes into jobs[])
  const orderPriority = [...jobs].sort((a, b) => a.prio - b.prio || a.pages - b.pages).map((j) => j.id);
  const orderFCFS     = jobs.map((j) => j.id); // arrival order
  const orderSJF      = [...jobs].sort((a, b) => a.pages - b.pages).map((j) => j.id);

  // Compute start offset (in "units") for a given job in a given ordering
  const startIn = (order: string[], id: string) =>
    order.slice(0, order.indexOf(id)).reduce((sum, jid) => sum + jobs.find((j) => j.id === jid)!.pages, 0);

  const totalUnits = jobs.reduce((s, j) => s + j.pages, 0); // 20
  const UNIT = 36; // px per page

  // Three iterations: each third of scroll = one full sweep with a different policy
  const phase = useTransform(prog, (v) => (v < 1 / 3 ? 0 : v < 2 / 3 ? 1 : 2));
  const policyLabel = useTransform(phase, (p) => (p === 0 ? "PRIORITY" : p === 1 ? "FCFS" : "SJF"));
  const iterLabel = useTransform(phase, (p) => `ITER ${String(p + 1).padStart(2, "0")} / 03`);

  // Progress within the current iteration (0 → 1, resets at boundaries)
  const segProg = useTransform(prog, (v) => {
    const seg = v < 1 / 3 ? v * 3 : v < 2 / 3 ? (v - 1 / 3) * 3 : (v - 2 / 3) * 3;
    return Math.min(1, Math.max(0, seg));
  });

  // Sweep cursor resets at each iteration boundary
  const sweep = useTransform(segProg, (s) => s * totalUnits * UNIT);

  // Pre-computed layouts: chaotic start, then each policy
  const unsorted: Record<string, number> = { J1: 220, J2: 40, J3: 380, J4: 110, J5: 290 };
  const posPriority = Object.fromEntries(jobs.map((j) => [j.id, startIn(orderPriority, j.id) * UNIT]));
  const posFCFS = Object.fromEntries(jobs.map((j) => [j.id, startIn(orderFCFS, j.id) * UNIT]));
  const posSJF = Object.fromEntries(jobs.map((j) => [j.id, startIn(orderSJF, j.id) * UNIT]));
  const layouts = [unsorted, posPriority, posFCFS, posSJF];

  return (
    <section ref={ref} className="relative h-[300vh] text-[#f5ebe0]">
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden">
        <motion.div className="absolute top-10 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-[0.3em] text-[#a89580]">
          <Scramble text="SCENE 04 / SCHEDULING" />
        </motion.div>

        {/* Big morphing policy label */}
        <div className="flex items-baseline gap-4 mb-2">
          <span className="font-mono text-xs tracking-[0.3em] text-[#8a7866]">POLICY ::</span>
          <motion.h2 className="font-mono text-[12vw] md:text-[6vw] leading-none tracking-tighter text-[#e8a64d]">
            {policyLabel}
          </motion.h2>
        </div>

        {/* Policy tabs */}
        <div className="flex gap-10 mb-10 font-mono text-[10px] tracking-[0.3em]">
          {["PRIORITY", "FCFS", "SJF"].map((p, i) => {
            const op = useTransform(phase, (v) => (v === i ? 1 : 0.25));
            const scale = useTransform(phase, (v) => (v === i ? 1 : 0.9));
            return (
              <motion.div key={p} style={{ opacity: op, scale }} className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-[#e8a64d]" />
                {p}
              </motion.div>
            );
          })}
        </div>

        {/* Gantt chart */}
        <div className="relative w-full max-w-4xl px-6 scale-[0.55] sm:scale-75 md:scale-100 origin-top">
          {/* Time axis */}
          <div className="relative h-6 mb-2 ml-[100px] mr-6 border-b border-[#e8a64d]/20">
            {Array.from({ length: totalUnits + 1 }).map((_, i) => (
              <div
                key={i}
                className="absolute top-0 h-2 border-l border-[#e8a64d]/25"
                style={{ left: i * UNIT }}
              >
                {i % 4 === 0 && (
                  <span className="absolute top-2 -left-2 font-mono text-[9px] text-[#8a7866]">t{i}</span>
                )}
              </div>
            ))}
          </div>

          {/* Job rows */}
          <div className="relative ml-[100px] mr-6" style={{ height: jobs.length * 44 }}>
            {/* Sweeping execution cursor */}
            <motion.div
              style={{ x: sweep }}
              className="absolute top-0 bottom-0 w-px bg-[#e8a64d] z-20 pointer-events-none"
            >
              <div className="absolute -top-2 -left-[5px] w-[11px] h-[11px] rotate-45 bg-[#e8a64d]" />
              <div className="absolute -bottom-5 -left-6 font-mono text-[9px] text-[#e8a64d] tracking-widest whitespace-nowrap">
                NOW ▸
              </div>
            </motion.div>

            {jobs.map((j, row) => {
              const width = j.pages * UNIT;
              // As the sweep crosses each job's target, the job settles into place
              const x = useTransform([phase, segProg] as any, ([p, s]: any) => {
                const prev = layouts[p][j.id];
                const curr = layouts[p + 1][j.id];
                const target = curr / (totalUnits * UNIT); // 0..1, where this job belongs in the sweep
                const window = 0.18; // how long it takes a single bar to glide in
                const t = Math.min(1, Math.max(0, (s - target + window) / window));
                const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
                return prev + (curr - prev) * eased;
              });

              return (
                <div
                  key={j.id}
                  className="absolute left-0 right-0 flex items-center"
                  style={{ top: row * 44, height: 36 }}
                >
                  {/* Row label outside chart */}
                  <span className="absolute -left-[100px] w-[88px] font-mono text-[11px] text-[#a89580] flex justify-between">
                    <span className="text-[#e8a64d]">{j.id}</span>
                    <span>{j.user}</span>
                  </span>

                  {/* Background lane */}
                  <div className="absolute inset-y-0 left-0 right-0 border-b border-dashed border-[#e8a64d]/10" />

                  {/* Job bar — animates x as phase changes */}
                  <motion.div
                    style={{ x, width }}
                    className="absolute h-7 rounded-sm border border-[#e8a64d]/60 bg-[#e8a64d]/15 backdrop-blur-sm flex items-center px-2 font-mono text-[10px] text-[#f5ebe0] overflow-hidden"
                  >
                    <span className="truncate">{j.name}</span>
                    <span className="ml-auto text-[#e8a64d] tracking-widest pl-2">{j.pages}u</span>
                  </motion.div>
                </div>
              );
            })}
          </div>

          {/* Metrics row */}
          <div className="mt-12 ml-[100px] mr-6 flex justify-between font-mono text-[10px] tracking-[0.25em] text-[#8a7866]">
            <span>JOBS · 05</span>
            <span>UNITS · {totalUnits}</span>
            <motion.span className="text-[#e8a64d]">
              {iterLabel}
            </motion.span>
          </div>
        </div>

        {/* Footnote */}
        <p className="absolute bottom-10 left-1/2 -translate-x-1/2 font-mono text-xs text-[#a89580] tracking-wide">
          Same five jobs. Three policies. Watch the order rewrite itself.
        </p>
      </div>
    </section>
  );
}

/* ============ SCENE 5 — Threads (sticky stagger) ============ */
function Threads() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const prog = useSpring(scrollYProgress, { stiffness: 60, damping: 20 });

  return (
    <section ref={ref} className="relative h-[300vh] text-[#f5ebe0]">
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden">
        <motion.div className="absolute top-10 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-[0.3em] text-[#8a7866]">
          <Scramble text="SCENE 05 / WORKERS" />
        </motion.div>

        <h2 className="font-mono text-[8vw] md:text-[4vw] leading-none mb-16 tracking-tighter text-center">
          PARALLEL<br />THREADS
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl px-6">
          {[0, 1, 2].map((i) => {
            const start = 0.1 + i * 0.25;
            const end = start + 0.3;
            const active = useTransform(prog, [start, start + 0.05], [0, 1]);
            const fill = useTransform(prog, [start, end], [0, 1]);
            const borderColor = useTransform(active, (a) => `rgba(255,255,255,${0.15 + a * 0.85})`);
            const bg = useTransform(active, (a) => `rgba(255,255,255,${a * 0.04})`);
            return (
              <motion.div
                key={i}
                style={{ borderColor, backgroundColor: bg }}
                className="border rounded-md p-4 md:p-6 h-40 md:h-64 flex flex-col"
              >
                <div className="font-mono text-xs text-[#8a7866]">THREAD_0{i + 1}</div>
                <motion.div style={{ opacity: active, rotate: useTransform(prog, [start, end], [0, 360]) }} className="my-6 mx-auto">
                  <Cpu className="w-14 h-14 stroke-[1]" />
                </motion.div>
                <motion.div style={{ opacity: active }} className="font-mono text-xs text-center text-[#a89580] mb-3">
                  job_0{i + 1}.pdf
                </motion.div>
                <div className="h-px bg-[#f5ebe0]/10 mt-auto">
                  <motion.div style={{ scaleX: fill }} className="h-full bg-[#e8a64d] origin-left" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ============ SCENE 6 — Concepts (circular reveal + clockwise sweep) ============ */
function Concepts() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const prog = useSpring(scrollYProgress, { stiffness: 80, damping: 22 });

  const concepts = [
    { name: "Processes",  desc: "Isolated user jobs" },
    { name: "IPC Pipes",  desc: "Inter-process messaging" },
    { name: "Threads",    desc: "Parallel workers" },
    { name: "Mutex",      desc: "Queue safety" },
    { name: "Scheduling", desc: "Order policies" },
    { name: "Banker's",   desc: "Deadlock avoidance" },
  ];

  const R = 230;        // orbit radius
  const N = concepts.length;

  // Timing windows
  const FAN_END = 0.45;
  const HOLD_END = 0.55;
  const SWEEP_END = 1.0;

  // Clockwise sweep progress (0 → 1)
  const sweep = useTransform(prog, (v) => {
    if (v < HOLD_END) return 0;
    return Math.min(1, (v - HOLD_END) / (SWEEP_END - HOLD_END));
  });

  // Arrow head position on the circle
  const headAngle = useTransform(sweep, (s) => -90 + s * 360); // degrees, clockwise from top
  const headX = useTransform(headAngle, (a) => Math.cos((a * Math.PI) / 180) * R);
  const headY = useTransform(headAngle, (a) => Math.sin((a * Math.PI) / 180) * R);
  const headRot = useTransform(headAngle, (a) => a + 90); // arrow points along tangent

  return (
    <section ref={ref} className="relative h-[280vh] text-[#f5ebe0]">
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        <motion.div className="absolute top-10 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-[0.3em] text-[#a89580]">
          <Scramble text="SCENE 06 / FOUNDATION" />
        </motion.div>

        <div className="relative scale-[0.55] sm:scale-75 md:scale-100" style={{ width: 600, height: 600 }}>
          {/* Center label */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 flex flex-col items-center justify-center font-mono text-center pointer-events-none"
          >
            <span className="text-[10px] tracking-[0.4em] text-[#8a7866] mb-3">BUILT ON</span>
            <span className="text-3xl md:text-5xl tracking-tighter text-[#e8a64d]">REAL OS</span>
            <span className="text-[10px] tracking-[0.4em] text-[#8a7866] mt-3">PRIMITIVES</span>
          </motion.div>

          {/* Faint guide circle */}
          <svg className="absolute inset-0 w-full h-full" viewBox="-300 -300 600 600">
            <circle cx="0" cy="0" r={R} fill="none" stroke="#e8a64d" strokeOpacity="0.12" strokeDasharray="2 4" />

            {/* Clockwise sweep arc — drawn as two half-arcs starting from the top */}
            <motion.path
              d={`M 0 ${-R} A ${R} ${R} 0 0 1 0 ${R} A ${R} ${R} 0 0 1 0 ${-R}`}
              fill="none"
              stroke="#e8a64d"
              strokeWidth="2"
              strokeLinecap="round"
              style={{ pathLength: sweep }}
            />

            {/* Connector ticks at each concept point */}
            {concepts.map((_, i) => {
              const angle = -90 + (360 / N) * i;
              const cx = Math.cos((angle * Math.PI) / 180) * R;
              const cy = Math.sin((angle * Math.PI) / 180) * R;
              const lit = useTransform(sweep, (s) => (s >= i / N ? 1 : 0.25));
              return (
                <motion.circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r="5"
                  fill="#1a1410"
                  stroke="#e8a64d"
                  strokeWidth="1.5"
                  style={{ opacity: lit }}
                />
              );
            })}

            {/* Arrowhead following the sweep */}
            <motion.g style={{ x: headX, y: headY, rotate: headRot, opacity: sweep }}>
              <polygon points="0,-7 7,5 -7,5" fill="#e8a64d" />
            </motion.g>
          </svg>

          {/* Concept chips — fan out clockwise from center */}
          {concepts.map((c, i) => {
            const angle = -90 + (360 / N) * i;
            const tx = Math.cos((angle * Math.PI) / 180) * R;
            const ty = Math.sin((angle * Math.PI) / 180) * R;

            // Staggered fan-out in clockwise order
            const startT = (i / N) * FAN_END;
            const endT = startT + FAN_END / N + 0.05;
            const t = useTransform(prog, [startT, endT], [0, 1]);
            const x = useTransform(t, [0, 1], [0, tx]);
            const y = useTransform(t, [0, 1], [0, ty]);
            const op = useTransform(t, [0, 1], [0, 1]);
            const scale = useTransform(t, [0, 1], [0.6, 1]);

            // Highlight when the arrow's sweep reaches this concept
            const reached = useTransform(sweep, (s) => (s >= i / N ? 1 : 0));
            const chipBorder = useTransform(reached, (r) => (r ? "#e8a64d" : "rgba(232,166,77,0.4)"));
            const chipBg = useTransform(reached, (r) => (r ? "rgba(232,166,77,0.18)" : "rgba(26,20,16,0.8)"));

            return (
              <motion.div
                key={c.name}
                style={{ x, y, opacity: op, scale, left: "50%", top: "50%" }}
                className="absolute -translate-x-1/2 -translate-y-1/2 text-center w-36"
              >
                <motion.div
                  style={{ borderColor: chipBorder, backgroundColor: chipBg }}
                  className="inline-block border rounded-md px-3 py-2 font-mono text-xs backdrop-blur-sm text-[#e8a64d] transition-colors"
                >
                  {c.name}
                </motion.div>
                <div className="font-mono text-[10px] text-[#a89580] mt-1">{c.desc}</div>
                <div className="font-mono text-[9px] text-[#6b5d4f] mt-0.5 tracking-widest">
                  / {String(i + 1).padStart(2, "0")}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Status footer */}
        <motion.div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 font-mono text-[10px] tracking-[0.3em] text-[#a89580]">
          <motion.span className="w-1.5 h-1.5 rounded-full bg-[#e8a64d]" style={{ opacity: sweep }} />
          <motion.span>
            {useTransform(prog, (v) =>
              v < FAN_END ? "ASSEMBLING" : v < HOLD_END ? "READY" : v < SWEEP_END - 0.01 ? "TRAVERSING" : "COMPLETE"
            )}
          </motion.span>
        </motion.div>
      </div>
    </section>
  );
}

/* ============ SCENE 7 — CTA ============ */
function CTA({ onLaunch }: { onLaunch: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const scale = useTransform(scrollYProgress, [0, 1], [0.7, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);

  return (
    <section ref={ref} className="relative h-screen text-[#f5ebe0] flex flex-col items-center justify-center overflow-hidden">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute w-[600px] h-[600px] border border-[#e8a64d]/15 rounded-full"
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        className="absolute w-[400px] h-[400px] border border-[#e8a64d]/15 rounded-full"
      />

      <motion.div style={{ scale, opacity }} className="text-center px-6">
        <h2 className="font-mono text-[14vw] md:text-[8vw] leading-none tracking-tighter">
          SEE IT<br />LIVE.
        </h2>
        <p className="font-mono text-sm text-[#8a7866] mt-8 tracking-widest">
          SUBMIT · WATCH · FEEL
        </p>
        <div className="mt-12 flex justify-center">
          <Magnetic
            onClick={onLaunch}
            className="border border-[#e8a64d] text-[#e8a64d] rounded-md px-10 py-4 font-mono text-sm tracking-widest hover:bg-[#e8a64d] hover:text-[#1a1410] transition-colors duration-300"
          >
            LAUNCH DASHBOARD →
          </Magnetic>
        </div>

        <div className="mt-16 flex justify-center gap-12 font-mono text-xs">
          <div className="text-center">
            <div className="text-2xl text-[#f5ebe0]"><Counter to={128} /></div>
            <div className="text-[#8a7866] tracking-widest mt-1">JOBS</div>
          </div>
          <div className="text-center">
            <div className="text-2xl text-[#f5ebe0]"><Counter to={3} /></div>
            <div className="text-[#8a7866] tracking-widest mt-1">THREADS</div>
          </div>
          <div className="text-center">
            <div className="text-2xl text-[#f5ebe0]"><Counter to={99} suffix="%" /></div>
            <div className="text-[#8a7866] tracking-widest mt-1">UPTIME</div>
          </div>
        </div>

        <p className="font-mono text-[10px] text-[#6b5d4f] mt-12 tracking-widest">
          CUST OS LAB · SEMESTER IV
        </p>
      </motion.div>
    </section>
  );
}

/* ============ Progress rail ============ */
function ProgressRail() {
  const { scrollYProgress } = useScroll();
  const scale = useSpring(scrollYProgress, { stiffness: 100, damping: 20 });
  return (
    <motion.div
      style={{ scaleX: scale }}
      className="fixed top-0 left-0 right-0 h-[2px] bg-[#e8a64d] origin-left z-50 mix-blend-difference"
    />
  );
}

export function Landing({ onLaunch }: { onLaunch: () => void }) {
  return (
    <SmoothScroll>
      <div
        className="w-full relative text-[#f5ebe0]"
        style={{
          background:
            "linear-gradient(180deg, #1a1410 0%, #221913 25%, #2a1d14 50%, #221913 75%, #14100c 100%)",
        }}
      >
        <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
          <div
            className="absolute top-[5%] -left-1/4 w-[55vw] h-[55vw] rounded-full opacity-25 blur-3xl"
            style={{ background: "radial-gradient(circle, rgba(232,166,77,0.35), transparent 60%)" }}
          />
          <div
            className="absolute top-[60%] -right-1/4 w-[55vw] h-[55vw] rounded-full opacity-20 blur-3xl"
            style={{ background: "radial-gradient(circle, rgba(212,116,68,0.3), transparent 60%)" }}
          />
        </div>
        <ProgressRail />
        <ScrollSpine count={7} />
        <SceneNav />
        <VelocityHud />
        <div className="relative z-10">
          <Hero />
          <Chaos />
          <Solution />
          <Scheduling />
          <Threads />
          <Concepts />
          <CTA onLaunch={onLaunch} />
        </div>
      </div>
    </SmoothScroll>
  );
}
