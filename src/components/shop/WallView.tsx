"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import type { Size } from "@/lib/catalog";

/* drawn in inches (1 unit = 1″): the floor at 110, an 84″ sofa with a 32″ back centred on x 88, a 5′6″ figure at x 186 */
const FLOOR = 110, BACK = FLOOR - 32, CX = 88, GAP = 9, RIM = 1.4;
const box = (size: Size) => { const [iw, ih] = size.split("x").map(Number); return { iw, ih, x: CX - iw / 2, y: BACK - GAP - ih, width: iw, height: ih }; };

/** The chosen size hung on a quiet wall, to scale: 9″ above an 84″ sofa, beside a 5′6″ figure. Fine ink lines; the print is the only colour. */
export default function WallView({ size, uv, image }: { size: Size; uv: boolean; image: string }) {
  const art = useRef<SVGGElement>(null);
  const first = useRef(box(size)).current; // React renders the first size only; gsap owns the attributes after that
  const { iw, ih, x, y, width, height } = box(size);
  useEffect(() => {
    const g = art.current!, d = matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 0.9;
    gsap.to(g.querySelector("image"), { attr: { x, y, width, height }, duration: d, ease: "expo.out" });
    gsap.to(g.querySelector("rect"), { attr: { x: x - RIM, y: y - RIM, width: width + 2 * RIM, height: height + 2 * RIM }, duration: d, ease: "expo.out" });
  }, [x, y, width, height]);
  return (
    <figure className="px-wall">
      <svg viewBox="26 2 190 116" aria-hidden>
        <path className="px-wall__floor" d="M26 110 H216" />
        {/* sofa: arms, seat, back cushions, legs */}
        <path className="px-wall__ink" d="M46 104 V88.5 Q46 85 49.5 85 H52.5 Q56 85 56 88.5 V93 H120 V88.5 Q120 85 123.5 85 H126.5 Q130 85 130 88.5 V104 Z M56 93 V81 Q56 78 59 78 H117 Q120 78 120 81 V93 M78 78.6 V92.4 M98 78.6 V92.4 M56 97.5 H120 M50 104 L49 110 M126 104 L127 110" />
        {/* a standing figure, 66″ tall */}
        <g className="px-wall__ink" transform="translate(186 110)">
          <circle cx="0" cy="-61.4" r="4.4" />
          <path d="M-1.5 -57 V-55.2 M1.5 -57 V-55.2 M-1.5 -55.2 C-6.4 -54.8 -8.3 -53.2 -8.5 -48.8 L-9.6 -31 M1.5 -55.2 C6.4 -54.8 8.3 -53.2 8.5 -48.8 L9.6 -31 M-6.3 -48.6 L-5.7 -36 C-7.6 -25 -8.7 -14 -9 -3 H9 C8.7 -14 7.6 -25 5.7 -36 L6.3 -48.6 M-2.6 -3 V0 M2.6 -3 V0" />
        </g>
        <g ref={art} className={`px-wall__art ${uv ? "is-uv" : ""}`}>
          <image href={image} x={first.x} y={first.y} width={first.width} height={first.height} preserveAspectRatio="xMidYMid slice" />
          <rect x={first.x - RIM} y={first.y - RIM} width={first.width + 2 * RIM} height={first.height + 2 * RIM} />
        </g>
      </svg>
      <figcaption><span>To scale, above an 84″ sofa and beside a 5′6″ figure</span><b>{iw} × {ih}″ · {Math.round(iw * 2.54)} × {Math.round(ih * 2.54)} cm</b></figcaption>
    </figure>
  );
}
