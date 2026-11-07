"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import FadeIn from "@/components/home/FadeIn";
import { MANGA, checkoutUrl } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { BASE } from "@/lib/base";

gsap.registerPlugin(ScrollTrigger);

const src = (key: string, w: number) => `${BASE}/img/${key}-${w}.webp`;
const srcSet = (key: string) => `${src(key, 800)} 800w, ${src(key, 1400)} 1400w`;

/** Add to bag (opens the bag) and Buy it now (straight to jyxdi.com's checkout), as on the original page. */
export function Buy() {
  const add = useCart((s) => s.add);
  return (
    <div className="mg-buy">
      <button type="button" className="btn btn--ink btn--lg" disabled={!MANGA.available}
        onClick={() => add({ variantId: MANGA.variantId, slug: MANGA.slug, title: MANGA.t, image: `${BASE}/img/sg-cover-800.webp`, option: "Manga · Vol. 1", price: MANGA.price })}>
        <span>Add to bag</span><i>+</i>
      </button>
      <a className="btn btn--line btn--lg" href={checkoutUrl([{ variantId: MANGA.variantId, qty: 1 }])} target="_blank" rel="noopener">
        <span>Buy it now<span className="sr-only"> (opens checkout in a new tab)</span></span><i aria-hidden>↗</i>
      </a>
    </div>
  );
}

/** The volume in an arched window, glowing in the black room; it leans toward the pointer. */
export default function MangaHero() {
  const root = useRef<HTMLElement>(null), arch = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(min-width: 900px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
      const rx = gsap.quickTo(arch.current, "rotationX", { duration: 1.4, ease: "power3.out" });
      const ry = gsap.quickTo(arch.current, "rotationY", { duration: 1.4, ease: "power3.out" });
      const move = (e: PointerEvent) => { rx((0.5 - e.clientY / innerHeight) * 7); ry((e.clientX / innerWidth - 0.5) * 9); };
      const el = root.current!;
      el.addEventListener("pointermove", move);
      return () => el.removeEventListener("pointermove", move);
    });
    return () => mm.revert();
  }, []);
  return (
    <section ref={root} className="mg-hero" data-mood="black" aria-labelledby="mg-title">
      <div className="mg-hero__grid">
        <div className="mg-hero__copy">
          <p className="c-kicker">The manga · Written &amp; published by Jyxdi</p>
          <h1 id="mg-title" className="mg-hero__title"><span className="mg-line"><span>Spirit</span></span><span className="mg-line"><em>Gates</em></span></h1>
          <p className="mg-hero__vol">Volume one · The first 100 copies hand-signed</p>
          <p className="lede">The first-ever manga by Jyxdi: an epic journey into a realm where dormant powers are concealed, and destiny unfolds in the most unexpected ways.</p>
          <p className="mg-price">${MANGA.price} <small>CAD</small></p>
          <Buy />
          <ul className="mg-facts">
            <li>11″ × 5″ high-quality print with a navy blue finish</li>
            <li>Includes a free Spirit Gates bookmark</li>
            <li>First 100 copies hand-signed by Jyxdi</li>
          </ul>
        </div>
        <figure className="mg-hero__art">
          <span className="mg-hero__aura" aria-hidden />
          <span className="mg-arch" ref={arch}>
            <img src={src("sg-cover", 1400)} srcSet={srcSet("sg-cover")} sizes="(max-width: 899px) 72vw, 34vw" width={1400} height={1843} alt="Spirit Gates Vol. 1, its cover glowing blue among flowers and paint" fetchPriority="high" decoding="async" />
          </span>
          <figcaption className="mg-hero__cap">Spirit Gates · Vol. 1</figcaption>
        </figure>
      </div>
    </section>
  );
}

/** One page of the book: a photograph, or words. side: which side of the spine it sits on when the book lies open. */
function Page({ side, folio, photo, alt, half, className = "", children }:
  { side: "l" | "r"; folio?: string; photo?: string; alt?: string; half?: boolean; className?: string; children?: React.ReactNode }) {
  return (
    <div className={`mg-page mg-page--${side} ${photo ? "mg-page--photo" : "mg-page--text"} ${half ? "mg-half" : ""} ${className}`}>
      {photo ? <img src={src(photo, 1400)} srcSet={srcSet(photo)} sizes={half ? "(max-width: 899px) 92vw, 50vw" : "(max-width: 899px) 92vw, 34vw"} alt={alt ?? ""} width={1400} height={1750} loading="lazy" decoding="async" /> : children}
      {folio && <span className="mg-folio" aria-hidden>{folio}</span>}
      <span className="mg-shade" aria-hidden />
    </div>
  );
}

/** The story as a book. Desktop: it lies open and holds while three leaves turn on the spine as you scroll,
    the last one opening onto a photograph across both pages. Phones and reduced motion: the pages, in order. */
export function MangaBook() {
  const stage = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(min-width: 900px) and (prefers-reduced-motion: no-preference)", () => {
      const leaves = gsap.utils.toArray<HTMLElement>(".mg-leaf", stage.current);
      const tl = gsap.timeline({ scrollTrigger: { trigger: stage.current, start: "top top", end: `+=${leaves.length * 85}%`, pin: true, scrub: 0.8, invalidateOnRefresh: true } });
      leaves.forEach((leaf, i) => {
        const t = 0.15 + i * 1.2;
        const [front, back] = leaf.querySelectorAll(".mg-shade");
        tl.to(leaf, { rotateY: -180, duration: 1, ease: "power2.inOut" }, t)
          .set(leaf, { zIndex: 10 + i }, t + 0.5) // past the spine: it now lies on top of the left-hand pile
          .fromTo(front, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "power1.in" }, t)
          .fromTo(back, { opacity: 1 }, { opacity: 0, duration: 0.5, ease: "power1.out" }, t + 0.5);
      });
      tl.to({}, { duration: 0.35 }); // a beat on the last spread before the page moves on
    });
    return () => mm.revert();
  }, []);
  return (
    <section className="mg-story section" data-mood="cream" aria-labelledby="mg-story-title">
      <div className="mg-stage" ref={stage}>
        <FadeIn className="mg-stage__head" y={20}><p className="c-kicker">The story · Spirit Gates, Vol. 1</p></FadeIn>
        <div className="mg-book">
          <Page side="l" folio="i">
            <p className="c-kicker">The story</p>
            <h2 id="mg-story-title">A nation that forgot <em>its roots.</em></h2>
            <p className="mg-drop">Join Akiko, a young orphan unaware of her extraordinary potential, as she navigates a nation disconnected from its spiritual roots and mired in oblivion.</p>
          </Page>
          <div className="mg-leaf" style={{ zIndex: 3 }}>
            <Page side="r" folio="ii" photo="sg-fan" alt="Jyxdi with Spirit Gates character cards fanned out" />
            <Page side="l" folio="iii"><p className="mg-drop">The spirit world is not as it seems, ruled with an iron grip by the tyrannical Queen Alora, a master of dark magic. Akiko&apos;s destiny takes a dangerous turn as she sets out to find a fallen meteorite from the human world.</p></Page>
          </div>
          <div className="mg-leaf" style={{ zIndex: 2 }}>
            <Page side="r" folio="iv" photo="sg-hold" alt="Jyxdi holding up the manga" />
            <Page side="l" folio="v"><p className="mg-drop">The quest carries her into a parallel universe, where she meets her enigmatic counterpart, Akiko 2.0. Can she secure the elusive stone, a beacon of hope, and break free from Alora&apos;s control? Or will it lead to trouble galore?</p></Page>
          </div>
          <div className="mg-leaf" style={{ zIndex: 1 }}>
            <Page side="r" folio="vi">
              <p className="c-kicker">Meet the cast</p>
              <dl className="mg-cast">
                <div><dt>The hero</dt><dd><b>Akiko</b><span>A young orphan who has no idea how much power she holds.</span></dd></div>
                <div><dt>The ruler</dt><dd><b>Queen Alora</b><span>Tyrant of the spirit world and a master of dark magic.</span></dd></div>
                <div><dt>The mirror</dt><dd><b>Akiko 2.0</b><span>Akiko&apos;s enigmatic counterpart from a parallel universe.</span></dd></div>
              </dl>
              <small>No spoilers, promise.</small>
            </Page>
            <Page side="l" photo="sg-spread" alt="Jyxdi holding Spirit Gates open at an interior spread" half />
          </div>
          <Page side="r" photo="sg-spread" half />
          <Page side="l" photo="sg-spread" alt="Jyxdi holding Spirit Gates open at an interior spread" className="mg-spread" />
        </div>
        <p className="mg-stage__hint" aria-hidden>Scroll to turn the pages</p>
      </div>
    </section>
  );
}

/** The signing note: a gold seal for the first 100 copies, the details, and the way to buy. The seal turns as the page scrolls. */
export function Signing() {
  const seal = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(seal.current, { rotate: -40 }, { rotate: 60, ease: "none", scrollTrigger: { trigger: seal.current, start: "top bottom", end: "bottom top", scrub: true } });
    });
    return () => mm.revert();
  }, []);
  return (
    <section className="mg-sign section" data-mood="burgundy" aria-labelledby="mg-sign-title">
      <div className="mg-sign__grid">
        <FadeIn className="mg-seal" scale={0.9} y={30}>
          <svg ref={seal} viewBox="0 0 200 200" aria-hidden>
            <defs><path id="mg-ring" d="M 100 100 m -84 0 a 84 84 0 1 1 168 0 a 84 84 0 1 1 -168 0" /></defs>
            <circle cx="100" cy="100" r="97" />
            <circle cx="100" cy="100" r="72" />
            <text><textPath href="#mg-ring" textLength="525" lengthAdjust="spacing">HAND-SIGNED BY JYXDI ✦ THE FIRST 100 COPIES ✦ SPIRIT GATES · VOL. 1 ✦</textPath></text>
          </svg>
          <p className="mg-seal__n"><b>100</b><span>Copies, signed by hand</span></p>
        </FadeIn>
        <div className="mg-sign__copy">
          <FadeIn stagger={0.1} y={30}>
            <p className="c-kicker">The signing note</p>
            <h2 id="mg-sign-title" className="c-h2">The first 100, <em>signed by hand.</em></h2>
            <p className="lede">The first 100 copies of Spirit Gates, Vol. 1 are hand-signed by Jyxdi.</p>
          </FadeIn>
          <FadeIn as="dl" className="mg-spec" y={30} delay={0.1}>
            <dt>Print</dt><dd><span className="mg-num">11″ × 5″</span>, high-quality, with a navy blue finish</dd>
            <dt>With it</dt><dd>A free Spirit Gates bookmark</dd>
            <dt>Signed</dt><dd>The first 100 copies, by Jyxdi</dd>
            <dt>Price</dt><dd>${MANGA.price} CAD</dd>
          </FadeIn>
          <FadeIn y={30} delay={0.15}><Buy /></FadeIn>
          <p className="mg-sign__more"><Link href="/shop/" className="c-link">Or browse the paintings →</Link></p>
        </div>
      </div>
    </section>
  );
}
