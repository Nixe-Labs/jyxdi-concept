"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import CircularGallery from "@/components/rb/CircularGallery";
import { Circled } from "@/components/sketch/Marks";
import { FEATURED, largest } from "@/lib/catalog";
import { serif } from "@/lib/fonts";

const ITEMS = FEATURED.map((w) => ({ image: largest(w), text: w.t.replace(/\s*\(.*\)/, "") }));

export default function StudioWall() {
  const stage = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setNear(e.isIntersecting), { rootMargin: "300px 0px" });
    io.observe(stage.current!); return () => io.disconnect();
  }, []);
  return (
    <section className="section !px-0">
      <div className="section__head px-[var(--gutter)]">
        <div>
          <p className="kicker"><b>Favourites</b> from the studio wall</p>
          <h2 className="display display--md">Eight to <Circled seed="start"><em>start</em></Circled> with.</h2>
        </div>
        <p className="note m-0">← drag me, or just keep scrolling →</p>
      </div>
      <div className="wall-stage" ref={stage} data-cursor="Drag">
        {near && <CircularGallery items={ITEMS} bend={2} textColor="#1f1b18" borderRadius={0.02} font={`italic 400 36px ${serif.style.fontFamily}`} scrollSpeed={2} scrollEase={0.05} />}
      </div>
      <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 px-[var(--gutter)]">
        {FEATURED.map((w) => <Link key={w.slug} href={`/shop/${w.slug}/`} className="font-serif text-[22px] italic text-graphite hover:text-red">{w.t}</Link>)}
      </div>
    </section>
  );
}
