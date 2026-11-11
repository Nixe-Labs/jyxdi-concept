import type { Metadata } from "next";
import Link from "next/link";
import { ViewTransition } from "react";
import "../styles/shop.css";
import ShopClient, { MangaAdd } from "@/components/shop/ShopClient";
import Frame from "@/components/lux/Frame";
import FadeIn from "@/components/home/FadeIn";
import Ways, { PRINT, CANVAS, UV } from "@/components/home/Ways";
import Footer from "@/components/chrome/Footer";
import { WORKS, CAT_LABEL, bySlug, fromPrice, money, smallest, srcSet, type Work } from "@/lib/catalog";
import { BASE } from "@/lib/base";

const img = (name: string) => ({ src: `${BASE}/img/${name}-800.webp`, srcSet: `${BASE}/img/${name}-800.webp 800w, ${BASE}/img/${name}-1400.webp 1400w` });
const FEATURE = bySlug("arthanareeswarar") as Work;
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

        <Ways prices title={<>One painting, <em>three ways.</em></>}>
          <Link href="/faq/#formats" className="c-link">Compare sizes &amp; prices →</Link>
          <Link href="/commissions/" className="c-link">Or commission a painting of your own →</Link>
        </Ways>

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
