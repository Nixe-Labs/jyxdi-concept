"use client";
import { useEffect, useRef, useState } from "react";
import ReelCard from "@/components/lux/ReelCard";
import FadeIn from "@/components/home/FadeIn";
import { reel } from "@/lib/reels";

// the other live reels (the three weddings at the top of the page play in the films)
const KEYS = ["live-hindu-guests", "live-guest-reactions"];

/** Two more weddings, big and unframed. They play silently while on screen; one button pauses both (WCAG 2.2.2). */
export default function Reels() {
  const ref = useRef<HTMLElement>(null);
  const held = useRef(false);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const el = ref.current!;
    // ReelCard starts a reel again whenever it scrolls back in: keep it still once the visitor has paused
    const hold = (e: Event) => { if (held.current) (e.target as HTMLVideoElement).pause(); };
    el.addEventListener("play", hold, true);
    return () => el.removeEventListener("play", hold, true);
  }, []);
  const toggle = () => {
    held.current = !held.current;
    setPaused(held.current);
    ref.current!.querySelectorAll("video").forEach((v) => (held.current ? v.pause() : v.dataset.inview && v.play().catch(() => {})));
  };
  return (
    <section ref={ref} id="reels" className="lp-reels section" data-mood="cream" aria-labelledby="lp-reels-title">
      <div className="lp-reels__head">
        <FadeIn stagger={0.1} y={30}>
          <p className="c-kicker">From her Instagram</p>
          <h2 id="lp-reels-title" className="c-h2">Watch her <em>paint.</em></h2>
        </FadeIn>
        <FadeIn y={30} delay={0.15}>
          <p className="lede">Guests gather round the easel while the painting comes to life. These previews are silent; open a reel on Instagram to watch it with sound.</p>
          <div className="lp-reels__actions">
            <a className="c-link" href="https://www.instagram.com/jyxdi/" target="_blank" rel="noopener">More reels on @jyxdi ↗</a>
            <button type="button" className="lp-pause" onClick={toggle}>{paused ? "Play the films" : "Pause the films"}</button>
          </div>
        </FadeIn>
      </div>
      <FadeIn className="lp-reels__row" stagger={0.15} y={50}>
        {KEYS.map((k) => <ReelCard key={k} reel={reel(k)} />)}
      </FadeIn>
    </section>
  );
}
