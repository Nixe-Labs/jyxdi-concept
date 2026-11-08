"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { BASE } from "@/lib/base";

const photo = (w: number) => `${BASE}/img/loc-saraswati-${w}.webp`;

/** The face of the site: Jyxdi, full height on the right, the words on cream on the left.
    The photo opens upward, the title rises line by line; the photo drifts slower than the page. */
export default function Hero() {
  const drift = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = gsap.fromTo(drift.current, { yPercent: -4 }, { yPercent: 7, ease: "none", scrollTrigger: { trigger: drift.current, start: "top top", end: "bottom top", scrub: true } });
    return () => { t.scrollTrigger?.kill(); t.kill(); };
  }, []);
  return (
    <section className="lh" data-mood="cream">
      <div className="lh__copy">
        <p className="c-kicker lh__kicker">International wedding live painter · Fine art</p>
        <h1 className="lh__title">
          <span className="lh__line"><span>Myths,</span></span>
          <span className="lh__line"><span>painted</span></span>
          <span className="lh__line"><span className="lh__loud"><em>loud.</em><svg className="lh__swash" viewBox="0 0 300 30" preserveAspectRatio="none" aria-hidden><path d="M4 20 C 52 8, 104 27, 160 15 S 252 5, 296 13" pathLength={1} /></svg></span></span>
        </h1>
        <p className="lede">Original paintings of gods in streetwear, cosmic portraits and goddesses in full colour, and live paintings of your wedding, made in front of your guests.</p>
        <div className="lh__ctas">
          <Link href="/shop/" className="btn btn--ink"><span>View our gallery</span><i>→</i></Link>
          <Link href="/live-painting/" className="c-link">Book live painting →</Link>
        </div>
        <div className="lh__meta">
          <ul className="lh__trust"><li>Hand-signed certificate</li><li>Ships worldwide</li><li>Art prints from $90</li></ul>
          <p className="lh__collab">Collaborations with <b>Michael B. Jordan · COACH · XO · OVO40</b></p>
        </div>
      </div>
      <div className="lh__media">
        <div className="lh__drift" ref={drift}>
          <img src={photo(1400)} srcSet={`${photo(800)} 800w, ${photo(1400)} 1400w`} sizes="(max-width: 899px) 100vw, 50vw" width={1400} height={1862} alt="Jyxdi in a bright white studio beside her Saraswati painting" fetchPriority="high" decoding="async" />
        </div>
        <span className="lh__tag">Jyxdi, with her Saraswati</span>
      </div>
      <p className="lh__scroll" aria-hidden>Scroll</p>
    </section>
  );
}
