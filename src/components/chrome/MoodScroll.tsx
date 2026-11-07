"use client";
import { useEffect, useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const setMood = (m?: string | null) => { if (m && document.documentElement.dataset.mood !== m) document.documentElement.dataset.mood = m; };
// the sections of the page on screen: Next keeps a page you left in the document, hidden, and its sections must not count
const shown = () => [...document.querySelectorAll<HTMLElement>("[data-mood]")].filter((s) => s.getClientRects().length);

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
    let triggers: ScrollTrigger[] = [];
    // wait a frame, so the page's own pinned sections (and their spacers) exist first
    const raf = requestAnimationFrame(() => {
      triggers = shown().map((s) => {
        const t = s.parentElement?.classList.contains("pin-spacer") ? s.parentElement : s;
        // the colour changes when a section reaches the upper third: a calmer cue than the middle, and long sections hold their colour
        return ScrollTrigger.create({ trigger: t, start: "top 35%", end: "bottom 35%", refreshPriority: -1, onToggle: (self) => { if (self.isActive) setMood(s.dataset.mood); } });
      });
      ScrollTrigger.refresh();
    });
    return () => { cancelAnimationFrame(raf); triggers.forEach((t) => t.kill()); };
  }, [pathname]);
  return null;
}
