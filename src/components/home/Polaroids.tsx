"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import FadeIn from "@/components/home/FadeIn";
import ReelCard from "@/components/lux/ReelCard";
import { reel } from "@/lib/reels";
import { BASE } from "@/lib/base";

gsap.registerPlugin(ScrollTrigger);

// key, caption, alt, taller crop; dealt into three columns (0, 3, 6 · 1, 4, 7 · 2, 5, 8)
const SHOTS: [string, string, string, boolean?][] = [
  ["loc-kalki-horse", "Kalki, on the beach", "Jyxdi on the beach beside a white horse and her Kalki painting", true],
  ["loc-batu-caves", "Murugan at Batu Caves", "Jyxdi with her Murugan painting in front of the golden Murugan statue"],
  ["loc-river", "Painting Bloom outside", "Jyxdi painting Bloom beside a river"],
  ["loc-thadam-glow", "தடம், under neon", "Close view of the Thadam canvas in neon light"],
  ["loc-kali-shore", "Kali vs the tide", "Jyxdi with her Kali painting on a rocky shoreline", true],
  ["loc-blossoms", "Radha Krishna in bloom", "The Radha Krishna painting under cherry blossoms"],
  ["loc-kalabhairava", "Palette still wet", "Jyxdi with Kalabhairava and her palette"],
  ["loc-hanuman", "With Hanuman", "Jyxdi seated beside her Hanuman painting"],
  ["loc-durgai-blossom", "Durgai, among the blossoms", "The Durgai painting among white blossoms, with her palette", true],
];
const COLS = [0, 1, 2].map((c) => SHOTS.map((s, i) => [s, i] as const).filter(([, i]) => i % 3 === c));
const src = (key: string, w: number) => `${BASE}/img/${key}-${w}.webp`;

/** Her camera roll: photographs of her and her paintings out in the world, clean and unframed.
    Desktop: three columns that drift at their own pace as the page goes by. */
export default function Polaroids() {
  const grid = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(min-width: 900px) and (prefers-reduced-motion: no-preference)", () => {
      [70, -90, 30].forEach((d, i) => gsap.fromTo(grid.current!.children[i], { y: d }, { y: -d, ease: "none", scrollTrigger: { trigger: grid.current, start: "top bottom", end: "bottom top", scrub: true } }));
    });
    return () => mm.revert();
  }, []);
  return (
    <section className="ab-roll section" data-mood="cream" aria-labelledby="ab-roll-title">
      <div className="ab-roll__head">
        <FadeIn stagger={0.1} y={30}>
          <p className="c-kicker">Off the wall</p>
          <h2 id="ab-roll-title" className="c-h2">From the camera roll of a <em>travelling painter.</em></h2>
        </FadeIn>
        <FadeIn as="p" className="lede" y={30} delay={0.15}>Beaches, temples, rivers and stages: her paintings, out in the world with her.</FadeIn>
      </div>
      <div className="ab-roll__grid" ref={grid}>
        {COLS.map((col, c) => (
          <div className="ab-roll__col" key={c}>
            {col.map(([[key, cap, alt, tall], i]) => (
              <FadeIn as="figure" key={key} className={`ab-shot ${tall ? "ab-shot--tall" : ""}`} y={50}>
                <div className="ab-shot__media"><img src={src(key, 800)} srcSet={`${src(key, 800)} 800w, ${src(key, 1400)} 1400w`} sizes="(max-width: 899px) 46vw, 30vw" alt={alt} width={800} height={1000} loading="lazy" decoding="async" /></div>
                <figcaption><i>{String(i + 1).padStart(2, "0")}</i>{cap}</figcaption>
              </FadeIn>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

const FILMS = ["art-journey", "studio-process", "studio-sold"];

/** Her journey in three of her reels. They play silently while on screen; one button pauses them all (WCAG 2.2.2). */
export function Films() {
  const ref = useRef<HTMLElement>(null);
  const held = useRef(false);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const el = ref.current!;
    // ReelCard plays a reel again whenever it scrolls back in: keep it still once the visitor has paused
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
    <section ref={ref} className="ab-films section" data-mood="cream" aria-labelledby="ab-films-title">
      <div className="ab-films__head">
        <FadeIn stagger={0.1} y={30}>
          <p className="c-kicker">Her journey · From her Instagram</p>
          <h2 id="ab-films-title" className="c-h2">Stroke by <em>stroke.</em></h2>
        </FadeIn>
        <FadeIn y={30} delay={0.15}>
          <p className="lede">From pencil sketches to UV murals, detail stroke by stroke, and an oil painting from first sketch to sold. These previews are silent; open a reel on Instagram to watch it with sound.</p>
          <div className="ab-films__actions">
            <a className="c-link" href="https://www.instagram.com/jyxdi/" target="_blank" rel="noopener">More reels on @jyxdi ↗</a>
            <button type="button" className="ab-pause" onClick={toggle}>{paused ? "Play the reels" : "Pause the reels"}</button>
          </div>
        </FadeIn>
      </div>
      <FadeIn className="ab-films__row" stagger={0.15} y={60}>
        {FILMS.map((k) => <ReelCard key={k} reel={reel(k)} />)}
      </FadeIn>
    </section>
  );
}
