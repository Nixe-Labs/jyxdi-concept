import type { Metadata } from "next";
import Link from "next/link";
import { ViewTransition } from "react";
import "../styles/shop.css";
import ShopClient, { MangaAdd } from "@/components/shop/ShopClient";
import Frame from "@/components/lux/Frame";
import FadeIn from "@/components/home/FadeIn";
import Footer from "@/components/chrome/Footer";
import { WORKS, CAT_LABEL, bySlug, fromPrice, money, smallest, srcSet, type Work } from "@/lib/catalog";
import { BASE } from "@/lib/base";

/** The lowest price of a format across the collection, e.g. "Canvas|UV". */
const from = (format: string) => money(Math.min(...WORKS.flatMap((w) => Object.entries(w.v).filter(([k, x]) => x[2] && k.endsWith(`|${format}`)).map(([, x]) => x[1]))));
const PRINT = from("Poster|Classic"), CANVAS = from("Canvas|Classic"), UV = from("Canvas|UV");

/** Hung beside the words: a flat scan with a large photo, so it stays sharp in its frame and in its viewing room. */
const FEATURE = bySlug("arthanareeswarar") as Work;
const THADAM = bySlug("thadam") as Work;
const img = (name: string) => ({ src: `${BASE}/img/${name}-800.webp`, srcSet: `${BASE}/img/${name}-800.webp 800w, ${BASE}/img/${name}-1400.webp 1400w` });

/** One painting, three ways: the painting itself, the canvas on its easel, the canvas under blacklight. */
const WAYS = [
  { n: "i", name: "Art print", from: PRINT, src: smallest(THADAM), srcSet: undefined, cap: THADAM.t, alt: `${THADAM.t}, painting by Jyxdi`, line: "The poster edition, and the easiest way to begin a collection." },
  { n: "ii", name: "Canvas", from: CANVAS, ...img("loc-thadam-easel"), cap: "On canvas", alt: `${THADAM.t} on canvas, on an easel`, line: "The painting on canvas." },
  { n: "iii", name: "UV canvas", from: UV, ...img("loc-thadam-uv"), cap: "Under blacklight", alt: `${THADAM.t} on canvas, glowing under blacklight`, line: "Finished in fluorescent pigment. By day it looks like the original; under a blacklight, it lights up." },
];

export const metadata: Metadata = {
  title: "Shop",
  description: `Shop Jyxdi's paintings as art prints from $${PRINT}, canvases from $${CANVAS} and UV canvases from $${UV} that glow under blacklight, each with a hand-signed certificate of authenticity. Ships worldwide.`,
};

/* the page moves from daylight into night: cream (the collection) → burgundy (three ways to own one) → black (the manga) → the black footer */
export default function ShopPage() {
  return (
    <>
      <main className="sx">
        <ShopClient featured={FEATURE.slug}>
          <header className="sx-head">
            <div>
              <nav className="crumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden>/</span><span aria-current="page">Shop</span></nav>
              <p className="c-kicker">The collection · {WORKS.length} works</p>
              <h1 id="sx-title" className="sx-title"><span className="sx-line"><span>Bring one</span></span> <span className="sx-line"><em>home.</em></span></h1>
              <p className="lede sx-lede">Every painting comes as an art print from ${PRINT}, a canvas from ${CANVAS}, or a UV canvas from ${UV} that glows under blacklight.</p>
              <ul className="sx-promise"><li>Hand-signed certificate of authenticity</li><li>Surprise add-ons in every order</li><li>Ships worldwide</li></ul>
            </div>
            <figure className="sx-feature">
              <Link href={`/shop/${FEATURE.slug}/`} transitionTypes={["art-open"]} className="sx-piece" aria-label={`${FEATURE.t}: view the work`}>
                <svg className="lx-hanger" viewBox="0 0 100 60" preserveAspectRatio="none" aria-hidden><line x1="6" y1="60" x2="50" y2="0" /><line x1="94" y1="60" x2="50" y2="0" /></svg>
                <span className="lx-hook" aria-hidden />
                {/* from the opening's boutique, its framed print glides into this frame ("shop-print"); to its own page, this frame glides on ("art-…") */}
                <ViewTransition name="shop-print" share={{ "shop-open": "shop-morph", default: "none" }} default="none">
                  <span className="sx-piece__art">
                    <ViewTransition name={`art-${FEATURE.slug}`} share={{ "art-open": "art-morph", default: "none" }} default="none">
                      <Frame src={smallest(FEATURE)} srcSet={srcSet(FEATURE)} sizes="(max-width: 899px) 56vw, 24vw" alt="" loading="eager" style={{ ["--ar" as string]: FEATURE.ar }}>
                        <span className="lx-bar" aria-hidden />
                      </Frame>
                    </ViewTransition>
                  </span>
                </ViewTransition>
              </Link>
              <figcaption className="lx-plaque"><b>{FEATURE.t}</b>{CAT_LABEL[FEATURE.c]} · Art print from ${money(fromPrice(FEATURE))}</figcaption>
            </figure>
          </header>
        </ShopClient>

        <section className="section sx-ways" data-mood="burgundy" aria-labelledby="sx-ways-title">
          <FadeIn className="section__head" stagger={0.1} y={30}>
            <div>
              <p className="c-kicker">Three ways to own a Jyxdi</p>
              <h2 id="sx-ways-title" className="c-h2">One painting, <em>three ways.</em></h2>
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
                  <p className="sx-way__from">from ${w.from}</p>
                  <p className="sx-way__line">{w.line}</p>
                </div>
              </article>
            ))}
          </FadeIn>
          <div className="sx-ways__foot">
            <p>Every piece: hand-signed certificate · surprise add-ons · ships worldwide</p>
            <div>
              <Link href="/faq/#formats" className="c-link">Compare sizes &amp; prices →</Link>
              <Link href="/commissions/" className="c-link">Or commission a painting of your own →</Link>
            </div>
          </div>
        </section>

        <section className="section sx-manga" data-mood="black" aria-labelledby="sx-manga-title">
          <div className="sx-manga__in">
            <FadeIn className="sx-manga__media" y={50}>
              <img {...img("sg-cover")} sizes="(max-width: 699px) 92vw, 44vw" alt="Spirit Gates Vol. 1, glowing blue among paint bottles and white flowers" loading="lazy" decoding="async" />
            </FadeIn>
            <FadeIn stagger={0.1} y={30}>
              <p className="c-kicker">Also in the shop</p>
              <h2 id="sx-manga-title" className="c-h2">Spirit Gates, <em>Vol. 1</em></h2>
              <p className="lede">The first-ever manga by Jyxdi: an 11″ × 5″ print with a navy blue finish and a free bookmark. The first 100 copies are hand-signed.</p>
              <div className="sx-manga__buy"><MangaAdd /><Link href="/spirit-gates/" className="c-link">About the manga →</Link></div>
            </FadeIn>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
