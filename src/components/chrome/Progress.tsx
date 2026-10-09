"use client";
import { useEffect, useRef } from "react";
export default function Progress() {
  const bar = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const on = () => { const max = document.documentElement.scrollHeight - innerHeight; if (bar.current) bar.current.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`; };
    on(); addEventListener("scroll", on, { passive: true }); addEventListener("resize", on);
    return () => { removeEventListener("scroll", on); removeEventListener("resize", on); };
  }, []);
  return <div className="progress" aria-hidden><span ref={bar} /></div>;
}
