"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const still = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Blacklight torch over an aligned daylight/blacklight photo pair (styled in product.css, px-uvs).
    The pointer (or a finger) carries a circle of UV light; `full` spreads that circle over the whole painting. */
export function UvStage({ full, className = "", day, uv, alt }: { full: boolean; className?: string; day: string; uv: string; alt: string }) {
  const stage = useRef<HTMLDivElement>(null);
  const light = useRef({ r: 0, x: 50, y: 40 });
  const fullRef = useRef(full);
  const paint = () => {
    const el = stage.current, l = light.current;
    if (!el) return;
    el.style.setProperty("--r", l.r + "px"); el.style.setProperty("--mx", l.x + "%"); el.style.setProperty("--my", l.y + "%");
  };

  // blacklight on: the torch's circle widens until the whole painting glows; off: it closes again
  useEffect(() => {
    fullRef.current = full;
    const el = stage.current!;
    if (!full) el.classList.remove("is-full");
    const t = gsap.to(light.current, {
      r: full ? Math.hypot(el.clientWidth, el.clientHeight) * 2 : 0, duration: still() ? 0 : full ? 1.2 : 0.7, ease: full ? "power2.inOut" : "power2.out",
      onUpdate: paint, onComplete: () => { if (full) el.classList.add("is-full"); }, overwrite: true,
    });
    return () => { t.kill(); };
  }, [full]);

  useEffect(() => {
    const el = stage.current!, l = light.current;
    let demo = false, until = 0, used = false;
    const R = () => (innerWidth >= 900 ? 115 : Math.min(100, el.clientWidth * 0.28));
    const aim = (cx: number, cy: number) => { const r = el.getBoundingClientRect(); l.x = ((cx - r.left) / r.width) * 100; l.y = ((cy - r.top) / r.height) * 100; used = true; paint(); };
    const glow = (r: number, duration: number) => { if (!fullRef.current) gsap.to(l, { r, duration, ease: "expo.out", onUpdate: paint, overwrite: true }); };
    const enter = (e: PointerEvent) => { if (e.pointerType === "mouse") glow(R(), 0.6); };
    const move = (e: PointerEvent) => aim(e.clientX, e.clientY);
    const leave = (e: PointerEvent) => { if (e.pointerType === "mouse") glow(0, 0.6); };
    const tstart = (e: TouchEvent) => { aim(e.touches[0].clientX, e.touches[0].clientY); glow(R(), 0.4); };
    const tmove = (e: TouchEvent) => aim(e.touches[0].clientX, e.touches[0].clientY);
    el.addEventListener("pointerenter", enter); el.addEventListener("pointermove", move); el.addEventListener("pointerleave", leave);
    el.addEventListener("touchstart", tstart, { passive: true }); el.addEventListener("touchmove", tmove, { passive: true });
    // idle: when it comes into view the light wanders the painting for a few seconds, then fades (WCAG 2.2.2: under 5s);
    // never once the visitor has the light, never with reduced motion
    const tick = (time: number) => {
      if (!demo || used || fullRef.current) return;
      if (performance.now() > until) { if (l.r > 0.5) { l.r *= 0.9; paint(); } return; }
      const t = time * 0.55;
      l.x += (50 + Math.sin(t) * 30 - l.x) * 0.06; l.y += (44 + Math.sin(t * 0.63 + 1) * 32 - l.y) * 0.06;
      if (l.r < R() * 0.95) l.r += (R() - l.r) * 0.05;
      paint();
    };
    if (!still()) gsap.ticker.add(tick);
    const st = ScrollTrigger.create({ trigger: el, start: "top 85%", end: "bottom 15%", onToggle: (s) => { demo = s.isActive; if (demo) until = performance.now() + 3600; } });
    return () => { gsap.ticker.remove(tick); st.kill(); el.removeEventListener("pointerenter", enter); el.removeEventListener("pointermove", move); el.removeEventListener("pointerleave", leave); el.removeEventListener("touchstart", tstart); el.removeEventListener("touchmove", tmove); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div ref={stage} className={`px-uvs ${className}`}>
      <img className="px-uvs__img" src={day} alt={`${alt}, in daylight`} draggable={false} />
      <img className="px-uvs__img px-uvs__img--uv" src={uv} alt={`${alt}, under blacklight`} draggable={false} />
      <span className="px-uvs__halo" aria-hidden />
      <span className="px-uvs__tag px-uvs__tag--l" aria-hidden>Daylight</span>
      <span className="px-uvs__tag px-uvs__tag--r" aria-hidden>Blacklight</span>
    </div>
  );
}

/** Lights on / blacklight: two pressed-state buttons under one sliding knob. */
export function UvToggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className={`px-toggle ${on ? "is-on" : ""}`} role="group" aria-label="Lighting">
      <button type="button" aria-pressed={!on} onClick={() => onChange(false)}>Lights on</button>
      <button type="button" aria-pressed={on} onClick={() => onChange(true)}>Blacklight</button>
    </div>
  );
}
