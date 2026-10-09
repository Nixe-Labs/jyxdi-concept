"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import FadeIn from "./FadeIn";
import { BASE } from "@/lib/base";

/** The blacklight lab: a torch of UV light over an aligned daylight/blacklight photo pair. */
export function UvStage({ full, className = "", day, uv, alt }: { full: boolean; className?: string; day: string; uv: string; alt: string }) {
  const stage = useRef<HTMLDivElement>(null);
  const fullRef = useRef(full);
  useEffect(() => {
    fullRef.current = full;
    const el = stage.current!;
    if (full) { const tl = gsap.timeline(); [1, 0, 1, 0, 0, 1].forEach((v, i) => tl.add(() => el.classList.toggle("is-full", !!v), i * 0.07)); }
    else el.classList.remove("is-full");
  }, [full]);
  useEffect(() => {
    const el = stage.current!;
    const light = { r: 0, x: 50, y: 40 };
    let last = 0, demo = false;
    const R = () => (innerWidth >= 900 ? 115 : Math.min(100, el.clientWidth * 0.28));
    const paint = () => { el.style.setProperty("--r", light.r + "px"); el.style.setProperty("--mx", light.x + "%"); el.style.setProperty("--my", light.y + "%"); };
    const aim = (cx: number, cy: number) => { const r = el.getBoundingClientRect(); light.x = ((cx - r.left) / r.width) * 100; light.y = ((cy - r.top) / r.height) * 100; last = performance.now(); paint(); };
    const enter = (e: PointerEvent) => { if (e.pointerType === "mouse") gsap.to(light, { r: R(), duration: 0.6, ease: "expo.out", onUpdate: paint }); };
    const move = (e: PointerEvent) => aim(e.clientX, e.clientY);
    const leave = (e: PointerEvent) => { if (e.pointerType === "mouse") last = performance.now() - 1200; };
    const tstart = (e: TouchEvent) => { aim(e.touches[0].clientX, e.touches[0].clientY); gsap.to(light, { r: R(), duration: 0.4, onUpdate: paint }); };
    const tmove = (e: TouchEvent) => aim(e.touches[0].clientX, e.touches[0].clientY);
    el.addEventListener("pointerenter", enter); el.addEventListener("pointermove", move); el.addEventListener("pointerleave", leave);
    el.addEventListener("touchstart", tstart, { passive: true }); el.addEventListener("touchmove", tmove, { passive: true });
    // idle: the light wanders the painting on its own
    const tick = (time: number) => {
      if (!demo || fullRef.current || performance.now() - last < 2600) return;
      const t = time * 0.55;
      light.x += (50 + Math.sin(t) * 30 - light.x) * 0.06; light.y += (44 + Math.sin(t * 0.63 + 1) * 32 - light.y) * 0.06;
      if (light.r < R() * 0.95) light.r += (R() - light.r) * 0.05;
      paint();
    };
    gsap.ticker.add(tick);
    const st = ScrollTrigger.create({ trigger: el, start: "top 85%", end: "bottom 15%", onToggle: (s) => { demo = s.isActive; } });
    return () => { gsap.ticker.remove(tick); st.kill(); el.removeEventListener("pointerenter", enter); el.removeEventListener("pointermove", move); el.removeEventListener("pointerleave", leave); el.removeEventListener("touchstart", tstart); el.removeEventListener("touchmove", tmove); };
  }, []);
  return (
    <div ref={stage} className={`uvlab__stage ${className}`} data-uv-stage>
      <img className="uvlab__img" src={day} alt={`${alt}, daylight`} />
      <img className="uvlab__img uvlab__img--uv" src={uv} alt={`${alt}, under blacklight`} />
      <div className="uvlab__halo" />
      <span className="uvlab__tag uvlab__tag--l">Daylight</span>
      <span className="uvlab__tag uvlab__tag--r">Blacklight</span>
    </div>
  );
}

export function UvToggle({ on, onChange, light = false }: { on: boolean; onChange: (v: boolean) => void; light?: boolean }) {
  return (
    <button className={`toggle ${light ? "toggle--light" : ""}`} aria-pressed={on} onClick={() => onChange(!on)}>
      <span className="toggle__knob" /><span className="toggle__a">Lights on</span><span className="toggle__b">Blacklight</span>
    </button>
  );
}

export default function AfterDark() {
  const [full, setFull] = useState(false);
  const word = useRef<HTMLElement>(null);
  useEffect(() => {
    const st = ScrollTrigger.create({ trigger: word.current, start: "top 80%", once: true, onEnter: () => word.current?.animate([{ opacity: .2 }, { opacity: 1 }, { opacity: .3 }, { opacity: 1 }, { opacity: .5 }, { opacity: 1 }], { duration: 900, easing: "steps(6)" }) });
    return () => st.kill();
  }, []);
  return (
    <section className="section !px-[clamp(8px,1.4vw,20px)]" id="glow">
      <div className="dark-page" data-dark style={{ ["--uvA" as string]: full ? 0.5 : 0.18 }}>
        <div className="section !px-[var(--gutter)]">
          <FadeIn className="mx-auto mb-[clamp(40px,7vh,80px)] max-w-[1180px]">
            <p className="kicker"><b>UV canvases</b> · a little secret</p>
            <h2 className="display display--md">Some of them <em ref={word} className="uvword">glow</em><br />in the dark.</h2>
          </FadeIn>
          <div className="uvlab">
            <UvStage full={full} day={`${BASE}/img/k-classic-1092.webp`} uv={`${BASE}/img/k-uv-1092.webp`} alt="Karrupusaamy" />
            <FadeIn stagger={0.08}>
              <p className="note !text-uv-green">↙ try it on Karrupusaamy</p>
              <p className="lede !mt-3">Choose the UV finish on any canvas and it&apos;s painted with fluorescent pigment. By day it looks like the original. Switch on a blacklight and the chains, the blade, the smoke and the halo light up.</p>
              <p className="text-[13px] text-[rgba(243,236,223,.55)]"><span className="only-fine">Move your cursor over the painting.</span><span className="only-touch">Drag your finger across the painting.</span></p>
              <div className="my-6"><UvToggle on={full} onChange={setFull} /></div>
              <Link href="/shop/karrupusaamy/" className="btn btn--red"><span>Shop UV canvases · from $550</span><i>→</i></Link>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
}
