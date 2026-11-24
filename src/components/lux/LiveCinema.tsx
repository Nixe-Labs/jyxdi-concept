"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { reel, reelUrl } from "@/lib/reels";
import { drawLine, lightWall, magnet } from "@/components/home/wall";
import { BASE } from "@/lib/base";

gsap.registerPlugin(ScrollTrigger);

// left, middle (seen first, through the wide window, and the only one on phones: a highlight cut from her reels of four
// weddings), right. Each file is cut from her reels where their burned-in Instagram text never shows: the top 60% of the
// frame, or a stretch with no text at all.
const FILMS = [
  { key: "live-west-indian", file: "lc-west-indian", label: "A West Indian wedding", alt: "Jyxdi painting live at a West Indian wedding" },
  { key: "highlights", file: "lc-highlight", label: "Highlights from her weddings", alt: "Jyxdi painting live at four weddings, from the first brushstrokes to the finished painting", lead: true, href: "https://www.instagram.com/jyxdi/reels/" },
  { key: "live-hindu-couple", file: "lc-hindu-couple", label: "A Hindu wedding", alt: "Jyxdi painting live at a Hindu wedding" },
];

type Cta = { href: string; label: string };

/** Her live painting, full screen. Desktop: the words sit on the left beside a wide window onto one wedding. Painted live:
    as the section arrives the film in its window is a warm pencil sketch, a gold frame draws round it like a painting's,
    and colour brushes across it, left to right, while the title rises line by line and a gold stroke draws under "live.".
    Then the section holds while the window grows to fill the screen (the frame falling away) and two more weddings slide
    in beside it, and the words settle at the films' foot. A warm stage light follows the cursor round the window, and the
    buttons lean toward it (wall.ts).
    Phones: one wedding opens to full screen as it scrolls in, fading from sketch to colour. Reduced motion: the finished
    frame in colour, no autoplay. */
export default function LiveCinema({ as: Heading = "h2", kicker = "Live painting · Weddings and events",
  lede = "Jyxdi paints your celebration as it happens, in front of your guests, from Hindu and West Indian ceremonies to outdoor weddings. You keep an original painting of the day.",
  primary = { href: "/live-painting/#inquire", label: "Check your wedding date" }, secondary = { href: "/live-painting/", label: "How it works" } }:
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
    const lines = q(".lc__line > span"), title = el.querySelector(".lc__title")!, stroke = el.querySelector(".c-swash path");
    mm.add("(min-width: 900px) and (prefers-reduced-motion: no-preference)", () => {
      el.classList.add("is-cinema");
      const films = el.querySelector<HTMLElement>(".lc__films")!, panel = el.querySelector<HTMLElement>(".lc__panel")!, sketch = el.querySelector<HTMLElement>(".lc__sketch")!;
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
        .fromTo(q(".lc__label"), { opacity: 0 }, { opacity: 1, stagger: 0.05, duration: 0.25 }, 0.74)
        .fromTo(films, { "--fo": 1 }, { "--fo": 0, ease: "none", duration: 0.25 }, 0); // the gold frame falls away as the window grows
      // painted live, on the way in (before the hold): the frame draws, then colour brushes across the sketch. The sketch's
      // backdrop filter is costly over a playing film, so it goes once the colour is all in: a set inside the timeline,
      // which still lands when a refresh (Back, a resize) moves the playhead with callbacks suppressed, and undoes going up
      const arrive = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 80%", end: "top top", scrub: 0.8 } });
      arrive.fromTo(films, { "--frame": 0 }, { "--frame": 1, ease: "power2.out", duration: 0.45 }, 0)
        .fromTo(films, { "--paint": 0 }, { "--paint": 1, ease: "power1.inOut", duration: 0.75 }, 0.25)
        .set(sketch, { visibility: "hidden" }, 1);
      // the title rises line by line, then (once it is up) the gold stroke draws under "live.", both before the hold.
      // y: 0, because a branch made again after a resize reads the last offset back as px and would add a line to it
      const rise = gsap.fromTo(lines, { y: 0, yPercent: 120 }, { yPercent: 0, ease: "power3.out", stagger: 0.12, scrollTrigger: { trigger: el, start: "top 70%", end: "top 15%", scrub: 0.8 } });
      const draw = drawLine(stroke, { trigger: el, start: "top 32%", end: "top 2%" });
      return () => { el.classList.remove("is-cinema"); sketch.style.visibility = ""; [tl, arrive, rise, draw].forEach((t) => { if (t) { t.scrollTrigger?.kill(); t.kill(); } }); };
    });
    mm.add("(max-width: 899px) and (prefers-reduced-motion: no-preference)", () => {
      // the film opens and fades from sketch to colour; then its filter goes, so a playing film has no filter pass left
      const t = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 90%", end: "top 8%", scrub: 0.5 } })
        .fromTo(q(".lc__films"), { clipPath: "inset(7% 8% 7% 8% round 22px)", "--paint": 0 }, { clipPath: "inset(0% 0% 0% 0% round 0px)", "--paint": 1, ease: "none", duration: 1 })
        .set(q(".lc__film video"), { filter: "none" }, 1);
      const rise = gsap.fromTo(lines, { y: 0, yPercent: 120 }, { yPercent: 0, ease: "power3.out", stagger: 0.12, scrollTrigger: { trigger: title, start: "top 95%", end: "top 62%", scrub: 0.8 } });
      const draw = drawLine(stroke, { start: "top 92%", end: "top 58%" });
      return () => { [t, rise, draw].forEach((x) => { if (x) { x.scrollTrigger?.kill(); x.kill(); } }); };
    });
    mm.add("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
      const offs = [lightWall(el, []), ...gsap.utils.toArray<HTMLElement>(".lc__ctas .btn", el).map(magnet)];
      return () => offs.forEach((off) => off());
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
        <span className="lc__sketch" aria-hidden />
        {FILMS.map((f) => {
          return (
            <figure key={f.key} className={`lc__film ${f.lead ? "is-lead" : ""}`}>
              <video src={`${BASE}/video/${f.file}.mp4`} poster={near && (f.lead || wide) ? `${BASE}/video/${f.file}.jpg` : undefined} muted loop playsInline preload="none" aria-label={f.alt} />
              <figcaption className="lc__label"><a href={f.href ?? reelUrl(reel(f.key))} target="_blank" rel="noopener">{f.label} ↗</a></figcaption>
            </figure>
          );
        })}
      </div>
      <button type="button" className="lc__pause" onClick={toggle} aria-label={paused ? "Play the films" : "Pause the films"}>{paused ? "Play" : "Pause"}</button>
      <div className="lc__shade" aria-hidden />
      <div className="lc__panel">
        <div>
          <p className="c-kicker">{kicker}</p>
          <Heading className="lc__title"><span className="lc__line"><span>Your day,</span></span> <span className="lc__line"><span>painted <span className="c-loud"><em>live.</em><svg className="c-swash" viewBox="0 0 300 30" preserveAspectRatio="none" aria-hidden><path d="M4 20 C 52 8, 104 27, 160 15 S 252 5, 296 13" pathLength={1} /></svg></span></span></span></Heading>
          <p className="lc__lede">{lede}</p>
        </div>
        <div className="lc__ctas">
          <Link href={primary.href} className="btn btn--ink"><span>{primary.label}</span><i>→</i></Link>
          {secondary && <Link href={secondary.href} className="btn btn--line"><span>{secondary.label}</span><i>→</i></Link>}
          <p className="c-avail">Now booking 2027 &amp; 2028<span>Limited dates each season</span></p>
        </div>
      </div>
    </section>
  );
}
