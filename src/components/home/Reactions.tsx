"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import ReelCard from "@/components/lux/ReelCard";
import FadeIn from "./FadeIn";
import type { Reel } from "@/lib/reels";

// the reveal at three weddings, 4:5 loops cut from her reels (ig); two keep their burned-in words, what was said at the sight of it
const REVEALS: Reel[] = [
  { key: "react-hindu", ig: "DfFbE6sTP1M", label: "A Hindu wedding: “That looks like me.”", kind: "live" },
  { key: "react-tamil", ig: "DfPtxxYzqnC", label: "A Tamil wedding: the reveal", kind: "live" },
  { key: "react-toronto", ig: "DfZ-Rc4v1r9", label: "Outdoors in Toronto: “That is insane.”", kind: "live" },
];

/** After the films: real couples seeing their painting, then the one button that books her. They play silently while
    on screen; one button pauses all three (WCAG 2.2.2). */
export default function Reactions() {
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
    <section ref={ref} className="rx section" data-mood="black" aria-labelledby="rx-title">
      <div className="rx__head">
        <FadeIn stagger={0.1} y={30}>
          <p className="c-kicker">The reveal</p>
          <h2 id="rx-title" className="c-h2">The moment they <em>see it.</em></h2>
        </FadeIn>
        <FadeIn y={30} delay={0.15}>
          <p className="lede">Real couples, seeing their painting for the first time. These previews are silent; open one on Instagram to watch it with sound.</p>
          <button type="button" className="rx__pause" onClick={toggle}>{paused ? "Play the films" : "Pause the films"}</button>
        </FadeIn>
      </div>
      <FadeIn className="rx__row" stagger={0.15} y={50}>
        {REVEALS.map((r) => <ReelCard key={r.key} reel={r} />)}
      </FadeIn>
      <FadeIn className="rx__ask" y={30}>
        <Link href="/live-painting/#inquire" className="btn btn--gold btn--lg"><span>Check your wedding date</span><i>→</i></Link>
        <p className="c-avail">Now booking 2027 &amp; 2028<span>Canada, the USA &amp; worldwide</span></p>
      </FadeIn>
    </section>
  );
}
