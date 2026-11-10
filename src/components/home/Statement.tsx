"use client";
import Float from "./Float";
import FadeIn from "./FadeIn";
import { bySlug, smallest, type Work } from "@/lib/catalog";

const lean = (e: React.PointerEvent<HTMLElement>) => {
  if (e.pointerType !== "mouse" || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--px", ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
  e.currentTarget.style.setProperty("--py", ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
};

// slug, left %, anchored to the top or bottom ("low") edge, offset %, width px, drift speed, resting tilt, spin while passing
const FLOATS: [string, number, "top" | "low", number, number, number, number, number][] = [
  ["twin-flame", 6, "top", 4, 150, 0.18, -7, 10],
  ["lakshmi", 79, "top", 1, 132, 0.32, 8, -12],
  ["ganesh-x-shiva", 12, "low", 13, 118, 0.4, 6, -10],
  ["universe-within", 74, "low", 6, 156, 0.25, -5, 12],
];

export default function Statement() {
  return (
    <section className="c-statement" data-mood="cream" onPointerMove={lean}>
      {FLOATS.map(([slug, x, edge, y, w, speed, tilt, spin]) => (
        <Float key={slug} speed={speed} spin={spin} className={`c-float c-float--${edge}`} style={{ ["--x" as string]: `${x}%`, ["--y" as string]: `${y}%`, ["--w" as string]: w, ["--tilt" as string]: `${tilt}deg`, ["--depth" as string]: Math.round(speed * 70) }}>
          <img src={smallest(bySlug(slug) as Work)} alt="" loading="lazy" decoding="async" />
        </Float>
      ))}
      <FadeIn className="c-statement__copy" stagger={0.1} y={30}>
        <p className="c-kicker">Myths, gods &amp; goddesses</p>
        <h2 className="c-h2">Old stories, <em>painted anew.</em></h2>
        <p className="lede">Bold, saturated paintings of gods, goddesses and cosmic portraits, as art prints, canvases, and UV canvases that glow in the dark.</p>
      </FadeIn>
    </section>
  );
}
