"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | null = null;
export const getLenis = () => lenis;

/** Smooth-scroll to an element id (or the top), Lenis on desktop, native elsewhere. */
export function scrollToId(id: string | null, immediate = false) {
  const el = id ? document.getElementById(id) : null;
  if (id && !el) return;
  if (lenis) lenis.scrollTo(el ?? 0, { duration: immediate ? 0 : 1.6, immediate });
  else (el ? el.scrollIntoView({ behavior: immediate ? "auto" : "smooth" }) : scrollTo({ top: 0, behavior: immediate ? "auto" : "smooth" }));
}

export default function SmoothScroll() {
  const pathname = usePathname();
  useEffect(() => {
    const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;
    lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (t: number) => lenis?.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => { gsap.ticker.remove(tick); lenis?.destroy(); lenis = null; };
  }, []);
  // every new page starts at the top, and pinned/scrubbed layouts get re-measured
  useEffect(() => {
    if (!location.hash) lenis?.scrollTo(0, { immediate: true });
    const t = setTimeout(() => ScrollTrigger.refresh(), 300);
    return () => clearTimeout(t);
  }, [pathname]);
  return null;
}
