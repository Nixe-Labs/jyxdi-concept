"use client";
import { useEffect, useRef, useState } from "react";
import FadeIn from "@/components/home/FadeIn";
import { BASE } from "@/lib/base";

const REEL = "https://www.instagram.com/reel/Dc1NqrjTg-w/";
// cut from her reel "Behind the Hybrids, Episode 2" (one couple's Mehndi night), cropped clear of its on-screen text
const STAGES = [
  { when: "Three weeks before", title: "The sketch", text: "Jyxdi designs the painting on her iPad in Procreate, from the couple's own photos: the pose, the outfits, every colour.", video: "hy-sketch", alt: "Her stylus drawing the couple in Procreate" },
  { when: "Before the day", title: "The canvas", text: "The finished design goes onto canvas, ready for the celebration.", img: "hy-canvas-760.webp", alt: "The finished design of the bride and groom" },
  { when: "On the night", title: "Painted live", text: "At the event she paints the final details by hand, in front of the guests.", video: "hy-live", alt: "Jyxdi painting the canvas on a rooftop at the couple's Mehndi night" },
];

/** Her hybrid process, shown with one real commission: Procreate sketch, canvas, hand-painted live. The two clips play
    silently while on screen; one button pauses them (WCAG 2.2.2); with reduced motion they show a still. */
export default function Hybrid() {
  const ref = useRef<HTMLElement>(null);
  const [paused, setPaused] = useState(false);
  const [still, setStill] = useState(false);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { setStill(true); return; }
    const vids = [...ref.current!.querySelectorAll("video")];
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      const v = e.target as HTMLVideoElement;
      v.dataset.inview = e.isIntersecting ? "1" : "";
      if (e.isIntersecting && !ref.current?.classList.contains("is-paused")) v.play().catch(() => {}); else v.pause();
    }), { threshold: 0.3 });
    vids.forEach((v) => io.observe(v));
    return () => { io.disconnect(); vids.forEach((v) => v.pause()); };
  }, []);
  const toggle = () => {
    const next = !paused;
    setPaused(next);
    ref.current!.querySelectorAll("video").forEach((v) => (next ? v.pause() : v.dataset.inview && v.play().catch(() => {})));
  };
  return (
    <section ref={ref} className={`lp-hy section ${paused ? "is-paused" : ""}`} data-mood="cream" aria-labelledby="lp-hy-title">
      <div className="lp-hy__head">
        <FadeIn stagger={0.1} y={30}>
          <p className="c-kicker">The hybrid process</p>
          <h2 id="lp-hy-title" className="c-h2">Designed first,<br /> <em>painted live.</em></h2>
        </FadeIn>
        <FadeIn y={30} delay={0.15}>
          <p className="lede">Every live painting begins weeks before the day. This one was made for a couple&apos;s Mehndi night: Procreate, then canvas, then her brush, live.</p>
          <div className="lp-reels__actions">
            <a className="c-link" href={REEL} target="_blank" rel="noopener">Watch the whole story on Instagram ↗</a>
            {!still && <button type="button" className="lp-pause" onClick={toggle}>{paused ? "Play the films" : "Pause the films"}</button>}
          </div>
        </FadeIn>
      </div>
      <FadeIn as="ol" className="lp-hy__row" stagger={0.12} y={40}>
        {STAGES.map((s, i) => (
          <li key={s.title} className="lp-hy__stage">
            <div className="lp-hy__media">
              {s.video
                ? <video src={`${BASE}/video/${s.video}.mp4`} poster={`${BASE}/video/${s.video}.jpg`} muted loop playsInline preload="none" controls={still} aria-label={s.alt} />
                : <img src={`${BASE}/img/${s.img}`} width={760} height={950} alt={s.alt} loading="lazy" decoding="async" />}
            </div>
            <p className="lp-hy__when"><span>0{i + 1}</span>{s.when}</p>
            <h3>{s.title}</h3>
            <p>{s.text}</p>
          </li>
        ))}
      </FadeIn>
    </section>
  );
}
