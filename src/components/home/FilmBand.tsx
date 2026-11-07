"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BASE } from "@/lib/base";
import { reel, reelUrl } from "@/lib/reels";

gsap.registerPlugin(ScrollTrigger);

/** A quiet film between sections: her painting at a Hindu wedding, slowed to half speed, silent, edge to edge.
    Its top and bottom dissolve into the page; it plays only while on screen and can be paused (WCAG 2.2.2).
    The footage is a caption-free crop of her reel. With reduced motion it stays a still. */
export default function FilmBand() {
  const root = useRef<HTMLElement>(null), video = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);
  const [near, setNear] = useState(false); // its poster loads as the band comes near, not with the page
  const pausedRef = useRef(false);
  useEffect(() => {
    const el = root.current!, v = video.current!;
    const ahead = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setNear(true); ahead.disconnect(); } }, { rootMargin: "150% 0px" });
    ahead.observe(el);
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting && !still && !pausedRef.current) v.play().catch(() => {}); else v.pause(); }, { rootMargin: "15% 0px" });
    io.observe(el);
    let t: gsap.core.Tween | undefined;
    if (!still) t = gsap.fromTo(v, { scale: 1.12, yPercent: -3 }, { scale: 1, yPercent: 3, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
    return () => { ahead.disconnect(); io.disconnect(); v.pause(); t?.scrollTrigger?.kill(); t?.kill(); };
  }, []);
  const toggle = () => {
    const next = !pausedRef.current; pausedRef.current = next; setPaused(next);
    const v = video.current!; if (next) v.pause(); else v.play().catch(() => {});
  };
  return (
    <section ref={root} className="fb" data-mood="cream" aria-label="Jyxdi painting live at a wedding">
      <div className="fb__frame">
        <video ref={video} src={`${BASE}/video/film-band.mp4`} poster={near ? `${BASE}/video/film-band.jpg` : undefined} muted loop playsInline preload="none" aria-hidden />
        <div className="fb__veil" aria-hidden />
        <div className="fb__copy">
          <p className="c-kicker">Painted live</p>
          <p className="fb__line">At the wedding, in front of every guest, <em>stroke by stroke.</em></p>
          <a className="fb__link" href={reelUrl(reel("live-hindu-couple"))} target="_blank" rel="noopener">Watch the full reel ↗</a>
        </div>
        <button type="button" className="fb__pause" onClick={toggle} aria-label={paused ? "Play the film" : "Pause the film"}>{paused ? "Play" : "Pause"}</button>
      </div>
    </section>
  );
}
