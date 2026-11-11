import FadeIn from "./FadeIn";
import { WORKS, bySlug, money, smallest, type Work } from "@/lib/catalog";
import { BASE } from "@/lib/base";

// the lowest price in the catalogue for each format (null variants are unavailable)
const from = (format: string) => money(Math.min(...WORKS.flatMap((w) => Object.entries(w.v).filter(([k, x]) => x[2] && k.endsWith(`|${format}`)).map(([, x]) => x[1]))));
export const PRINT = from("Poster|Classic"), CANVAS = from("Canvas|Classic"), UV = from("Canvas|UV");
const THADAM = bySlug("thadam") as Work;
const img = (name: string) => ({ src: `${BASE}/img/${name}-800.webp`, srcSet: `${BASE}/img/${name}-800.webp 800w, ${BASE}/img/${name}-1400.webp 1400w` });

const WAYS = [
  { n: "i", name: "Art print", from: PRINT, src: smallest(THADAM), srcSet: undefined, cap: THADAM.t, alt: `${THADAM.t}, painting by Jyxdi`, line: "The poster edition, and the easiest way to begin a collection." },
  { n: "ii", name: "Canvas", from: CANVAS, ...img("loc-thadam-easel"), cap: "On canvas", alt: `${THADAM.t} on canvas, on an easel`, line: "The painting on canvas." },
  { n: "iii", name: "UV canvas", from: UV, ...img("loc-thadam-uv"), cap: "Under blacklight", alt: `${THADAM.t} on canvas, glowing under blacklight`, line: "Finished in fluorescent pigment. By day it looks like the original; under a blacklight, it lights up." },
];

/** One painting, three ways: the painting itself, the canvas on its easel, the canvas under blacklight.
    The shop shows each format's starting price; the homepage doesn't. The links at its foot are the children. */
export default function Ways({ title, prices = false, children }: { title: React.ReactNode; prices?: boolean; children: React.ReactNode }) {
  return (
    <section className="section sx-ways" data-mood="burgundy" aria-labelledby="sx-ways-title">
      <FadeIn className="section__head" stagger={0.1} y={30}>
        <div>
          <p className="c-kicker">Three ways to own a Jyxdi</p>
          <h2 id="sx-ways-title" className="c-h2">{title}</h2>
        </div>
        <p className="lede">Every work in the collection comes as an art print, a canvas or a UV canvas, in four sizes from 16×20″ up to 48×60″. Here is {THADAM.t} in each.</p>
      </FadeIn>
      <FadeIn className="sx-ways__grid" stagger={0.12} y={50}>
        {WAYS.map((w) => (
          <article key={w.n} className={`sx-way ${w.n === "iii" ? "sx-way--uv" : ""}`}>
            <figure className="sx-way__media">
              <img src={w.src} srcSet={w.srcSet} sizes="(max-width: 699px) 92vw, 30vw" alt={w.alt} loading="lazy" decoding="async" />
              <figcaption className="sx-way__cap">{w.cap}</figcaption>
            </figure>
            <div className="sx-way__body">
              <p className="sx-way__n" aria-hidden>{w.n}.</p>
              <h3>{w.name}</h3>
              {prices && <p className="sx-way__from">from ${w.from}</p>}
              <p className="sx-way__line">{w.line}</p>
            </div>
          </article>
        ))}
      </FadeIn>
      <div className="sx-ways__foot"><div>{children}</div></div>
    </section>
  );
}
