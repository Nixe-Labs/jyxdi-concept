"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";

/** A trailing gold ring + exact dot. Elements with data-cursor="Label" grow the ring into a label. */
export default function Cursor() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    document.body.classList.add("has-cursor");
    const el = root.current!, ring = el.querySelector(".cursor__ring")!, dot = el.querySelector(".cursor__dot")!, label = el.querySelector(".cursor__label")!;
    const xTo = gsap.quickTo(ring, "x", { duration: 0.5, ease: "power3" }), yTo = gsap.quickTo(ring, "y", { duration: 0.5, ease: "power3" });
    const dx = gsap.quickSetter(dot, "x", "px"), dy = gsap.quickSetter(dot, "y", "px");
    const move = (e: PointerEvent) => { xTo(e.clientX); yTo(e.clientY); dx(e.clientX); dy(e.clientY); };
    const over = (e: PointerEvent) => {
      const t = (e.target as Element).closest?.("[data-cursor]") as HTMLElement | null;
      const uv = !!(e.target as Element).closest?.("[data-uv-stage]");
      const canvas = !!(e.target as Element).closest?.("[data-cursor-hide]");
      el.classList.toggle("is-uv", uv);
      el.classList.toggle("on-dark", !!(e.target as Element).closest?.("[data-dark], .cover"));
      el.classList.toggle("is-hidden", canvas && !t);
      el.classList.toggle("is-label", !!t && !uv);
      if (t && !uv) label.textContent = t.dataset.cursor ?? "";
    };
    addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerover", over);
    return () => { removeEventListener("pointermove", move); document.removeEventListener("pointerover", over); document.body.classList.remove("has-cursor"); };
  }, []);
  return (
    <div ref={root} className="cursor" aria-hidden>
      <div className="cursor__ring"><span className="cursor__label" /></div>
      <div className="cursor__dot" />
    </div>
  );
}
