"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BASE } from "@/lib/base";

gsap.registerPlugin(ScrollTrigger);

const src = (key: string, w: number) => `${BASE}/img/${key}-${w}.webp`;
// she stands at the outer edge of each gate, so she stays in view as they open; phones show the right one
const GATES = [
  { key: "loc-noir", side: "l", alt: "Black and white portrait of Jyxdi holding up her charcoal Astral Serpent" },
  { key: "loc-live-paint", side: "r", alt: "Jyxdi in red, painting on stage in front of a giant neon screen" },
];

/** The About page opens on two photographs of her, side by side like closed gates, with light in the gap and her name across them.
    Desktop: the hero holds while the gates swing open into the room and the words behind them come forward.
    Phones and reduced motion: the photograph(s) with her name, then the words below. */
export default function TrailHero() {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const q = gsap.utils.selector(root.current);
    const mm = gsap.matchMedia();
    mm.add("(min-width: 900px) and (prefers-reduced-motion: no-preference)", () => {
      const tl = gsap.timeline({ defaults: { ease: "power2.inOut" }, scrollTrigger: { trigger: root.current, start: "top top", end: "+=110%", pin: true, scrub: 0.8, invalidateOnRefresh: true } });
      tl.to(q(".ab-door--l"), { rotateY: 84, duration: 1, ease: "sine.inOut" }, 0)
        .to(q(".ab-door--r"), { rotateY: -84, duration: 1, ease: "sine.inOut" }, 0)
        .to(q(".ab-door__shade"), { opacity: 1, duration: 0.8, ease: "power1.in" }, 0.1)
        .to(q(".ab-hero__seam, .ab-hero__cue"), { opacity: 0, duration: 0.25 }, 0.05)
        .to(q(".ab-door"), { opacity: 0, duration: 0.3, ease: "power1.in" }, 0.75)
        .fromTo(q(".ab-hero__glow"), { opacity: 0 }, { opacity: 1, duration: 0.6 }, 0.15)
        .fromTo(q(".ab-hero__statement, .ab-hero__crafts"), { y: 70, opacity: 0, scale: 0.96 }, { y: 0, opacity: 1, scale: 1, stagger: 0.1, duration: 0.55, ease: "power3.out" }, 0.38);
    });
    return () => mm.revert();
  }, []);
  return (
    <section ref={root} className="ab-hero" data-mood="black" aria-labelledby="ab-title">
      <div className="ab-hero__stage">
        <div className="ab-hero__doors">
          {GATES.map((g) => (
            <figure key={g.key} className={`ab-door ab-door--${g.side}`}>
              <img src={src(g.key, 1400)} srcSet={`${src(g.key, 800)} 800w, ${src(g.key, 1400)} 1400w`} sizes="(max-width: 899px) 100vw, 50vw" alt={g.alt}
                width={1400} height={1750} loading={g.side === "r" ? "eager" : "lazy"} fetchPriority={g.side === "r" ? "high" : "auto"} decoding="async" />
              <span className="ab-door__shade" aria-hidden />
            </figure>
          ))}
        </div>
        <span className="ab-hero__seam" aria-hidden />
        <div className="ab-hero__title">
          <p className="c-kicker">The artist · International wedding live painter</p>
          <h1 id="ab-title" className="ab-hero__name"><span>Jyxdi</span></h1>
        </div>
        <p className="ab-hero__cue" aria-hidden>Scroll to step inside</p>
      </div>
      <div className="ab-hero__inside">
        <span className="ab-hero__glow" aria-hidden />
        <p className="ab-hero__statement">Painter, educator and the creator of the <em>Spirit Gates</em> fandom.</p>
        <ul className="ab-hero__crafts" aria-label="What she makes"><li>Custom paintings</li><li>Murals</li><li>Digital art</li></ul>
      </div>
    </section>
  );
}
