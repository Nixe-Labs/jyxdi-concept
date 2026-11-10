"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { reel, reelUrl } from "@/lib/reels";
import { BASE } from "@/lib/base";

gsap.registerPlugin(ScrollTrigger);

// left, middle (seen first, through the wide window: the couple receiving their painting), right. Each file is cut from
// her reel (key) where its burned-in Instagram text never shows: the top 60% of the frame, or a stretch with no text at all.
const FILMS = [
  { key: "live-west-indian", file: "lc-west-indian", label: "A West Indian wedding", alt: "Jyxdi painting live at a West Indian wedding" },
  { key: "live-guest-reactions", file: "lc-painting-given", label: "The couple and their painting", alt: "Jyxdi handing a couple their painting", lead: true },
  { key: "live-hindu-couple", file: "lc-hindu-couple", label: "A Hindu wedding", alt: "Jyxdi painting live at a Hindu wedding" },
];

type Cta = { href: string; label: string };

/** Her live painting, full screen. Desktop: the words sit on the left beside a wide window onto one wedding; the section
    holds while the window grows to fill the screen and two more weddings slide in beside it, and the words settle at
    the films' foot.
    Phones: one wedding opens to full screen as it scrolls in. Reduced motion: the finished frame, no autoplay. */
export default function LiveCinema({ as: Heading = "h2", kicker = "Live painting · Weddings and events",
  lede = "Jyxdi paints your celebration as it happens, in front of your guests, from Hindu and West Indian ceremonies to outdoor weddings. You keep an original painting of the day.",
  primary = { href: "/live-painting/#inquire", label: "Check your date" }, secondary = { href: "/live-painting/", label: "How it works" } }:
  { as?: "h1" | "h2"; kicker?: string; lede?: string; primary?: Cta; secondary?: Cta | null }) {
  const root = useRef<HTMLElement>(null);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  const [wide, setWide] = useState(false); // phones show only the lead film: don't fetch the others' posters there
  useEffect(() => setWide(matchMedia("(min-width: 900px)").matches), []);
  const [near, setNear] = useState(false); // the posters load as the films come near, not with the page
  useEffect(() => {
    const ahead = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setNear(true); ahead.disconnect(); } }, { rootMargin: "150% 0px" });
    ahead.observe(root.current!);
    return () => ahead.disconnect();
  }, []);

  useEffect(() => {
    const el = root.current!;
    const q = (s: string) => el.querySelectorAll<HTMLElement>(s);
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    // play only the visible films, only while the section is near the screen
    const io = new IntersectionObserver(([e]) => {
      el.querySelectorAll("video").forEach((v) => (e.isIntersecting && !still && !pausedRef.current && v.offsetParent ? v.play().catch(() => {}) : v.pause()));
    }, { rootMargin: "25% 0px" });
    io.observe(el);
    const mm = gsap.matchMedia();
    mm.add("(min-width: 900px) and (prefers-reduced-motion: no-preference)", () => {
      el.classList.add("is-cinema");
      const films = el.querySelector<HTMLElement>(".lc__films")!, panel = el.querySelector<HTMLElement>(".lc__panel")!;
      // the window: the right half of the screen beside the words, about 7:5, centred; the films start at that size, so the
      // whole frame shows (a full-screen film seen through a small window would only show a close-up)
      const win = () => {
        const W = el.clientWidth, H = el.clientHeight, left = W * 0.5, width = W - left - panel.offsetLeft, height = Math.min(width / 1.4, H * 0.7);
        return { left, top: (H - height) / 2, width, height };
      };
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top top", end: "+=140%", pin: true, scrub: 0.6, invalidateOnRefresh: true } });
      tl.fromTo(films, { left: () => win().left, top: () => win().top, width: () => win().width, height: () => win().height, borderRadius: 16 },
        { left: 0, top: 0, width: () => el.clientWidth, height: () => el.clientHeight, borderRadius: 0, ease: "power2.inOut", duration: 1 }, 0)
        // two more weddings slide in beside it as it grows, so no film is ever stretched past its own size
        .fromTo(q(".lc__film:not(.is-lead)"), { flexGrow: 0 }, { flexGrow: 1, ease: "power2.inOut", duration: 0.95 }, 0.05)
        // the words: centred beside the window, then down to the films' foot
        .fromTo(panel, { y: () => (el.clientHeight - panel.offsetHeight) / 2 - panel.offsetTop, "--scrim": 0 }, { y: 0, "--scrim": 1, ease: "power2.inOut", duration: 0.85 }, 0.1)
        .fromTo(q(".lc__shade"), { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0.55)
        .fromTo(q(".lc__label"), { opacity: 0 }, { opacity: 1, stagger: 0.05, duration: 0.25 }, 0.74);
      return () => { el.classList.remove("is-cinema"); tl.scrollTrigger?.kill(); tl.kill(); };
    });
    mm.add("(max-width: 899px) and (prefers-reduced-motion: no-preference)", () => {
      const t = gsap.fromTo(q(".lc__films"), { clipPath: "inset(7% 8% 7% 8% round 22px)" }, { clipPath: "inset(0% 0% 0% 0% round 0px)", ease: "none", scrollTrigger: { trigger: el, start: "top 90%", end: "top 8%", scrub: 0.5 } });
      return () => { t.scrollTrigger?.kill(); t.kill(); };
    });
    return () => { io.disconnect(); mm.revert(); };
  }, []);

  // WCAG 2.2.2: moving video longer than 5s needs a pause control
  const toggle = () => {
    const next = !pausedRef.current;
    pausedRef.current = next; setPaused(next);
    root.current!.querySelectorAll("video").forEach((v) => (next || !v.offsetParent ? v.pause() : v.play().catch(() => {})));
  };

  return (
    <section ref={root} className="lc mood-black" data-mood="black" aria-label="Live painting, filmed at weddings">
      <div className="lc__films">
        {FILMS.map((f) => {
          return (
            <figure key={f.key} className={`lc__film ${f.lead ? "is-lead" : ""}`}>
              <video src={`${BASE}/video/${f.file}.mp4`} poster={near && (f.lead || wide) ? `${BASE}/video/${f.file}.jpg` : undefined} muted loop playsInline preload="none" aria-label={f.alt} />
              <figcaption className="lc__label"><a href={reelUrl(reel(f.key))} target="_blank" rel="noopener">{f.label} ↗</a></figcaption>
            </figure>
          );
        })}
      </div>
      <button type="button" className="lc__pause" onClick={toggle} aria-label={paused ? "Play the films" : "Pause the films"}>{paused ? "Play" : "Pause"}</button>
      <div className="lc__shade" aria-hidden />
      <div className="lc__panel">
        <div>
          <p className="c-kicker">{kicker}</p>
          <Heading className="lc__title">Your day, painted <em>live.</em></Heading>
          <p className="lc__lede">{lede}</p>
        </div>
        <div className="lc__ctas">
          <Link href={primary.href} className="btn btn--ink"><span>{primary.label}</span><i>→</i></Link>
          {secondary && <Link href={secondary.href} className="btn btn--line"><span>{secondary.label}</span><i>→</i></Link>}
          <p className="c-avail">Now booking 2027<span>Limited dates each season</span></p>
        </div>
      </div>
    </section>
  );
}
