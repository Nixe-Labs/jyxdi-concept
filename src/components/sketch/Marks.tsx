"use client";
/* Red-pencil marks in the margins: circles, underlines and arrows that draw
   themselves when they scroll into view. Shapes are generated from a seed, so
   every mark wobbles a little differently but renders the same on server and client. */
import { useEffect, useRef, useState } from "react";

function rng(seed: string) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) { h = Math.imul(h ^ seed.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
  return () => { h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return ((h ^= h >>> 16) >>> 0) / 4294967296; };
}

/** Smooth a list of points into a cubic path (Catmull–Rom). */
function smooth(pts: [number, number][]) {
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
}

export function roughEllipse(w: number, h: number, seed: string) {
  const r = rng(seed), cx = w / 2, cy = h / 2, turns = 1.12 + r() * 0.1, n = 26, start = -2.2 + r() * 0.6;
  const pts: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const t = start + (i / n) * Math.PI * 2 * turns, k = 1 + (r() - 0.5) * 0.07 + (i / n) * 0.05;
    pts.push([cx + Math.cos(t) * (w / 2) * k, cy + Math.sin(t) * (h / 2) * k * (0.94 + r() * 0.08)]);
  }
  return smooth(pts);
}
export function roughLine(w: number, h: number, seed: string, passes = 2) {
  const r = rng(seed), y = h * 0.55; let d = "";
  for (let p = 0; p < passes; p++) {
    const pts: [number, number][] = [];
    const x0 = p ? w * (0.05 + r() * 0.1) : 0, x1 = p ? w * (0.85 + r() * 0.12) : w;
    for (let i = 0; i <= 6; i++) pts.push([x0 + ((x1 - x0) * i) / 6, y + (r() - 0.5) * h * 0.5 + (p ? h * 0.18 : 0)]);
    d += (p ? " " : "") + (p ? smooth(p % 2 ? pts.reverse() : pts) : smooth(pts));
  }
  return d;
}

/** Adds .is-drawn once the element is on screen. */
export function useDrawn<T extends Element>(delay = 0) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { el.classList.add("is-drawn"); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setTimeout(() => el.classList.add("is-drawn"), delay); io.disconnect(); } }, { threshold: 0.6 });
    io.observe(el); return () => io.disconnect();
  }, [delay]);
  return ref;
}

function useSize<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [s, set] = useState<[number, number] | null>(null);
  useEffect(() => {
    const el = ref.current!; const ro = new ResizeObserver(() => set([el.offsetWidth, el.offsetHeight]));
    ro.observe(el); return () => ro.disconnect();
  }, []);
  return [ref, s] as const;
}

export function Circled({ children, seed = "c", delay = 200, width = 3 }: { children: React.ReactNode; seed?: string; delay?: number; width?: number }) {
  const [ref, s] = useSize<HTMLSpanElement>();
  const drawn = useDrawn<SVGSVGElement>(delay);
  const w = s ? s[0] * 1.18 : 0, h = s ? s[1] * 1.28 : 0;
  return (
    <span className="circled" ref={ref}>
      {children}
      <svg ref={drawn} className="mark" viewBox={`0 0 ${w || 1} ${h || 1}`} aria-hidden style={{ ["--mw" as string]: width }}>
        {s && <path d={roughEllipse(w, h, seed)} pathLength={1} />}
      </svg>
    </span>
  );
}

export function Underlined({ children, seed = "u", delay = 300, width = 3, passes = 2 }: { children: React.ReactNode; seed?: string; delay?: number; width?: number; passes?: number }) {
  const [ref, s] = useSize<HTMLSpanElement>();
  const drawn = useDrawn<SVGSVGElement>(delay);
  const w = s ? s[0] * 1.04 : 0, h = s ? Math.max(10, s[1] * 0.35) : 0;
  return (
    <span className="underlined" ref={ref}>
      {children}
      <svg ref={drawn} className="mark" viewBox={`0 0 ${w || 1} ${h || 1}`} aria-hidden style={{ ["--mw" as string]: width }}>
        {s && <path d={roughLine(w, h, seed, passes)} pathLength={1} />}
      </svg>
    </span>
  );
}

/** A hand-drawn arrow; `flip` points it the other way. */
export function Arrow({ flip = false, className = "", delay = 500, style }: { flip?: boolean; className?: string; delay?: number; style?: React.CSSProperties }) {
  const ref = useDrawn<SVGSVGElement>(delay);
  return (
    <svg ref={ref} className={`mark ${className}`} viewBox="0 0 80 52" style={{ ...style, transform: `${style?.transform ?? ""} ${flip ? "scaleX(-1)" : ""}` }} aria-hidden>
      <path d="M4,8 C18,4 40,6 52,20 C60,29 63,38 64,46" pathLength={1} style={{ ["--md" as string]: ".8s" }} />
      <path d="M55,37 C59,41 62,45 64,47 C67,42 70,38 74,35" pathLength={1} style={{ ["--mdl" as string]: ".7s", ["--md" as string]: ".35s" }} />
    </svg>
  );
}

/* tiny pencil icons */
export const Icon = {
  pen: <svg viewBox="0 0 24 24"><path d="M4 20l1-5L16 4l4 4L9 19l-5 1zM14 6l4 4" /></svg>,
  cert: <svg viewBox="0 0 24 24"><path d="M5 3h14v12H5zM8 7h8M8 10h5M10 15l-1 6 3-2 3 2-1-6" /></svg>,
  plane: <svg viewBox="0 0 24 24"><path d="M3 12l18-8-6 17-3-7-9-2zM12 14l9-10" /></svg>,
  gift: <svg viewBox="0 0 24 24"><path d="M4 10h16v10H4zM3 7h18v3H3zM12 7v13M12 7c-2-4-6-3-5 0M12 7c2-4 6-3 5 0" /></svg>,
  lock: <svg viewBox="0 0 24 24"><path d="M6 11h12v9H6zM8 11V8a4 4 0 018 0v3" /></svg>,
  glow: <svg viewBox="0 0 24 24"><path d="M12 3v3M12 18v3M3 12h3M18 12h3M6 6l2 2M16 16l2 2M18 6l-2 2M8 16l-2 2M12 9a3 3 0 110 6 3 3 0 010-6z" /></svg>,
};
