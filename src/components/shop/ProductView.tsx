"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import ProductCard from "./ProductCard";
import WallView from "./WallView";
import { UvStage, UvToggle } from "@/components/home/AfterDark";
import {
  type Work, type Size, type Format, type Finish, SIZES, FORMATS, FINISHES, CAT_LABEL, UV_PAIRS,
  WORKS, largest, srcSet, variant, isAvailable, money, checkoutUrl,
} from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { Icon, Underlined } from "@/components/sketch/Marks";

const FINISH_LABEL: Record<Finish, string> = { Classic: "Classic", UV: "UV glow ✦" };

export default function ProductView({ w }: { w: Work }) {
  const [size, setSize] = useState<Size>("16x20");
  const [format, setFormat] = useState<Format>("Poster");
  const [finish, setFinish] = useState<Finish>("Classic");
  const [qty, setQty] = useState(1);
  const [uvFull, setUvFull] = useState(false);
  const [buybar, setBuybar] = useState(false);
  const add = useCart((s) => s.add);
  const price = useRef<HTMLElement>(null);
  const priceObj = useRef({ v: 0 });
  const buyRef = useRef<HTMLDivElement>(null);
  const pair = UV_PAIRS[w.slug];

  // UV pigment only exists on canvas: fall back to Classic when it isn't sold
  useEffect(() => { if (!isAvailable(w, size, format, finish)) setFinish("Classic"); }, [w, size, format, finish]);
  const v = variant(w, size, format, isAvailable(w, size, format, finish) ? finish : "Classic");
  const option = `${size.replace("x", "×")} · ${format} · ${FINISH_LABEL[v === variant(w, size, format, "UV") ? "UV" : "Classic"]}`;

  useEffect(() => {
    gsap.to(priceObj.current, { v: v[1], duration: 0.7, ease: "power2.out", onUpdate: () => { if (price.current) price.current.textContent = money(Math.round(priceObj.current.v)); } });
  }, [v]);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setBuybar(!e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0 });
    io.observe(buyRef.current!); return () => io.disconnect();
  }, []);

  const related = useMemo(() => {
    const same = WORKS.filter((x) => x.c === w.c && x.slug !== w.slug);
    const i = WORKS.findIndex((x) => x.slug === w.slug);
    return [...same.slice(i % Math.max(1, same.length)), ...same].filter((x, k, a) => a.indexOf(x) === k).slice(0, 4);
  }, [w]);

  const addToCart = () => add({ variantId: v[0], slug: w.slug, title: w.t, image: largest(w), option, price: v[1] }, qty);

  // magnifier
  const onZoom = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect(), z = e.currentTarget.querySelector<HTMLElement>(".zoom")!;
    z.style.backgroundPosition = `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`;
  };

  return (
    <>
      <div className="pdp">
        <nav className="crumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/shop/">Shop</Link><span>/</span><Link href={`/shop/?c=${w.c}`}>{CAT_LABEL[w.c]}</Link></nav>

        <div className="pdp__media">
          <div className="pdp__board grid-paper">
            {pair ? (
              <UvStage full={uvFull} day={pair.day} uv={pair.uv} alt={w.t} className="w-full max-w-[520px]" />
            ) : (
              <div className="pdp__art" style={{ ["--ar" as string]: w.ar }} onPointerMove={onZoom} data-cursor="Zoom">
                <span className="tape tape--tl" aria-hidden /><span className="tape tape--tr" aria-hidden />
                <div className="frame">
                  <img src={largest(w)} srcSet={srcSet(w)} sizes="(max-width: 899px) 92vw, 50vw" alt={`${w.t}, painting by Jyxdi`} fetchPriority="high" />
                  <div className="zoom" style={{ backgroundImage: `url(${largest(w)})` }} />
                </div>
              </div>
            )}
          </div>
          <div className="pdp__bar">
            {pair ? <><span className="note">this one glows under blacklight ✦</span><UvToggle on={uvFull} onChange={setUvFull} light /></>
                  : <span className="note only-fine">hover to look closer ✎</span>}
          </div>
        </div>

        <div className="pdp__info">
          <p className="kicker"><b>{CAT_LABEL[w.c]}</b> · original by Jyxdi</p>
          <h1 className="pdp__title">{w.t}</h1>
          <p className="pdp__desc">Available as a hand-signed poster or a canvas in four sizes{pair ? ", or as a UV canvas that glows in the dark" : ", with an optional UV-reactive finish on canvas"}.</p>
          <p className="pdp__price"><span className="cur">$</span><b ref={price}>{money(v[1])}</b><small>CAD</small></p>

          <div className="config">
            <div>
              <p className="config__label">Size <span>inches</span></p>
              <div className="config__opts">
                {SIZES.map((s) => <button key={s} className="opt" aria-pressed={size === s} onClick={() => setSize(s)}>{s.replace("x", "×")}<small>{Math.round(+s.split("x")[0] * 2.54)}×{Math.round(+s.split("x")[1] * 2.54)} cm</small></button>)}
              </div>
            </div>
            <div>
              <p className="config__label">Format</p>
              <div className="config__opts">
                {FORMATS.map((f) => <button key={f} className="opt" aria-pressed={format === f} onClick={() => setFormat(f)}>{f}<small>from ${money(variant(w, size, f, "Classic")[1])}</small></button>)}
              </div>
            </div>
            <div>
              <p className="config__label">Finish <span>{format === "Poster" ? "UV glow is canvas-only" : "UV glows under blacklight"}</span></p>
              <div className="config__opts">
                {FINISHES.map((f) => {
                  const ok = isAvailable(w, size, format, f);
                  return <button key={f} className={`opt ${f === "UV" ? "opt--uv" : ""}`} aria-pressed={finish === f && ok} disabled={!ok} onClick={() => setFinish(f)}>{FINISH_LABEL[f]}{ok && <small>${money(variant(w, size, format, f)[1])}</small>}</button>;
                })}
              </div>
            </div>
          </div>

          <WallView size={size} uv={finish === "UV" && format === "Canvas"} image={largest(w)} />

          <div ref={buyRef}>
            <div className="buyrow">
              <div className="qty" aria-label="Quantity">
                <button onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease quantity">−</button>
                <span>{qty}</span>
                <button onClick={() => setQty(qty + 1)} aria-label="Increase quantity">+</button>
              </div>
              <button className="btn btn--ink btn--lg" onClick={addToCart}><span>Add to bag</span><span className="opacity-60">${money(v[1] * qty)}</span></button>
            </div>
            <a className="btn btn--line btn--block" href={checkoutUrl([{ variantId: v[0], qty }])} target="_blank" rel="noopener"><span>Buy it now</span><i>↗</i></a>
          </div>

          <div className="artist-note paper-card ruled">
            <p className="note">a note on this one —</p>
            <p>{w.d}</p>
          </div>

          <ul className="perks">
            <li>{Icon.pen}Hand-signed certificate of authenticity</li>
            <li>{Icon.gift}Surprise customised add-ons in every order</li>
            <li>{Icon.plane}Ships worldwide</li>
            <li>{Icon.lock}Secure checkout on Jyxdi&apos;s Shopify store</li>
          </ul>

          <div className="acc">
            <details open>
              <summary>Size guide</summary>
              <div>
                <table>
                  <thead><tr><th>Size</th><th>Centimetres</th><th>Poster</th><th>Canvas</th><th>UV canvas</th></tr></thead>
                  <tbody>{SIZES.map((s) => (
                    <tr key={s}><td>{s.replace("x", "×")}″</td><td>{Math.round(+s.split("x")[0] * 2.54)}×{Math.round(+s.split("x")[1] * 2.54)}</td>
                      <td>${money(variant(w, s, "Poster", "Classic")[1])}</td><td>${money(variant(w, s, "Canvas", "Classic")[1])}</td><td>${money(variant(w, s, "Canvas", "UV")[1])}</td></tr>
                  ))}</tbody>
                </table>
              </div>
            </details>
            <details>
              <summary>Poster, canvas or UV?</summary>
              <div><p className="mt-0"><b className="text-bone">Poster</b>: a print of the painting, the most accessible way to own a piece.</p><p><b className="text-bone">Canvas</b>: the painting on gallery canvas, ready to hang.</p><p className="mb-0"><b className="text-uv-hi">UV glow</b>: a canvas finished with fluorescent pigment. By day it looks like the original; under a blacklight its haloes, ornaments and fire light up.</p></div>
            </details>
            <details>
              <summary>Shipping &amp; checkout</summary>
              <div>Orders are fulfilled by Jyxdi and ship worldwide. You&apos;ll complete payment on Jyxdi&apos;s own Shopify checkout, where shipping and taxes are calculated. Shop Pay, Apple Pay, Google Pay, PayPal and major cards are accepted.</div>
            </details>
          </div>
        </div>
      </div>

      <section className="related" aria-label="More works">
        <p className="kicker"><b>Keep looking</b> · more {CAT_LABEL[w.c].toLowerCase()}</p>
        <h2 className="display display--md">You might also <Underlined seed={"love" + w.slug}><em>love.</em></Underlined></h2>
        <div className="cards mt-10">
          {related.map((r) => <ProductCard key={r.slug} w={r} />)}
        </div>
      </section>

      <div className={`buybar ${buybar ? "is-on" : ""}`} aria-hidden={!buybar}>
        <div className="buybar__price">${money(v[1] * qty)}<small>{option}</small></div>
        <button className="btn btn--ink" onClick={addToCart} tabIndex={buybar ? 0 : -1}><span>Add to bag</span></button>
      </div>
    </>
  );
}
