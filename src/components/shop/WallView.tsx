"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import type { Size } from "@/lib/catalog";

/** The chosen size, drawn to scale (1.15px per inch) over an 84″ sofa beside a 5′6″ figure. */
export default function WallView({ size, uv, image }: { size: Size; uv: boolean; image: string }) {
  const art = useRef<SVGGElement>(null);
  const [iw, ih] = size.split("x").map(Number);
  const s = 1.15, pw = iw * s, ph = ih * s, x = 105 - pw / 2, y = 75.2 - 9 * s - ph;
  useEffect(() => {
    gsap.to(art.current!.querySelectorAll("rect, image"), { attr: { x, y, width: pw, height: ph }, duration: 0.7, ease: "expo.out" });
  }, [x, y, pw, ph]);
  return (
    <div className="wallview paper-card grid-paper" aria-hidden>
      <svg viewBox="0 -16 320 134">
        <line x1="0" y1="112" x2="320" y2="112" className="wv-floor" />
        <g className="wv-line" transform="translate(252,112) scale(.868) translate(-10,-112)">
          <circle cx="10" cy="30" r="5.4" />
          <path d="M10 36 C3 37 2 46 2.6 60 L4.6 74 L5.4 112 M10 36 C17 37 18 46 17.4 60 L15.4 74 L14.6 112 M5 74 L15 74" />
        </g>
        <path className="wv-line" d="M56.7 112 V80.2 Q56.7 75.2 61.7 75.2 H148.3 Q153.3 75.2 153.3 80.2 V112 M56.7 92.45 H153.3" />
        <g ref={art}>
          <image href={image} x={x} y={y} width={pw} height={ph} preserveAspectRatio="xMidYMid slice" opacity={uv ? 0.55 : 0.9} />
          <rect x={x} y={y} width={pw} height={ph} className="wv-art" fill={uv ? "rgba(122,77,255,.25)" : "none"} stroke={uv ? "#7a4dff" : "#1f1b18"} />
        </g>
      </svg>
      <p className="wallview__cap"><span className="hand">to scale, next to a 5′6″ person</span><span>{iw}×{ih}″ · {Math.round(iw * 2.54)}×{Math.round(ih * 2.54)} cm</span></p>
    </div>
  );
}
