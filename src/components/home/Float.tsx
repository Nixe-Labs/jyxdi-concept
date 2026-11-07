"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/** Decorative: drifts against the scroll and turns a little while its parent section passes,
    like the floating products in the reference reel. speed is a share of the viewport height (of 250px on phones). */
export default function Float({ speed = 0.3, spin = 0, className = "", style, children }:
  { speed?: number; spin?: number; className?: string; style?: React.CSSProperties; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current!;
    // phones: a short fixed drift, so the paintings stay in their bands around the words
    const d = () => (innerWidth < 900 ? 250 : innerHeight) * speed;
    const t = gsap.fromTo(el, { y: () => d(), rotate: -spin / 2 }, {
      y: () => -d(), rotate: spin / 2, ease: "none",
      scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true },
    });
    return () => { t.scrollTrigger?.kill(); t.kill(); gsap.set(el, { clearProps: "transform" }); };
  }, [speed, spin]);
  return <div ref={ref} className={className} style={style} aria-hidden>{children}</div>;
}
