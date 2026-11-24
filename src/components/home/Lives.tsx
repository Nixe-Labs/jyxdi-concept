"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BASE } from "@/lib/base";
import { UV_PAIRS, PRINT, CANVAS, UV as UV_FROM } from "@/lib/catalog";
import { getLenis } from "@/components/chrome/SmoothScroll";
import { still, strike } from "./AfterDark";

gsap.registerPlugin(ScrollTrigger);

// Karrupusaamy: the one painting photographed both in daylight and under blacklight
const { day: DAY, uv: UV } = UV_PAIRS.karrupusaamy;
const STRIPS = 22; // the rolled print
const BEATS = [0.245, 0.54]; // where the words move on: the Premium Canvas, the Signature UV Glow Canvas
const END = 0.8; // the clock stops on the glow: the section is only as tall as the beats need (lives.css)
const DARK = 0.6; // in beat iii, once the canvas is square: the room puts its lights out here unless the visitor has the switch
const beatAt = (p: number) => String(1 + BEATS.filter((b) => p >= b).length);

/** One strip of the print, hinged to the one above; each uncurls a little after the last (--from, on the scene's clock). */
function Strip({ i }: { i: number }) {
  const style = { "--y": `${(i / (STRIPS - 1)) * 100}%`, "--from": (i * 0.7 - 0.9) / 100, "--len": 0.051 } as React.CSSProperties;
  return (
    <div className={`lv__strip ${i < 2 ? "is-flat" : ""}`} style={style}>
      <i className="f" /><i className="b" />
      {i < STRIPS - 1 && <Strip i={i + 1} />}
    </div>
  );
}

/** Every painting, three ways: one painting as a Fine Art Print, a Premium Canvas and a Signature UV Glow Canvas, ending under a blacklight (the shop,
    above the paintings). See styles/lives.css for the scene. The scroll position, eased (so the object glides), seeks
    every paused CSS animation in the scene; the lights are a switch beside that clock, not on it. */
export default function Lives() {
  const root = useRef<HTMLElement>(null);
  const [near, setNear] = useState(false); // the print's picture loads as the scene comes near, not with the page
  useEffect(() => {
    const el = root.current!;
    const ahead = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setNear(true); ahead.disconnect(); } }, { rootMargin: "150% 0px" });
    ahead.observe(el);
    const lit = { dark: 0, uv: 0 }; // the lights, 0..1: --dark the room going down, --uv the blacklight tube coming up
    const dimmer = el.querySelector<HTMLElement>(".lv__dimmer")!, range = dimmer.querySelector("input")!, sw = el.querySelector<HTMLButtonElement>(".lv__switch")!;
    let level = 0, mine = false, flashed = 0; // the dimmer 0..100; the visitor has the lights (until beat iii is left); when the tube last flickered
    const paint = () => { el.style.setProperty("--dark", lit.dark.toFixed(3)); el.style.setProperty("--uv", lit.uv.toFixed(3)); };
    const show = (v: number) => { level = v; range.value = String(v); range.setAttribute("aria-valuetext", v === 0 ? "Daylight" : v === 100 ? "Blacklight" : `${v}% blacklight`); el.toggleAttribute("data-uv", v === 100); };
    const to = (off: boolean, auto = false) => {
      const v = off ? 1 : 0;
      gsap.killTweensOf(lit); show(v * 100);
      if (still()) { lit.dark = lit.uv = v; paint(); return; }
      // the tube flickers for the visitor and for the scene's first strike only, never twice within 1.5s (WCAG 2.3.1)
      if (off && !(auto && flashed) && performance.now() - flashed > 1500) { flashed = performance.now(); strike(lit, paint); }
      else gsap.to(lit, { dark: v, uv: v, duration: off ? 0.6 : 0.8, ease: "power2.inOut", onUpdate: paint });
    };
    const dim = () => { mine = true; gsap.killTweensOf(lit); show(range.valueAsNumber); lit.dark = lit.uv = level / 100; paint(); };
    const flip = () => { mine = true; to(level < 100); };
    // the scene's hand: lights out in beat iii once the canvas is square, unless the visitor has them (or the section has
    // left, where a scrub still catching up must not undo `away`); up as soon as beat iii is left
    const cue = (p: number) => {
      if (p < BEATS[1]) { mine = false; if (level) to(false); }
      else if (!mine && !level && p >= DARK && away.isActive) to(true, true);
    };
    range.addEventListener("input", dim); sw.addEventListener("click", flip);
    dimmer.hidden = sw.hidden = false;
    // leaving the section, either way, puts the lights back on; the strip a jump to #paintings leaves under the nav (98px at most) counts as left
    const away = ScrollTrigger.create({ trigger: el, end: "bottom 140px", onLeave: () => cue(0), onLeaveBack: () => cue(0) });
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      el.classList.add("is-film");
      el.dataset.beat = "1";
      const state = { p: 0 };
      // each animation with the stretch of the clock it moves in: outside it, it already rests at its first or last frame
      let anims: [Animation, number, number][] = [], last = -1;
      const collect = () => {
        anims = el.getAnimations({ subtree: true }).filter((a) => (a as CSSAnimation).animationName?.startsWith("lv-")).map((a) => {
          const { delay = 0, duration = 0 } = a.effect?.getComputedTiming() ?? {};
          return [a, delay, delay + Number(duration)];
        });
        last = -1;
      };
      const apply = () => {
        const t = state.p * 1000;
        for (const [a, from, to] of anims) if (last < 0 || !((t < from && last < from) || (t > to && last > to))) a.currentTime = t;
        last = t;
        const beat = beatAt(state.p);
        if (el.dataset.beat !== beat) el.dataset.beat = beat;
        cue(state.p);
      };
      collect(); apply();
      const film = gsap.to(state, { p: END, ease: "none", onUpdate: apply, scrollTrigger: { trigger: el, start: "top top", end: "bottom bottom", scrub: 0.9, onRefresh: () => { collect(); apply(); } } });
      // it rises in as the section above leaves
      const parts = el.querySelectorAll(".lv__copy, .lv__set");
      const arrive = gsap.fromTo(parts, { opacity: 0, y: 70 }, { opacity: 1, y: 0, ease: "none", scrollTrigger: { trigger: el, start: "top 92%", end: "top 30%", scrub: 0.6 } });
      // a control reached with the keyboard may belong to a later beat: go there, so it is seen. A jump, not a glide: while
      // Lenis glides it ignores the browser's scroll to the next focused control, leaving that off screen (the scrub still eases the picture)
      const onFocus = (e: FocusEvent) => {
        const t = e.target as HTMLElement, at = t.closest<HTMLElement>("[data-at]")?.dataset.at, st = film.scrollTrigger;
        if (!at || !st || !t.matches(":focus-visible") || el.dataset.beat === beatAt(Number(at))) return; // already on screen: tabbing dimmer → switch → link never re-scrolls
        const y = st.start + ((st.end - st.start) * Number(at)) / END, lenis = getLenis();
        if (lenis) lenis.scrollTo(y, { immediate: true }); else scrollTo({ top: y });
      };
      el.addEventListener("focusin", onFocus);
      return () => {
        el.removeEventListener("focusin", onFocus);
        film.scrollTrigger?.kill(); film.kill(); arrive.scrollTrigger?.kill(); arrive.kill();
        gsap.set(parts, { clearProps: "opacity,transform" });
        cue(0); el.classList.remove("is-film"); delete el.dataset.beat; // a dark the scene made never survives into the still layout
      };
    });
    return () => { ahead.disconnect(); mm.revert(); away.kill(); range.removeEventListener("input", dim); sw.removeEventListener("click", flip); gsap.killTweensOf(lit); };
  }, []);

  return (
    <section ref={root} id="formats" className="lv" data-mood="burgundy" aria-labelledby="lv-title" tabIndex={-1}>
      <div className="lv__stage">
        <div className="lv__night" aria-hidden />
        <div className="lv__copy">
          <div className="lv__grp">
            <p className="c-kicker">Every painting, three ways</p>
            <h2 className="c-h2" id="lv-title">Three ways to own a <em>JYXDI.</em></h2>
            <ol className="lv__steps">
              <li><span aria-hidden>i.</span><h3><span>Fine Art Print</span></h3><p className="lv__from">from ${PRINT} · four sizes, 16×20″ to 48×60″</p>
                <p>Printed on paper with archival, fade-resistant inks, true to every colour she paints. The easiest way to begin a collection.</p></li>
              <li><span aria-hidden>ii.</span><h3><span>Premium Canvas</span></h3><p className="lv__from">from ${CANVAS} · four sizes, 16×20″ to 48×60″</p>
                <p>Printed on canvas with archival inks, then stretched and ready to hang the day it arrives.</p></li>
              <li data-at="0.57"><span aria-hidden>iii.</span><h3><span>Signature UV Glow Canvas</span></h3><p className="lv__from">from ${UV_FROM} · four sizes, 16×20″ to 48×60″</p>
                <p>The canvas, with fluorescent pigment painted on by hand. By day it looks like the original; under a blacklight, it lights up.</p>
                <div className="lv__act">
                  <div className="lv__dimmer" hidden>
                    <span aria-hidden>Daylight</span>
                    <input type="range" min={0} max={100} defaultValue={0} aria-label="Lighting, from daylight to blacklight" aria-valuetext="Daylight" />
                    <span aria-hidden>Blacklight</span>
                  </div>
                  <button type="button" className="lv__switch" hidden><span>Lights off</span><span>Lights on</span></button>
                  <a href="#paintings" className="c-link">Choose your painting ↓</a>
                </div></li>
            </ol>
            <ul className="lv__tabs" aria-hidden><li><em>i</em>Fine Art Print</li><li><em>ii</em>Premium Canvas</li><li><em>iii</em>Signature UV Glow Canvas</li></ul>
            <p className="lv__note" data-at="0.3">Every size comes with a hand-signed certificate of authenticity. <Link href="/faq/#formats" className="c-link">Compare sizes →</Link></p>
          </div>
        </div>
        <div className="lv__set">
          <span className="lv__cast" aria-hidden />
          <span className="lv__spot" aria-hidden />
          <img className="lv__glow" src={`${BASE}/img/k-glow.webp`} alt="" aria-hidden loading="lazy" decoding="async" />
          <span className="lv__tube" aria-hidden />
          <span className="lv__shadow" aria-hidden />
          <div className="lv__obj">
            <div className="lv__roll" aria-hidden style={{ "--art": near ? `url(${DAY})` : "none" } as React.CSSProperties}><Strip i={0} /></div>
            <div className="lv__box">
              <div className="lv__face lv__front">
                <img src={DAY} alt="Karrupusaamy, painting by Jyxdi" loading="lazy" decoding="async" />
                <i className="lv__grain" /><i className="lv__dim" />
                <img className="lv__uv" src={UV} alt="Karrupusaamy glowing under blacklight" loading="lazy" decoding="async" />
                <i className="lv__sheen" />
              </div>
              <div className="lv__side lv__side--r" /><div className="lv__side lv__side--l" /><div className="lv__side lv__side--t" /><div className="lv__side lv__side--b" />
            </div>
          </div>
          <p className="lv__cap">Karrupusaamy<span> · under a blacklight</span></p>
        </div>
      </div>
    </section>
  );
}
