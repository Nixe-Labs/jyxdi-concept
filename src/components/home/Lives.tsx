"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BASE } from "@/lib/base";
import { UV_PAIRS } from "@/lib/catalog";
import { getLenis } from "@/components/chrome/SmoothScroll";

gsap.registerPlugin(ScrollTrigger);

// Karrupusaamy: the one painting photographed both in daylight and under blacklight
const { day: DAY, uv: UV } = UV_PAIRS.karrupusaamy;
const STRIPS = 22; // the rolled print
const BEATS = [0.245, 0.54, 0.78]; // where the words move on: the canvas, the UV canvas, the artist
const photo = (w: number) => `${BASE}/img/loc-kalki-horse-${w}.webp`;
const HER = "Jyxdi on the beach beside a white horse and her Kalki painting";

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

/** One painting, three lives, and the artist behind it: see styles/lives.css for the scene.
    The scroll position, eased a little longer than the films above it (so the object glides), seeks every paused CSS
    animation in the scene. */
export default function Lives() {
  const root = useRef<HTMLElement>(null);
  const [near, setNear] = useState(false); // the print's picture loads as the scene comes near, not with the page
  useEffect(() => {
    const el = root.current!;
    const ahead = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setNear(true); ahead.disconnect(); } }, { rootMargin: "150% 0px" });
    ahead.observe(el);
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
        const beat = String(1 + BEATS.filter((b) => state.p >= b).length);
        if (el.dataset.beat !== beat) el.dataset.beat = beat;
      };
      collect(); apply();
      const film = gsap.to(state, { p: 1, ease: "none", onUpdate: apply, scrollTrigger: { trigger: el, start: "top top", end: "bottom bottom", scrub: 0.9, onRefresh: () => { collect(); apply(); } } });
      // it rises in as the films above leave
      const parts = el.querySelectorAll(".lv__copy, .lv__set");
      const arrive = gsap.fromTo(parts, { opacity: 0, y: 70 }, { opacity: 1, y: 0, ease: "none", scrollTrigger: { trigger: el, start: "top 92%", end: "top 30%", scrub: 0.6 } });
      // a link reached with the keyboard may belong to a later beat: go there, so it is seen
      const onFocus = (e: FocusEvent) => {
        const t = e.target as HTMLElement, at = t.closest<HTMLElement>("[data-at]")?.dataset.at, st = film.scrollTrigger;
        if (!at || !st || !t.matches(":focus-visible")) return;
        const y = st.start + (st.end - st.start) * Number(at), lenis = getLenis();
        if (lenis) lenis.scrollTo(y, { duration: 1.2 }); else scrollTo({ top: y });
      };
      el.addEventListener("focusin", onFocus);
      return () => {
        el.removeEventListener("focusin", onFocus);
        film.scrollTrigger?.kill(); film.kill(); arrive.scrollTrigger?.kill(); arrive.kill();
        gsap.set(parts, { clearProps: "opacity,transform" });
        el.classList.remove("is-film"); delete el.dataset.beat;
      };
    });
    return () => { ahead.disconnect(); mm.revert(); };
  }, []);

  return (
    <section ref={root} className="lv" data-mood="burgundy" aria-labelledby="lv-title">
      <div className="lv__stage">
        <div className="lv__night" aria-hidden />
        <div className="lv__copy">
          <div className="lv__grp lv__grp--a">
            <p className="c-kicker">Three ways to own a Jyxdi</p>
            <h2 className="c-h2" id="lv-title">Every painting, <em>three ways.</em></h2>
            <ol className="lv__steps">
              <li><span aria-hidden>i.</span><h3><span>Art print</span></h3><p>The poster edition, and the easiest way to begin a collection.</p></li>
              <li><span aria-hidden>ii.</span><h3><span>Canvas</span></h3><p>The painting on canvas.</p></li>
              <li data-at="0.67"><span aria-hidden>iii.</span><h3><span>UV canvas</span></h3><p>Finished in fluorescent pigment. By day it looks like the original; under a blacklight, it lights up.</p>
                <div><Link href="/shop/karrupusaamy/" className="btn btn--line"><span>Shop UV canvases</span><i>→</i></Link></div></li>
            </ol>
            <ul className="lv__tabs" aria-hidden><li><em>i</em>Art print</li><li><em>ii</em>Canvas</li><li><em>iii</em>UV canvas</li></ul>
            <p className="lv__note" data-at="0.3">Four sizes, 16×20″ up to 48×60″ <Link href="/faq/#formats" className="c-link">Compare sizes →</Link></p>
          </div>
          <div className="lv__grp lv__grp--b" data-at="0.98">
            <p className="c-kicker">Behind every painting</p>
            <h2 className="c-h2">This is <em>Jyxdi.</em></h2>
            <p className="c-ed__text">A painter, educator and the creator of the Spirit Gates fandom. Her paintings take gods, goddesses and myths and paint them in rich, saturated colour.</p>
            <div className="c-ed__collab">
              <p>Collaborations</p>
              <ul><li>Michael B. Jordan</li><li>COACH</li><li>XO</li><li>OVO40</li></ul>
            </div>
            <div><Link href="/artist/" className="btn btn--line"><span>Read her story</span><i>→</i></Link></div>
            <img className="lv__still" src={photo(800)} width={1400} height={1867} alt={HER} loading="lazy" decoding="async" />
          </div>
        </div>
        <div className="lv__set">
          <span className="lv__spot" aria-hidden />
          <img className="lv__glow" src={`${BASE}/img/k-glow.webp`} alt="" aria-hidden loading="lazy" decoding="async" />
          <span className="lv__shadow" aria-hidden />
          <div className="lv__obj">
            <div className="lv__roll" aria-hidden style={{ "--art": near ? `url(${DAY})` : "none" } as React.CSSProperties}><Strip i={0} /></div>
            <div className="lv__box">
              <div className="lv__face lv__front">
                <img src={DAY} alt="Karrupusaamy, painting by Jyxdi" loading="lazy" decoding="async" />
                <i className="lv__dim" />
                <span className="lv__uvw"><img src={UV} alt="Karrupusaamy glowing under blacklight" loading="lazy" decoding="async" /></span>
                <i className="lv__beam" />
                <i className="lv__grain" /><i className="lv__sheen" />
              </div>
              <div className="lv__face lv__back">
                <img src={photo(800)} srcSet={`${photo(800)} 800w, ${photo(1400)} 1400w`} sizes="(max-width: 899px) 62vw, 36vw" width={1400} height={1867} alt={HER} loading="lazy" decoding="async" />
                <i className="lv__sheen" />
              </div>
              <div className="lv__side lv__side--r" /><div className="lv__side lv__side--l" /><div className="lv__side lv__side--t" /><div className="lv__side lv__side--b" />
            </div>
          </div>
          <p className="lv__cap">Karrupusaamy</p>
          <p className="lv__cap">Jyxdi, with Kalki, on the beach</p>
        </div>
      </div>
    </section>
  );
}
