"use client";
import { useEffect, useRef } from "react";

/** The FAQ index: marks the group nearest the top of the screen (works in every browser). */
export default function FaqIndex({ groups }: { groups: { id: string; title: string }[] }) {
  const nav = useRef<HTMLElement>(null);
  useEffect(() => {
    const links = [...nav.current!.querySelectorAll<HTMLAnchorElement>("a")];
    const mark = (id: string) => links.forEach((a) => {
      const on = a.hash === `#${id}`;
      a.classList.toggle("is-current", on);
      if (on) a.setAttribute("aria-current", "location"); else a.removeAttribute("aria-current");
    });
    const io = new IntersectionObserver((entries) => {
      const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (hit) mark(hit.target.id);
    }, { rootMargin: "-20% 0px -65% 0px" });
    groups.forEach((g) => { const el = document.getElementById(g.id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, [groups]);
  return (
    <nav ref={nav} className="fq-nav" aria-label="FAQ sections">
      {groups.map((g, i) => <a key={g.id} href={`#${g.id}`}><span aria-hidden>{String(i + 1).padStart(2, "0")}</span>{g.title}</a>)}
    </nav>
  );
}
