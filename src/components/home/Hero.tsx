"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import Print from "@/components/sketch/Tape";
import { Arrow, Circled, Icon, Underlined } from "@/components/sketch/Marks";
import { bySlug, largest, srcSet, type Work } from "@/lib/catalog";

const A = bySlug("arthanareeswarar")!, B = bySlug("the-dual-dharma")!, C = bySlug("universe-within")!;
const href = (w: Work) => `/shop/${w.slug}/`;

export default function Hero({ ready }: { ready: boolean }) {
  const root = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!ready) return;
    const ctx = gsap.context(() => {
      // construction lines, like the first pencil pass of a drawing
      gsap.to(".hero__sketch path, .hero__sketch circle, .hero__sketch line", { strokeDashoffset: 0, duration: 2.2, ease: "power2.inOut", stagger: 0.12 });
      gsap.from(".hero__title .line", { yPercent: 40, opacity: 0, duration: 1.1, ease: "expo.out", stagger: 0.09, delay: 0.15 });
      gsap.from(".hero__copy > :not(h1)", { y: 20, opacity: 0, duration: 0.9, ease: "power3.out", stagger: 0.07, delay: 0.45 });
      // prints dropped onto the table, one after another
      gsap.from(".collage .print", { y: -70, opacity: 0, rotate: (i) => [10, -14, 16][i], duration: 1.1, ease: "back.out(1.4)", stagger: 0.14, delay: 0.2 });
      gsap.from(".collage__note, .collage__tag", { opacity: 0, scale: 0.8, duration: 0.6, delay: 1.1, stagger: 0.15 });
      gsap.to(".collage", { yPercent: -8, ease: "none", scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true } });
    }, root);
    return () => ctx.revert();
  }, [ready]);

  return (
    <section className="hero" ref={root} style={{ visibility: ready ? "visible" : "hidden" }}>
      <svg className="hero__sketch" viewBox="0 0 1440 800" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <circle cx="1060" cy="380" r="330" pathLength={1} />
        <circle cx="1060" cy="380" r="250" pathLength={1} />
        <line x1="700" y1="60" x2="1420" y2="740" pathLength={1} />
        <line x1="1420" y1="60" x2="700" y2="740" pathLength={1} />
        <path d="M60 700 H 640" pathLength={1} />
        <path d="M60 120 V 720" pathLength={1} />
      </svg>

      <div className="hero__copy">
        <p className="note m-0 mb-3">the studio of Jyxdi —</p>
        <h1 className="hero__title">
          <span className="line">Myths,</span>
          <span className="line">painted</span>
          <span className="line"><em><Circled seed="loud" delay={1300} width={3.5}>loud.</Circled></em></span>
        </h1>
        <p className="lede">Original paintings by Jyxdi: gods in streetwear, cosmic portraits, goddesses in full colour, and canvases that glow in the dark. Prints from <b className="text-ink">$90</b>, canvases from <b className="text-ink">$450</b>.</p>
        <div className="hero__ctas">
          <Link href="/shop/" className="btn btn--ink" data-cursor="Shop"><span>Shop the collection</span><i>→</i></Link>
          <Link href="/artist/" className="link-hand"><Underlined seed="meet" delay={1600} width={2.5} passes={1}>meet the artist</Underlined> ↗</Link>
        </div>
        <ul className="trust">
          <li>{Icon.pen}Hand-signed</li>
          <li>{Icon.cert}Certificate of authenticity</li>
          <li>{Icon.gift}Surprise add-ons</li>
          <li>{Icon.plane}Ships worldwide</li>
        </ul>
      </div>

      <div className="collage">
        <Link href={href(A)} className="contents" data-cursor="View"><Print className="collage__a" src={largest(A)} srcSet={srcSet(A)} sizes="(max-width: 899px) 52vw, 26vw" alt={`${A.t}, painting by Jyxdi`} rotate={-2.5} tape={["tl", "tr"]} loading="eager" /></Link>
        <Link href={href(B)} className="contents" data-cursor="View"><Print className="collage__b" src={largest(B)} alt={`${B.t}, painting by Jyxdi`} rotate={-9} tape={["t"]} polaroid caption="The Dual Dharma" loading="eager" /></Link>
        <Link href={href(C)} className="contents" data-cursor="View"><Print className="collage__c" src={largest(C)} srcSet={srcSet(C)} sizes="(max-width: 899px) 34vw, 17vw" alt={`${C.t}, painting by Jyxdi`} rotate={7} tape={["tr"]} loading="eager" /></Link>
        <div className="collage__note arrow-note" style={{ left: "1%", top: "6%" }}>
          <span className="note -rotate-6 inline-block">Ganesha in<br />streetwear!</span>
          <Arrow style={{ width: 70, height: 48, marginTop: 30 }} delay={1500} />
        </div>
        <div className="collage__tag"><span className="stamp !text-[13px]">prints from $90</span></div>
      </div>
    </section>
  );
}
