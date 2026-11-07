"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import InviteCard from "@/components/lux/InviteCard";
import { getLenis } from "@/components/chrome/SmoothScroll";
import { reel, reelUrl } from "@/lib/reels";
import { BASE } from "@/lib/base";

gsap.registerPlugin(ScrollTrigger);

// left, middle (seen first, inside the opened invitation: the couple, every frame), right. Each file is cut from
// her reel (key) where its burned-in Instagram text never shows.
const FILMS = [
  { key: "live-hindu-couple", file: "lc-hindu-couple", label: "A Hindu wedding", alt: "Jyxdi painting live at a Hindu wedding" },
  { key: "live-guest-reactions", file: "lc-painting-given", label: "The couple and their painting", alt: "Jyxdi handing a couple their painting", lead: true },
  { key: "live-west-indian", file: "lc-west-indian", label: "A West Indian wedding", alt: "Jyxdi painting live at a West Indian wedding" },
];
const NOTE = "An original painting of your day, made in front of your guests."; // as on the opening's card, so one becomes the other

/** The live-painting page's first screen: her wedding invitation on dark velvet, beside the words.
    Desktop: the section holds (sticky) while the invitation opens like a gatefold (the seal parts, the two flaps swing open onto
    a wedding inside), then you go through it into three weddings playing side by side, and the words return at its foot.
    Phones: the card, then one wedding opening to full screen as it scrolls in. Reduced motion: both, still, no autoplay.
    From the opening's invitation the card glides here by itself (a shared view transition); from anywhere else it settles in. */
export default function LiveHero() {
  const root = useRef<HTMLElement>(null);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  const sync = useRef(() => {});
  const [wide, setWide] = useState(false); // phones show only the lead film: don't fetch the others' posters there
  // chosen on the opening: the card is already gliding in (the view transition), so it doesn't settle in as well
  const [glided] = useState(() => typeof document !== "undefined" && document.documentElement.classList.contains("from-curtain"));
  useEffect(() => setWide(matchMedia("(min-width: 900px)").matches), []);

  useEffect(() => {
    const el = root.current!;
    const one = (s: string) => el.querySelector<HTMLElement>(s)!;
    const films = one(".lvh__films");
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    // play only the visible films, only near the screen, and (desktop) only once the invitation has opened
    let near = false, shut = false;
    const play = () => el.querySelectorAll("video").forEach((v) => (near && !shut && !still && !pausedRef.current && v.offsetParent ? v.play().catch(() => {}) : v.pause()));
    sync.current = play;
    const io = new IntersectionObserver(([e]) => { near = e.isIntersecting; play(); }, { rootMargin: "25% 0px" });
    io.observe(one(".lvh__window"));

    const mm = gsap.matchMedia();
    mm.add("(min-width: 900px) and (prefers-reduced-motion: no-preference)", () => {
      const stage = one(".lvh__stage"), doors = one(".lvh__doors"), copy = one(".lvh__copy");
      // the card's resting place and the screen it opens onto (layout boxes, so the animation's own transforms don't count)
      const geo = () => ({ W: el.clientWidth, H: el.clientHeight, w: stage.offsetWidth, h: stage.offsetHeight, x: stage.offsetLeft + stage.offsetWidth / 2, y: stage.offsetTop + stage.offsetHeight / 2 });
      const S1 = 1.06, S2 = 1.13; // the card comes forward a little, then a little more as it opens
      const full = () => { const g = geo(); return Math.max(g.W / g.w, g.H / g.h); }; // where its middle panel covers the screen
      // the window onto the films is the card's middle panel at scale s, on the centre of the screen
      const panel = (s: () => number) => () => {
        const g = geo(), k = s(), t = (g.H - g.h * k) / 2, l = (g.W - g.w * k) / 2;
        return `inset(${t}px ${l}px ${t}px ${l}px round ${g.w * k * 0.005}px)`; // the card's corner (.5 of its 100 units)
      };
      const state = (p: number) => {
        el.classList.toggle("is-end", p > 0.5); // the words move to the films' foot while no one can see them
        if (p < 0.17 !== shut) { shut = p < 0.17; play(); }
      };
      shut = true;
      const tl = gsap.timeline({
        defaults: { ease: "power2.inOut", immediateRender: false },
        // the section is sticky in a taller track (CSS): no pin-spacer, so nothing is re-parented and its entrance never restarts
        scrollTrigger: { trigger: el.parentElement, start: "top top", end: "bottom bottom", scrub: 0.6, invalidateOnRefresh: true, onUpdate: (s) => state(s.progress), onRefresh: (s) => state(s.progress) },
      });
      const q = (s: string) => el.querySelectorAll<HTMLElement>(s);
      // 1. the words step aside; the card comes to the middle of the screen and squares up
      tl.fromTo(copy, { opacity: 1, x: 0, y: 0 }, { opacity: 0, x: -36, duration: 0.11, ease: "power1.in" }, 0)
        .fromTo(q(".lvh__cue, .lvh__glow"), { opacity: 1 }, { opacity: 0, duration: 0.08, ease: "none" }, 0)
        .fromTo(stage, { x: 0, y: 0, rotation: -2, scale: 1 }, { x: () => geo().W / 2 - geo().x, y: () => geo().H / 2 - geo().y, rotation: 0, scale: S1, duration: 0.16 }, 0)
        // 2. it becomes its two halves (pixel for pixel), with the films waiting behind them; the seal parts and the flaps swing open
        .fromTo(one(".lvh__card"), { visibility: "visible" }, { visibility: "hidden", duration: 0.001 }, 0.16)
        .fromTo(doors, { visibility: "hidden" }, { visibility: "visible", duration: 0.001 }, 0.16)
        .fromTo(films, { opacity: 0 }, { opacity: 1, duration: 0.001 }, 0.16)
        .fromTo(one(".lvh__pause"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.06, ease: "none" }, 0.21)
        .fromTo(one(".lvh__door--l"), { rotationY: 0 }, { rotationY: -180, duration: 0.3 }, 0.16)
        .fromTo(one(".lvh__door--r"), { rotationY: 0 }, { rotationY: 180, duration: 0.3 }, 0.16)
        .fromTo(stage, { scale: S1 }, { scale: S2, duration: 0.3 }, 0.16)
        .fromTo(films, { clipPath: panel(() => S1) }, { clipPath: panel(() => S2), duration: 0.3 }, 0.16)
        .fromTo(one(".lvh__light"), { opacity: 0 }, { opacity: 0.8, duration: 0.05, ease: "power1.out" }, 0.16)
        .fromTo(one(".lvh__light"), { opacity: 0.8 }, { opacity: 0, duration: 0.14, ease: "power1.in" }, 0.22)
        .fromTo(q(".lvh__face .lvh__dim"), { opacity: 0 }, { opacity: 0.55, duration: 0.15, ease: "power4.in" }, 0.16)
        .fromTo(q(".lvh__inside .lvh__dim"), { opacity: 0.55 }, { opacity: 0, duration: 0.15, ease: "power4.out" }, 0.31)
        .fromTo(one(".lvh__frame"), { opacity: 0 }, { opacity: 1, duration: 0.14 }, 0.3)
        // 3. a beat on the open invitation, then through it, into the weddings
        .fromTo(stage, { scale: S2 }, { scale: full, duration: 0.32, ease: "power3.inOut" }, 0.52)
        .fromTo(films, { clipPath: panel(() => S2) }, { clipPath: panel(full), duration: 0.32, ease: "power3.inOut" }, 0.52)
        .fromTo(one(".lvh__frame"), { opacity: 1 }, { opacity: 0, duration: 0.12, ease: "none" }, 0.58)
        .fromTo(doors, { opacity: 1 }, { opacity: 0, duration: 0.08, ease: "none" }, 0.76)
        // 4. the words return at the films' foot
        .fromTo(one(".lvh__shade"), { opacity: 0 }, { opacity: 1, duration: 0.14, ease: "none" }, 0.8)
        .fromTo(copy, { opacity: 0, x: 0, y: 36 }, { opacity: 1, y: 0, duration: 0.14, ease: "power2.out" }, 0.82)
        .fromTo(q(".lvh__label"), { opacity: 0 }, { opacity: 1, stagger: 0.03, duration: 0.1, ease: "none" }, 0.84)
        .to({}, { duration: 0.04 }); // and hold
      // a keyboard visitor reaching the films' links or the pause opens the invitation all the way
      const st = tl.scrollTrigger!, win = one(".lvh__window");
      const reveal = () => { if (st.progress > 0.99) return; const l = getLenis(); if (l) l.scrollTo(st.end, { duration: 1.4 }); else scrollTo({ top: st.end, behavior: "smooth" }); };
      win.addEventListener("focusin", reveal);
      return () => { win.removeEventListener("focusin", reveal); el.classList.remove("is-end"); shut = false; play(); };
    });
    mm.add("(max-width: 899px) and (prefers-reduced-motion: no-preference)", () => {
      // phones: one wedding opens from a card-shaped window to the whole screen as it scrolls in, and its pause arrives with it
      gsap.timeline({ scrollTrigger: { trigger: films, start: "top 92%", end: "top 8%", scrub: 0.5, invalidateOnRefresh: true } })
        .fromTo(films, {
          clipPath: () => { const W = films.clientWidth, H = films.clientHeight, w = Math.min(W * 0.76, H * 0.5), x = (W - w) / 2, y = (H - w * 1.4) / 2; return `inset(${y}px ${x}px ${y}px ${x}px round 12px)`; },
        }, { clipPath: "inset(0px 0px 0px 0px round 0px)", ease: "none", duration: 1 })
        .fromTo(one(".lvh__pause"), { autoAlpha: 0 }, { autoAlpha: 1, ease: "none", duration: 0.2 }, 0.8);
    });
    return () => { io.disconnect(); mm.revert(); el.querySelectorAll("video").forEach((v) => v.pause()); };
  }, []);

  // WCAG 2.2.2: moving video longer than 5s needs a pause control
  const toggle = () => { pausedRef.current = !pausedRef.current; setPaused(pausedRef.current); sync.current(); };

  return (
    <div className="lvh-track">
      <section ref={root} className={`lvh mood-black ${glided ? "is-glided" : ""}`} data-mood="black" aria-labelledby="lvh-title">
        <div className="lvh__open">
          <div className="lvh__copy">
            <div className="lvh__text">
              <p className="c-kicker lvh__kicker">Live painting · Weddings and events</p>
              <h1 id="lvh-title" className="lvh__title">
                <span className="lvh__line"><span>Your day,</span></span>{" "}
                <span className="lvh__line"><span>painted <em>live.</em></span></span>
              </h1>
              <p className="lvh__lede">Jyxdi is an international wedding live painter. She paints your wedding or event as it happens, in front of your guests, and you keep the original painting of the day.</p>
            </div>
            <div className="lvh__ctas">
              <Link href="#inquire" className="btn btn--ink"><span>Check your date</span><i>→</i></Link>
              <Link href="#reels" className="btn btn--line"><span>Watch her paint</span><i>→</i></Link>
            </div>
          </div>
          <div className="lvh__stage" aria-hidden>
            <span className="lvh__glow" />
            <div className="lvh__card"><InviteCard vt="invite-card" note={NOTE} /><span className="lvh__glint" /></div>
            <span className="lvh__frame" />
            <span className="lvh__light" />
            <div className="lvh__doors">
              {(["l", "r"] as const).map((d) => (
                <div key={d} className={`lvh__door lvh__door--${d}`}>
                  <div className="lvh__face"><InviteCard note={NOTE} /><i className="lvh__dim" /></div>
                  <div className="lvh__inside"><i className="lvh__dim" /></div>
                </div>
              ))}
            </div>
          </div>
          <p className="lvh__cue" aria-hidden>Scroll to open</p>
        </div>
        <div className="lvh__window">
          <div className="lvh__films">
            {FILMS.map((f) => (
              <figure key={f.key} className={`lvh__film ${f.lead ? "is-lead" : ""}`}>
                <video src={`${BASE}/video/${f.file}.mp4`} poster={f.lead || wide ? `${BASE}/video/${f.file}.jpg` : undefined} muted loop playsInline preload="none" aria-label={f.alt} />
                <figcaption className="lvh__label"><a href={reelUrl(reel(f.key))} target="_blank" rel="noopener">{f.label} ↗</a></figcaption>
              </figure>
            ))}
          </div>
          <button type="button" className="lvh__pause" onClick={toggle} aria-label={paused ? "Play the films" : "Pause the films"}>{paused ? "Play" : "Pause"}</button>
        </div>
        <div className="lvh__shade" aria-hidden />
      </section>
    </div>
  );
}
