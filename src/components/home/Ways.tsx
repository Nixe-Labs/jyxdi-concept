"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import FadeIn from "./FadeIn";
import { lightWall, lean, magnet, drawLine } from "./wall";
import { bySlug, smallest, type Work } from "@/lib/catalog";
import { BASE } from "@/lib/base";

const THADAM = bySlug("thadam") as Work;
const img = (name: string) => ({ src: `${BASE}/img/${name}-800.webp`, srcSet: `${BASE}/img/${name}-800.webp 800w, ${BASE}/img/${name}-1400.webp 1400w` });

const WAYS = [
  { n: "i", name: "Fine Art Print", src: smallest(THADAM), srcSet: undefined, cap: THADAM.t, alt: `${THADAM.t}, painting by Jyxdi`, line: "Printed on paper with archival, fade-resistant inks, true to every colour she paints. The easiest way to begin a collection." },
  { n: "ii", name: "Premium Canvas", ...img("loc-thadam-easel"), cap: "On canvas", alt: `${THADAM.t} on canvas, on an easel`, line: "Printed on canvas with archival inks, then stretched and ready to hang the day it arrives." },
  { n: "iii", name: "Signature UV Glow Canvas", ...img("loc-thadam-uv"), cap: "Under blacklight", alt: `${THADAM.t} on canvas, glowing under blacklight`, line: "The canvas, with fluorescent pigment painted on by hand. By day it looks like the original; under a blacklight, it lights up." },
];
// the three as one stack, like a single print: the print on top, the canvas and the blacklight one peeking out beneath
const STACK = [{ r: -2, y: 0 }, { r: 5, y: 16 }, { r: -6, y: 30 }];

/** One painting three ways, on the homepage after the featured artwork (whose button already leads to the shop): the
    painting itself, the canvas on its easel, the canvas under blacklight. No prices here: the shop's formats scene
    (/shop/#formats) tells the whole story. On the scroll (both ways), in three columns the three arrive stacked as one
    painting and fan out to their places, their words rising in after, and the blacklight one's blue glow comes up as it
    lands; in one column each is unveiled from under its drape. On a desktop, the featured artwork's lit wall (wall.ts). */
export default function Ways() {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = root.current!;
    const ways = gsap.utils.toArray<HTMLElement>(".sx-way", el);
    const grid = el.querySelector<HTMLElement>(".sx-ways__grid")!, uv = el.querySelector<HTMLElement>(".sx-way--uv")!;
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => { drawLine(el.querySelector(".c-swash path")); });

    mm.add("(min-width: 700px) and (prefers-reduced-motion: no-preference)", () => {
      // the stack rises into view as one, then fans out while it is on screen; the words follow, then the glow
      const tl = gsap.timeline({ scrollTrigger: { trigger: grid, start: "top 80%", end: "top 10%", scrub: 1, invalidateOnRefresh: true } });
      ways.forEach((w, i) => {
        // from the middle of the grid (layout positions: offsetLeft ignores the transform) out to its own column
        tl.fromTo(w, { x: () => grid.offsetLeft + grid.offsetWidth / 2 - (w.offsetLeft + w.offsetWidth / 2), y: STACK[i].y, rotation: STACK[i].r, scale: 0.9 },
          { x: 0, y: 0, rotation: 0, scale: 1, ease: "power2.inOut", duration: 0.5 }, 0.28);
        tl.fromTo(w.querySelector(".sx-way__body"), { opacity: 0, y: 24 }, { opacity: 1, y: 0, ease: "power2.out", duration: 0.2 }, 0.7 + i * 0.05);
      });
      tl.fromTo(uv, { "--uvg": 0 }, { "--uvg": 1, ease: "none", duration: 0.18 }, 0.82);
    });

    mm.add("(max-width: 699px) and (prefers-reduced-motion: no-preference)", () => {
      ways.forEach((w) => gsap.fromTo(w, { "--fu": 1 }, { "--fu": 0, ease: "none", scrollTrigger: { trigger: w, start: "top 92%", end: "top 50%", scrub: 0.8 } }));
      gsap.fromTo(uv, { "--uvg": 0 }, { "--uvg": 1, ease: "none", scrollTrigger: { trigger: uv, start: "top 50%", end: "top 25%", scrub: 0.8 } });
    });

    mm.add("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
      const frames = ways.map((w) => w.querySelector<HTMLElement>(".sx-way__frame")!);
      const offs = [lightWall(el, frames), ...ways.map((w) => lean(w, w.querySelector<HTMLElement>(".sx-way__media")!)), ...gsap.utils.toArray<HTMLElement>(".sx-ways__foot .btn", el).map(magnet)];
      return () => offs.forEach((off) => off());
    });
    return () => mm.revert();
  }, []);

  return (
    <section ref={root} className="section sx-ways" data-mood="cream" aria-labelledby="sx-ways-title">
      <FadeIn className="section__head" stagger={0.1} y={30}>
        <div>
          <p className="c-kicker">One painting, three ways</p>
          <h2 id="sx-ways-title" className="c-h2">Three ways to own a <span className="c-loud"><em>JYXDI.</em><svg className="c-swash" viewBox="0 0 300 30" preserveAspectRatio="none" aria-hidden><path d="M4 20 C 52 8, 104 27, 160 15 S 252 5, 296 13" pathLength={1} /></svg></span></h2>
        </div>
        <p className="lede">Every painting comes as a Fine Art Print, a Premium Canvas or a Signature UV Glow Canvas, in four sizes from 16×20″ up to 48×60″. Here is {THADAM.t} in each.</p>
      </FadeIn>
      <div className="sx-ways__grid">
        {WAYS.map((w) => (
          <article key={w.n} className={`sx-way ${w.n === "iii" ? "sx-way--uv" : ""}`}>
            <div className="sx-way__frame">
              <figure className="sx-way__media">
                <img src={w.src} srcSet={w.srcSet} sizes="(max-width: 699px) 92vw, 30vw" alt={w.alt} loading="lazy" decoding="async" />
                <figcaption className="sx-way__cap">{w.cap}</figcaption>
              </figure>
            </div>
            <div className="sx-way__body">
              <p className="sx-way__n" aria-hidden>{w.n}.</p>
              <h3>{w.name}</h3>
              <p className="sx-way__line">{w.line}</p>
            </div>
          </article>
        ))}
      </div>
      <div className="sx-ways__foot">
        <div>
          <Link href="/shop/#formats" className="btn btn--ink"><span>Explore art formats</span><i>→</i></Link>
        </div>
      </div>
    </section>
  );
}
