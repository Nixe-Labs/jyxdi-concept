"use client";
/* The JYXDI mark, rebuilt as vector line-art from the original logo:
   two paintbrushes crossing into an X, a pair of eyes, J Y · D I.
   Every stroke has pathLength=1 so it can be drawn on. The eyes are alive:
   pupils follow the pointer (or wander), and they blink now and then. */
import { forwardRef, useEffect, useId, useImperativeHandle, useRef } from "react";

const MIRROR = "matrix(-1 0 0 1 231 0)";
const BRUSH = {
  bristle: "M71.2,73.2 C72,67 69.5,61 64,57.5 C57,53 48,50 43,42 C45,58 52,72 61,75.8 C63.5,76.8 65.5,76.9 67.2,76.7 Z",
  flick: "M49.5,50.5 L55.8,56.8",
  ferrule: "M67.2,76.7 L71.2,73.2 L73,75 L69,78.5 Z",
  edgeA: "M69,78.5 C101.8,114.8 155.5,164.2 186.5,190.5",
  edgeB: "M73,75 C109.5,107 159.7,160 186.5,190.5",
  inner: "M71.6,77.2 C106,111.5 158,162.5 185.6,189.8",
  fill: "M69,78.5 C101.8,114.8 155.5,164.2 186.5,190.5 C159.7,160 109.5,107 73,75 Z",
};
const EYE = {
  clip: "M66,43 C71,36.8 87,35.8 94.5,44.5 C88,50 73,50.5 66,43 Z",
  liner: "M61.6,41.2 Q63.9,42.3 66,43 C71,36.8 87,35.8 94.5,44.5",
  lower: "M94.5,44.5 C88,50 74,50.6 69,46.4",
  cx: 80.5, cy: 43.6,
};
const LETTERS = [
  "M31.5,110.5 L31.5,120.5 C31.5,124.8 26.5,125.6 24.6,122.2",
  "M50.5,110.5 L56.5,117.6 L62.5,110.5 M56.5,117.6 L56.5,124.5",
  "M168.5,110.5 L168.5,124.2 L173.5,124.2 C180,124.2 182.6,120.5 182.6,117.35 C182.6,114.2 180,110.5 173.5,110.5 Z",
  "M200.5,110.5 L200.5,124.5",
];

/* ── shared pointer target for every pair of eyes on the page ── */
let target: { x: number; y: number } | null = null;
let listening = false;
function listen() {
  if (listening || typeof window === "undefined") return;
  listening = true;
  let idle: ReturnType<typeof setTimeout>;
  const set = (e: PointerEvent) => { target = { x: e.clientX, y: e.clientY }; };
  addEventListener("pointermove", set, { passive: true });
  addEventListener("pointerdown", set, { passive: true });
  addEventListener("touchend", () => { clearTimeout(idle); idle = setTimeout(() => (target = null), 2200); }, { passive: true });
  document.addEventListener("mouseleave", () => (target = null));
}

export function blinkLids(lids: Element[]) {
  lids.forEach((l) =>
    (l as SVGGElement).animate(
      [{ transform: "scaleY(1)" }, { transform: "scaleY(.08)", offset: 0.45 }, { transform: "scaleY(1)" }],
      { duration: 210, easing: "cubic-bezier(.6,0,.4,1)" }
    )
  );
}

export type JxLogoHandle = { svg: SVGSVGElement | null };
type Props = { parts?: "full" | "eyes"; className?: string; alive?: boolean; range?: number; sw?: number };

const JxLogo = forwardRef<JxLogoHandle, Props>(function JxLogo(
  { parts = "full", className = "", alive = true, range, sw = 0.95 },
  ref
) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const svgRef = useRef<SVGSVGElement>(null);
  useImperativeHandle(ref, () => ({ svg: svgRef.current }));
  const eyesOnly = parts === "eyes";
  const R = range ?? (eyesOnly ? 3.2 : 2.4);

  useEffect(() => {
    if (!alive) return;
    listen();
    const svg = svgRef.current!;
    const irises = [...svg.querySelectorAll<SVGGElement>(".lg-iris")];
    const lids = [...svg.querySelectorAll(".lg-eye__lid")];
    let x = 0, y = 0, raf = 0, blinkT = performance.now() + 1800 + Math.random() * 3000;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const r = svg.getBoundingClientRect();
      if (r.bottom < -50 || r.top > innerHeight + 50 || r.width === 0) return;
      let tx: number, ty: number;
      if (target) {
        const ex = r.left + r.width / 2, ey = r.top + r.height * (eyesOnly ? 0.5 : 0.08);
        const dx = target.x - ex, dy = target.y - ey, d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / 260);
        tx = (dx / d) * R * k; ty = (dy / d) * R * 0.55 * k;
      } else {
        const t = now / 1000;
        tx = Math.sin(t * 0.37) * R * 0.7 + Math.sin(t * 1.3) * 0.25;
        ty = Math.cos(t * 0.23) * R * 0.25;
      }
      x += (tx - x) * 0.12; y += (ty - y) * 0.12;
      irises.forEach((g) => g.setAttribute("transform", `translate(${(g.dataset.side === "r" ? -x : x).toFixed(2)} ${y.toFixed(2)})`));
      if (now > blinkT) {
        blinkLids(lids);
        blinkT = now + 2600 + Math.random() * 4200;
        if (Math.random() < 0.25) setTimeout(() => blinkLids(lids), 260);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [alive, eyesOnly, R]);

  const eye = (side: "l" | "r") => (
    <g className={`lg-eye lg-eye--${side}`} transform={side === "r" ? MIRROR : undefined}>
      <g className="lg-eye__lid" style={{ transformOrigin: `${EYE.cx}px ${EYE.cy + 0.6}px` }}>
        <g clipPath={`url(#eyeclip-${id})`}>
          <g className="lg-iris" data-side={side}>
            <circle className="lg-stroke lg-iris__ring" cx={EYE.cx} cy={EYE.cy} r={6.1} pathLength={1} />
            <circle className="lg-pupil" cx={EYE.cx} cy={EYE.cy} r={2.4} />
            <circle className="lg-glint" cx={EYE.cx + 1.2} cy={EYE.cy - 1.2} r={0.75} />
          </g>
        </g>
        <path className="lg-stroke lg-liner" d={EYE.liner} pathLength={1} />
        <path className="lg-stroke lg-lower" d={EYE.lower} pathLength={1} />
      </g>
    </g>
  );
  const brush = () => (
    <>
      <path className="lg-stroke lg-handle" d={BRUSH.edgeA} pathLength={1} />
      <path className="lg-stroke lg-handle" d={BRUSH.edgeB} pathLength={1} />
      <path className="lg-stroke lg-handle lg-inner" d={BRUSH.inner} pathLength={1} />
      <path className="lg-stroke lg-ferrule" d={BRUSH.ferrule} pathLength={1} />
      <path className="lg-stroke lg-bristle" d={BRUSH.bristle} pathLength={1} />
      <path className="lg-stroke lg-flick" d={BRUSH.flick} pathLength={1} />
    </>
  );

  return (
    <svg
      ref={svgRef}
      className={`jx-logo ${eyesOnly ? "jx-logo--eyes" : ""} ${className}`}
      viewBox={eyesOnly ? "56 30 119 26" : "18 30 195 168"}
      fill="none" strokeLinecap="round" strokeLinejoin="round"
      role="img" aria-label="Jyxdi"
      style={{ ["--sw" as string]: sw }}
    >
      <defs>
        <clipPath id={`eyeclip-${id}`}><path d={EYE.clip} /></clipPath>
        {!eyesOnly && (
          <>
            <mask id={`occ-${id}`} maskUnits="userSpaceOnUse" x="0" y="0" width="240" height="212">
              <rect width="240" height="212" fill="#fff" />
              <path d={BRUSH.fill} transform={MIRROR} fill="#000" stroke="#000" strokeWidth={2.4} />
            </mask>
            <radialGradient id={`bloom-${id}`} cx="50%" cy="50%" r="50%">
              <stop offset="0" stopColor="#f6d99a" stopOpacity=".22" />
              <stop offset="1" stopColor="#f6d99a" stopOpacity="0" />
            </radialGradient>
          </>
        )}
      </defs>
      {!eyesOnly && (
        <>
          <circle className="lg-bloom" cx="115.5" cy="112" r="95" fill={`url(#bloom-${id})`} />
          <g className="lg-brush lg-brush--l" mask={`url(#occ-${id})`}>{brush()}</g>
          <g className="lg-brush lg-brush--r" transform={MIRROR}>{brush()}</g>
        </>
      )}
      {eye("l")}
      {eye("r")}
      {!eyesOnly && (
        <>
          <g className="lg-letters">{LETTERS.map((d, i) => <path key={i} className="lg-stroke lg-letter" d={d} pathLength={1} />)}</g>
          <circle className="lg-third" cx="115.5" cy="40.5" r="1.6" />
        </>
      )}
    </svg>
  );
});

export default JxLogo;
