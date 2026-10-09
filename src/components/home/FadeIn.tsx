"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";

/** Scroll-triggered entrance for any block. */
export default function FadeIn({ children, className = "", y = 40, scale = 1, delay = 0, stagger = 0, as: Tag = "div", ...rest }:
  { children: React.ReactNode; className?: string; y?: number; scale?: number; delay?: number; stagger?: number; as?: React.ElementType } & React.HTMLAttributes<HTMLElement>) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current!;
    const targets = stagger ? el.children : el;
    const t = gsap.from(targets, { y, scale, opacity: 0, duration: 1.3, ease: "expo.out", delay, stagger, scrollTrigger: { trigger: el, start: "top 88%" } });
    return () => { t.scrollTrigger?.kill(); t.kill(); gsap.set(targets, { clearProps: "all" }); };
  }, [y, scale, delay, stagger]);
  return <Tag ref={ref} className={className} {...rest}>{children}</Tag>;
}
