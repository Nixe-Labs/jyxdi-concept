"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import FadeIn from "./FadeIn";

gsap.registerPlugin(ScrollTrigger);

export const still = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
// the room lights cut, then the tube strikes, catches twice and settles (~1.2s): UvRoom's switch and the formats scene's (Lives.tsx)
export const strike = (l: { dark: number; uv: number }, paint: () => void) => gsap.timeline({ onUpdate: paint })
  .to(l, { dark: 1, duration: 0.16, ease: "power1.in" })
  .to(l, { uv: 0.8, duration: 0.04 }, "+=0.14").to(l, { uv: 0.08, duration: 0.06 })
  .to(l, { uv: 0.65, duration: 0.04 }, "+=0.09").to(l, { uv: 0.2, duration: 0.07 })
  .to(l, { uv: 1, duration: 0.55, ease: "power2.out" }, "+=0.05");

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

/** The blacklight room, full screen (styled in product.css, uvr): the painting on a lit gallery wall and a dimmer from
    daylight to blacklight. Dragging takes the room lights down as the UV tube comes up; "Lights off" flips it at once,
    the room going dark first and the tube flickering on the way real ones do. `head` is the words beside the painting,
    `children` what follows them (on phones, after the painting). */
export function UvRoom({ day, uv, alt, head, children, ...rest }:
  { day: string; uv: string; alt: string; head: React.ReactNode; children?: React.ReactNode } & React.HTMLAttributes<HTMLElement>) {
  const root = useRef<HTMLElement>(null);
  const lit = useRef({ dark: 0, uv: 0 }); // the room lights going down, the UV tube coming up: 0 to 1
  const touched = useRef(false);
  const [level, setLevel] = useState(0); // the dimmer: 0 daylight to 100 blacklight
  const paint = () => {
    const s = root.current?.style, l = lit.current;
    s?.setProperty("--dark", l.dark.toFixed(3)); s?.setProperty("--uv", l.uv.toFixed(3));
  };
  const take = () => { touched.current = true; gsap.killTweensOf(lit.current); };
  const dim = (v: number) => { take(); lit.current.dark = lit.current.uv = v / 100; paint(); setLevel(v); };
  const flip = () => {
    take();
    const l = lit.current, off = level < 100;
    setLevel(off ? 100 : 0);
    if (still()) { l.dark = l.uv = off ? 1 : 0; paint(); return; }
    if (!off) { gsap.to(l, { dark: 0, uv: 0, duration: 0.8, ease: "power2.inOut", onUpdate: paint }); return; }
    strike(l, paint);
  };

  // the first time the room comes into view the dimmer breathes once, down a little and back, to show what it does
  // (under 5s: WCAG 2.2.2); never once the visitor has it, never with reduced motion
  useEffect(() => {
    if (still()) return;
    const l = lit.current;
    const st = ScrollTrigger.create({ trigger: root.current, start: "top 55%", once: true, onEnter: () => {
      if (!touched.current) gsap.to(l, { dark: 0.4, uv: 0.4, duration: 1.2, delay: 0.4, ease: "sine.inOut", yoyo: true, repeat: 1, onUpdate: () => { paint(); setLevel(Math.round(l.uv * 100)); } });
    } });
    return () => { st.kill(); gsap.killTweensOf(l); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section ref={root} className="uvr mood-black" data-mood="black" {...rest}>
      <span className="uvr__lamp" aria-hidden />
      <span className="uvr__cast" aria-hidden />
      <div className="uvr__copy">{head}</div>
      <FadeIn className="uvr__stage" y={40}>
        <span className="uvr__tube" aria-hidden />
        <img className="uvr__bloom" src={uv} alt="" aria-hidden loading="lazy" decoding="async" />
        <span className="lux-frame uvr__frame">
          <span className="lux-frame__mat">
            <img className="uvr__art" src={day} alt={`${alt}, in daylight`} loading="lazy" decoding="async" draggable={false} />
            <img className="uvr__glow" src={uv} alt={`${alt}, under blacklight`} loading="lazy" decoding="async" draggable={false} />
          </span>
        </span>
        <div className="uvr__controls">
          <div className="uvr__dimmer">
            <span aria-hidden>Daylight</span>
            <input type="range" className="uvr__range" min={0} max={100} value={level} onChange={(e) => dim(Number(e.target.value))}
              aria-label="Lighting, from daylight to blacklight" aria-valuetext={level === 0 ? "Daylight" : level === 100 ? "Blacklight" : `${level}% blacklight`} />
            <span aria-hidden>Blacklight</span>
          </div>
          <button type="button" className="uvr__switch" onClick={flip}>{level === 100 ? "Lights on" : "Lights off"}</button>
        </div>
      </FadeIn>
      {children && <div className="uvr__cta">{children}</div>}
    </section>
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
