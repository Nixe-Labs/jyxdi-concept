"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import FadeIn from "@/components/home/FadeIn";
import { BASE } from "@/lib/base";

gsap.registerPlugin(ScrollTrigger);

const STEPS: [string, string][] = [
  ["Send an inquiry", "Share your date, venue and city with the form below, and anything you already have in mind."],
  ["Plan the moment", "Together you choose what she paints (the couple, a ceremony moment, the venue) and the size of the canvas."],
  ["She paints live", "On the day, Jyxdi paints at your event in front of your guests, while the celebration carries on around her."],
  ["Keep the original", "The finished painting is yours: an original of your day, by Jyxdi."],
];
const photo = (w: number) => `${BASE}/img/loc-live-paint-${w}.webp`;

/** How it works, on burgundy, beside the photo of her painting the Thadam canvas on stage: the photo stays
    while the steps go by, and a gold line runs down them, lighting each step as it arrives. */
export default function How() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current!;
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      el.classList.add("is-armed");
      gsap.fromTo(el.querySelector(".lp-steps__rail i"), { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: el.querySelector(".lp-steps"), start: "top 62%", end: "bottom 62%", scrub: 0.4 } });
      gsap.utils.toArray<HTMLElement>(".lp-step", el).forEach((li) => ScrollTrigger.create({ trigger: li, start: "top 62%", toggleClass: "is-on" }));
      return () => el.classList.remove("is-armed");
    });
    return () => mm.revert();
  }, []);
  return (
    <section ref={ref} id="how" className="lp-how section" data-mood="cream" aria-labelledby="lp-how-title">
      <div className="lp-how__grid">
        <figure className="lp-how__media">
          <div className="lp-how__photo">
            <img src={photo(1400)} srcSet={`${photo(800)} 800w, ${photo(1400)} 1400w`} sizes="(max-width: 899px) 100vw, 46vw" width={1400} height={1750} alt="Jyxdi in red sequins, painting a canvas on stage, with the painting shown on a giant screen behind her" loading="lazy" decoding="async" />
          </div>
          <figcaption>Jyxdi, painting live on stage</figcaption>
        </figure>
        <div className="lp-how__copy">
          <FadeIn stagger={0.1} y={30}>
            <p className="c-kicker">How it works</p>
            <h2 id="lp-how-title" className="c-h2">From first message to the <em>last stroke.</em></h2>
          </FadeIn>
          <div className="lp-steps">
            <span className="lp-steps__rail" aria-hidden><i /></span>
            <ol>
              {STEPS.map(([title, text], i) => (
                <FadeIn as="li" key={title} className="lp-step" y={30}>
                  <span className="lp-step__n">0{i + 1}</span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </FadeIn>
              ))}
            </ol>
            <div className="lp-steps__cta"><Link href="#inquire" className="btn btn--ink"><span>Check your date</span><i>→</i></Link><p className="c-avail">Now booking 2027 &amp; 2028<span>Limited dates each season</span></p></div>
          </div>
        </div>
      </div>
    </section>
  );
}
