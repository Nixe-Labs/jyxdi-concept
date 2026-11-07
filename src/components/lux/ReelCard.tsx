"use client";
import { useEffect, useRef, useState } from "react";
import { reelPoster, reelSrc, reelUrl, type Reel } from "@/lib/reels";

/** One of her reels in a slim gold-edged phone frame: plays silently while on screen, pauses when it leaves.
    With reduced motion it never autoplays; it shows the poster and the player controls instead. */
export default function ReelCard({ reel, className = "", caption = true }: { reel: Reel; className?: string; caption?: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [still, setStill] = useState(false);
  useEffect(() => {
    const v = ref.current!;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { setStill(true); return; }
    // data-inview: a "Play the reels" button resumes only the reels on screen
    const io = new IntersectionObserver(([e]) => { v.dataset.inview = e.isIntersecting ? "1" : ""; if (e.isIntersecting) v.play().catch(() => {}); else v.pause(); }, { threshold: 0.3 });
    io.observe(v);
    return () => { io.disconnect(); v.pause(); };
  }, []);
  return (
    <figure className={`lx-reel ${className}`}>
      <div className="lx-reel__screen">
        <video ref={ref} src={reelSrc(reel)} poster={reelPoster(reel)} muted loop playsInline preload="none" controls={still} aria-label={reel.label} />
      </div>
      {caption && <figcaption>{reel.label}<br /><a href={reelUrl(reel)} target="_blank" rel="noopener">Watch with sound on Instagram ↗</a></figcaption>}
    </figure>
  );
}
