import { useEffect, useState, useRef, ReactNode } from "react";
import { motion, useScroll, useSpring, useTransform, useVelocity, useMotionValueEvent } from "motion/react";
import Lenis from "lenis";

/* ===== Lenis smooth scroll ===== */
export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.3,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.2,
    });
    let raf: number;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);
  return <>{children}</>;
}

/* ===== Vertical spine connecting every scene ===== */
export function ScrollSpine({ count = 7 }: { count?: number }) {
  const { scrollYProgress } = useScroll();
  const fill = useSpring(scrollYProgress, { stiffness: 80, damping: 20 });
  return (
    <div className="fixed left-4 md:left-8 top-0 bottom-0 w-px pointer-events-none z-40 mix-blend-difference">
      <div className="absolute inset-0 bg-white/15" />
      <motion.div style={{ scaleY: fill }} className="absolute inset-0 bg-white origin-top" />
      <div className="absolute inset-0 flex flex-col justify-between py-[10vh]">
        {Array.from({ length: count }).map((_, i) => {
          const stop = i / (count - 1);
          const startOffset = Math.max(0, stop - 0.05);
          const lit = useTransform(scrollYProgress, [startOffset, stop], [0.2, 1]);
          return (
            <motion.div
              key={i}
              style={{ opacity: lit }}
              className="-translate-x-[3px] w-[7px] h-[7px] rounded-full border border-white bg-black"
            />
          );
        })}
      </div>
    </div>
  );
}

/* ===== Right-side scene navigator ===== */
const SCENES = ["HERO", "PROBLEM", "ORDER", "SCHEDULE", "WORKERS", "FOUNDATION", "LAUNCH"];

export function SceneNav() {
  const { scrollYProgress } = useScroll();
  const [active, setActive] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setActive(Math.min(SCENES.length - 1, Math.floor(v * SCENES.length)));
  });
  return (
    <div className="fixed right-6 md:right-10 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col gap-4 mix-blend-difference">
      {SCENES.map((s, i) => (
        <div key={s} className="flex items-center gap-3 justify-end">
          <motion.span
            animate={{ opacity: active === i ? 1 : 0, x: active === i ? 0 : 8 }}
            transition={{ duration: 0.4 }}
            className="font-mono text-[9px] tracking-[0.3em] text-white"
          >
            {String(i + 1).padStart(2, "0")} · {s}
          </motion.span>
          <motion.div
            animate={{ scale: active === i ? 1.3 : 1, opacity: active === i ? 1 : 0.35 }}
            transition={{ duration: 0.4 }}
            className="w-1.5 h-1.5 rounded-full bg-white"
          />
        </div>
      ))}
    </div>
  );
}

/* ===== Scroll-velocity HUD (top-right) ===== */
export function VelocityHud() {
  const { scrollY } = useScroll();
  const v = useVelocity(scrollY);
  const smooth = useSpring(v, { stiffness: 200, damping: 30 });
  const [vel, setVel] = useState(0);
  useMotionValueEvent(smooth, "change", (x) => setVel(Math.abs(x)));
  return (
    <div className="fixed top-6 right-6 md:right-10 z-40 font-mono text-[10px] tracking-[0.25em] text-white mix-blend-difference hidden md:flex items-center gap-3">
      <motion.span
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ repeat: Infinity, duration: 1.4 }}
        className="w-1.5 h-1.5 rounded-full bg-white"
      />
      <span>VEL {String(Math.round(vel)).padStart(4, "0")}px/s</span>
    </div>
  );
}

/* ===== Velocity-driven skew wrapper ===== */
export function VelocitySkew({ children }: { children: ReactNode }) {
  const { scrollY } = useScroll();
  const v = useVelocity(scrollY);
  const smooth = useSpring(v, { stiffness: 120, damping: 30 });
  const skewY = useTransform(smooth, [-2000, 0, 2000], [3, 0, -3]);
  return <motion.div style={{ skewY }}>{children}</motion.div>;
}

/* ===== Text scramble label ===== */
const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/·";

export function Scramble({ text, className = "" }: { text: string; className?: string }) {
  const [out, setOut] = useState(text);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            let frame = 0;
            const total = 18;
            const id = setInterval(() => {
              frame++;
              const reveal = Math.floor((frame / total) * text.length);
              const scrambled = text
                .split("")
                .map((c, i) => (i < reveal || c === " " || c === "·" ? c : CHARS[Math.floor(Math.random() * CHARS.length)]))
                .join("");
              setOut(scrambled);
              if (frame >= total) {
                clearInterval(id);
                setOut(text);
              }
            }, 35);
          }
        });
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [text]);
  return <span ref={ref} className={className}>{out}</span>;
}

/* ===== Animated counter ===== */
export function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [val, setVal] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const start = performance.now();
          const dur = 1600;
          const tick = (t: number) => {
            const p = Math.min(1, (t - start) / dur);
            const eased = 1 - Math.pow(1 - p, 3);
            setVal(Math.floor(eased * to));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          io.disconnect();
        }
      });
    });
    io.observe(el);
    return () => io.disconnect();
  }, [to]);
  return <span ref={ref}>{val}{suffix}</span>;
}

/* ===== Magnetic button ===== */
export function Magnetic({ children, className = "", onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      onMouseMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        setPos({ x: (e.clientX - r.left - r.width / 2) * 0.3, y: (e.clientY - r.top - r.height / 2) * 0.3 });
      }}
      onMouseLeave={() => setPos({ x: 0, y: 0 })}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: "spring", stiffness: 200, damping: 18 }}
      className={className}
    >
      {children}
    </motion.button>
  );
}
