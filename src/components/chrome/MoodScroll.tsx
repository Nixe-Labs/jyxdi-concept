"use client";
import { useEffect, useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const setMood = (m?: string | null) => { if (m && document.documentElement.dataset.mood !== m) document.documentElement.dataset.mood = m; };
// the sections of the page on screen: Next keeps a page you left in the document, hidden, and its sections must not count.
// "body": html carries data-mood itself (setMood) and is not a section.
const shown = () => [...document.querySelectorAll<HTMLElement>("body [data-mood]")].filter((s) => s.getClientRects().length);

/** The page takes the mood (data-mood) of whichever section crosses the middle of the screen;
    lux.css fades every colour token into it, so the page flows from one palette colour to the next. */
export default function MoodScroll() {
  const pathname = usePathname();
  // a new page starts in the mood of its first section (before paint, so nothing flashes)
  useLayoutEffect(() => {
    const html = document.documentElement;
    html.classList.add("mood-instant");
    setMood(shown()[0]?.dataset.mood ?? "cream");
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => html.classList.remove("mood-instant")));
    return () => cancelAnimationFrame(raf);
  }, [pathname]);
  useEffect(() => {
    // only sections on or near the screen fade their colour (lux.css): a page-wide fade re-styled every element on every frame
    const near = new IntersectionObserver((es) => es.forEach((e) => e.target.toggleAttribute("data-on", e.isIntersecting)), { rootMargin: "50% 0px" });
    shown().forEach((s) => near.observe(s));
    // the colour changes when a section reaches the upper third (a calmer cue than the middle; long sections hold their colour).
    // The browser watches that line live: scroll triggers measured once went stale when a section grew (the inquiry's
    // next step), and the page turned black half-way down the form.
    const mood = new Map<Element, string | undefined>();
    const line = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) setMood(mood.get(e.target)); }), { rootMargin: "-35% 0px -64% 0px" });
    // wait a frame, so the page's own pinned sections (and their spacers) exist first
    const raf = requestAnimationFrame(() => {
      shown().forEach((s) => {
        const t = s.parentElement?.classList.contains("pin-spacer") ? s.parentElement : s;
        mood.set(t, s.dataset.mood);
        line.observe(t);
      });
      ScrollTrigger.refresh();
    });
    return () => { cancelAnimationFrame(raf); near.disconnect(); line.disconnect(); };
  }, [pathname]);
  return null;
}
