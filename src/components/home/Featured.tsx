"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import FadeIn from "./FadeIn";
import { lightWall, lean, magnet, drawLine } from "./wall";
import ProductCard from "@/components/shop/ProductCard";
import { WORKS, CAT_LABEL, type Category } from "@/lib/catalog";

gsap.registerPlugin(ScrollTrigger);

const NEWEST = [...WORKS].sort((a, b) => b.created.localeCompare(a.created)).slice(0, 8);
const CATS = Object.keys(CAT_LABEL) as Category[];

/** Featured artwork (Akka's homepage plan, after the hero): the newest paintings in a plain grid, and the way into the
    shop by subject. Bestsellers join it once Akka names them. vt={false}: the gallery wall below carries the works' names.
    On the scroll (both ways): each painting is unveiled, a cloth lifting off it from the bottom while the picture settles
    from a slow zoom, the columns drift at two speeds, and a gold line draws under "the wall.". On a desktop, the lit wall
    (wall.ts): a warm light follows the cursor and the shadows fall away from it, a painting leans toward the cursor with a
    glint across its varnish while a gold frame draws round it (lux.css), and the buttons lean toward the cursor. */
export default function Featured() {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = root.current!;
    const cards = gsap.utils.toArray<HTMLElement>(".pcard", el);
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const col = (c: HTMLElement) => [...new Set(cards.map((k) => k.offsetLeft))].sort((a, b) => a - b).indexOf(c.offsetLeft);
      const drift = (c: HTMLElement) => (col(c) % 2 ? 1 : 0.3) * (innerWidth >= 900 ? 70 : 32);
      cards.forEach((c) => {
        // left to right, each column a beat behind the one before
        gsap.fromTo(c, { "--fu": 1 }, { "--fu": 0, ease: "none", scrollTrigger: { trigger: c, start: () => `top ${96 - col(c) * 4}%`, end: () => `top ${60 - col(c) * 4}%`, scrub: 0.8, invalidateOnRefresh: true } });
        gsap.fromTo(c, { y: () => drift(c) }, { y: () => -drift(c), ease: "none", scrollTrigger: { trigger: c.parentElement, start: "top bottom", end: "bottom top", scrub: 0.6, invalidateOnRefresh: true } });
      });
      drawLine(el.querySelector(".c-swash path"));
    });

    mm.add("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
      const offs = [lightWall(el, cards), ...cards.map((c) => lean(c, c.querySelector<HTMLElement>(".pcard__media")!)), ...gsap.utils.toArray<HTMLElement>(".c-feat__cat, .c-feat__foot .btn", el).map(magnet)];
      return () => offs.forEach((off) => off());
    });
    return () => mm.revert();
  }, []);

  return (
    <section ref={root} className="section c-feat" data-mood="cream" aria-labelledby="c-feat-title">
      <FadeIn className="section__head" stagger={0.1} y={30}>
        <div>
          <p className="c-kicker">Featured artwork</p>
          <h2 id="c-feat-title" className="c-h2">New on <span className="c-loud"><em>the wall.</em><svg className="c-swash" viewBox="0 0 300 30" preserveAspectRatio="none" aria-hidden><path d="M4 20 C 52 8, 104 27, 160 15 S 252 5, 296 13" pathLength={1} /></svg></span></h2>
        </div>
        <nav className="c-feat__cats" aria-label="Shop by subject">
          {CATS.map((c) => <Link key={c} href={`/shop/?c=${c}#paintings`} className="c-feat__cat">{CAT_LABEL[c]}<span>{WORKS.filter((w) => w.c === c).length}</span></Link>)}
        </nav>
      </FadeIn>
      <div className="cards c-cards4 c-feat__grid">
        {NEWEST.map((w) => <ProductCard key={w.slug} w={w} vt={false} />)}
      </div>
      <div className="c-feat__foot">
        <Link href="/shop/#paintings" className="btn btn--ink"><span>Shop All Artwork</span><i>→</i></Link>
      </div>
    </section>
  );
}
