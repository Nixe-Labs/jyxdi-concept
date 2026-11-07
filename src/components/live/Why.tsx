"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import FadeIn from "@/components/home/FadeIn";
import { BASE } from "@/lib/base";

gsap.registerPlugin(ScrollTrigger);

/* The photo of the Thadam canvas on its easel, on stage (1400×1750). The canvas leans back on the easel, so a skew
   squares it up: CROP frames the canvas alone, STAGE pulls back to the canvas on its easel (both 0.645 wide). */
const SKEW = -5.25;
const CROP = [176, 184, 832, 1290];
const STAGE = [75, 0, 1129, 1750];

// brush sweeps in painting order, as canvas fractions [u0, v0, uc, vc, u1, v1]: back and forth from the bottom up,
// the sky, and her face last
const SWEEPS = [
  [-0.15, 0.93, 0.5, 0.88, 1.15, 0.95], [1.15, 0.79, 0.5, 0.74, -0.15, 0.81], [-0.15, 0.65, 0.5, 0.6, 1.15, 0.67],
  [1.15, 0.51, 0.5, 0.46, -0.15, 0.53], [-0.15, 0.37, 0.5, 0.32, 1.15, 0.39], [1.15, 0.08, 0.5, 0.03, -0.15, 0.1],
  [-0.15, 0.23, 0.5, 0.18, 1.15, 0.25],
];
type Pt = [number, number];
const norm = ([x, y]: Pt): Pt => { const l = Math.hypot(x, y) || 1; return [x / l, y / l]; };
const W = CROP[2] * 0.29; // brush width, in photo pixels
// each sweep is a flat brush of seven bristles side by side (their slightly uneven spacing and the noise fray the edges)
const BRUSHES = SWEEPS.map(([u0, v0, uc, vc, u1, v1], i) => {
  const at = (u: number, v: number): Pt => [CROP[0] + u * CROP[2], CROP[1] + v * CROP[3]];
  const p0 = at(u0, v0), c = at(uc, vc), p1 = at(u1, v1);
  // normals at the two ends, and their mean at the control point (offsetting all three offsets the curve)
  const n0 = norm([p0[1] - c[1], c[0] - p0[0]]), n1 = norm([c[1] - p1[1], p1[0] - c[0]]);
  const nc = norm([n0[0] + n1[0], n0[1] + n1[1]]);
  return [-3, -2, -1, 0, 1, 2, 3].map((k) => {
    const o = (k + (((i * 7 + k * 5 + 21) % 9) / 8 - 0.5) * 0.5) * (W / 7); // a little deterministic jitter
    const pt = (p: Pt, n: Pt) => `${(p[0] + n[0] * o).toFixed(1)} ${(p[1] + n[1] * o).toFixed(1)}`;
    const edge = Math.abs(k);
    return { d: `M${pt(p0, n0)} Q${pt(c, nc)} ${pt(p1, n1)}`, w: ((edge === 3 ? 1.1 : 1.7) * W / 7).toFixed(1), a: edge === 3 ? 0.85 : 1 };
  });
});

const REASONS: [string, string][] = [
  ["Painted live", "She paints at your celebration while it unfolds, and the easel becomes a place your guests gather."],
  ["Across cultures", "An international wedding live painter, she has painted Hindu and West Indian weddings and outdoor ceremonies, each in full colour."],
  ["Yours to keep", "When the last stroke is down, the original painting of your day is yours, made in the room with everyone you love."],
];

/** Why couples book her, told by a canvas: as you scroll, brush strokes paint the bare canvas in, the reasons arrive
    one by one, and the camera pulls back to the finished canvas on its easel on stage. Desktop holds the scene;
    phones paint it while it crosses the screen; reduced motion (and no script) shows the finished painting. */
export default function Why() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current!;
    const $ = (s: string) => el.querySelectorAll<Element>(s);
    const mm = gsap.matchMedia();
    mm.add({ wide: "(min-width: 900px)", motion: "(prefers-reduced-motion: no-preference)" }, ({ conditions }) => {
      if (!conditions!.motion) return;
      const wide = conditions!.wide;
      const tl = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: wide
        ? { trigger: el, start: "top top", end: "+=170%", pin: true, scrub: 0.6 }
        : { trigger: $(".lp-canvas__board")[0], start: "top 85%", end: "top 9%", scrub: 0.6 } });
      // phones see the canvas rise from the bottom of the screen, so there it is painted top down, where the eye is
      const brushes = [...$(".lp-brush")];
      (wide ? brushes : brushes.reverse()).forEach((g, i) => tl.fromTo(g.children, { strokeDashoffset: 1.02 }, { strokeDashoffset: 0, duration: 0.11, ease: "power1.inOut", stagger: { each: 0.005, from: "random" } }, 0.03 + i * 0.085));
      tl.fromTo($(".lp-paint__fill"), { opacity: 0 }, { opacity: 1, duration: 0.05 }, 0.66) // the last touches: no gaps left
        .fromTo($(".lp-canvas__art"), { attr: { viewBox: CROP.join(" ") } }, { attr: { viewBox: STAGE.join(" ") }, duration: 0.23, ease: "power2.inOut" }, 0.72)
        .fromTo($(".lp-canvas__photo"), { attr: { transform: `skewX(${SKEW})` } }, { attr: { transform: "skewX(0)" }, duration: 0.23, ease: "power2.inOut" }, 0.72)
        .fromTo($(".lp-canvas__board"), { borderRadius: 3 }, { borderRadius: 14, duration: 0.23 }, 0.72) // a canvas becomes a photo of the stage
        .from($(".lp-canvas figcaption"), { opacity: 0, y: 12, duration: 0.06 }, 0.88)
        .to({}, { duration: 0.06 }, 0.94); // hold the finished scene a moment before the page moves on
      const reasons = $(".lp-why__list li");
      if (wide) tl.from(reasons, { opacity: 0, y: 26, duration: 0.07, stagger: 0.28, ease: "power2.out" }, 0.06);
      else gsap.from(reasons, { opacity: 0, y: 30, duration: 1.3, ease: "expo.out", stagger: 0.12, scrollTrigger: { trigger: $(".lp-why__list")[0], start: "top 88%" } });
    });
    return () => mm.revert();
  }, []);
  return (
    <section ref={ref} className="lp-why" data-mood="cream" aria-labelledby="lp-why-title">
      <FadeIn className="lp-why__head" stagger={0.1} y={30}>
        <p className="c-kicker">Why couples book her</p>
        <h2 id="lp-why-title" className="c-h2">Stroke by stroke,<br /> <em>as it happens.</em></h2>
      </FadeIn>
      <figure className="lp-canvas">
        <div className="lp-canvas__board">
          <svg className="lp-canvas__art" viewBox={CROP.join(" ")} preserveAspectRatio="xMidYMid slice" role="img" aria-label="The Thadam canvas by Jyxdi: a woman in a half-sari, seated tall in a neon city, on its easel on stage">
            <defs>
              {/* paint, not geometry: noise frays the strokes' edges into bristle streaks */}
              <filter id="lp-fray" x="-10%" y="-10%" width="120%" height="120%">
                <feTurbulence type="fractalNoise" baseFrequency="0.012 0.08" numOctaves="2" seed="5" />
                <feDisplacementMap in="SourceGraphic" scale="56" xChannelSelector="R" yChannelSelector="G" />
              </filter>
              <mask id="lp-paint" className="lp-canvas__mask" maskUnits="userSpaceOnUse" x="-400" y="-400" width="2400" height="2600">
                <g filter="url(#lp-fray)">{BRUSHES.map((b, i) => <g key={i} className="lp-brush">{b.map((p, j) => <path key={j} d={p.d} strokeWidth={p.w} opacity={p.a} pathLength={1} />)}</g>)}</g>
                <rect className="lp-paint__fill" x="-400" y="-400" width="2400" height="2600" />
              </mask>
            </defs>
            <g mask="url(#lp-paint)">
              <image className="lp-canvas__photo" href={`${BASE}/img/loc-thadam-easel-1400.webp`} width="1400" height="1750" transform={`skewX(${SKEW})`} />
            </g>
          </svg>
        </div>
        <figcaption>The Thadam canvas, painted live on stage</figcaption>
      </figure>
      <ol className="lp-why__list">
        {REASONS.map(([title, text], i) => (
          <li key={title}>
            <span className="lp-why__n" aria-hidden>{["i.", "ii.", "iii."][i]}</span>
            <h3>{title}</h3>
            <p>{text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
