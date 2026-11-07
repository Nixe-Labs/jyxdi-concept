"use client";
import Link from "next/link";
import { ViewTransition, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import ProductCard from "./ProductCard";
import WallView from "./WallView";
import Frame from "@/components/lux/Frame";
import FadeIn from "@/components/home/FadeIn";
import { UvStage, UvToggle } from "@/components/home/AfterDark";
import { scrollToId } from "@/components/chrome/SmoothScroll";
import {
  type Work, type Size, type Format, type Finish, SIZES, CAT_LABEL, UV_PAIRS, SCENES,
  WORKS, largest, smallest, srcSet, variant, isAvailable, money, checkoutUrl,
} from "@/lib/catalog";
import { useCart } from "@/lib/cart";

const FINISH_LABEL: Record<Finish, string> = { Classic: "Classic", UV: "UV glow ✦" }; // cart option text
const FORMAT_LABEL: Record<Format, string> = { Poster: "Art print", Canvas: "Canvas" };
/** How big each size hangs in the viewing room, relative to 48×60″. The size lines carry the real numbers. */
const SCALE: Record<Size, number> = { "16x20": 0.72, "24x30": 0.82, "30x40": 0.91, "48x60": 1 };
const dims = (s: Size) => s.split("x").map(Number) as [number, number];
const cm = (inches: number) => Math.round(inches * 2.54);
const inches = (s: Size) => { const [a, b] = dims(s); return `${a} × ${b}″`; };
const metric = (s: Size) => { const [a, b] = dims(s); return `${cm(a)} × ${cm(b)} cm`; };
const still = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Gold line icons for what arrives with every piece. */
const ICON = {
  cert: <svg viewBox="0 0 48 48" aria-hidden><rect x="8" y="5" width="26" height="35" rx="1.5" /><path d="M13.5 13h15M13.5 19h15M13.5 25h9" /><circle className="px-ico-fill" cx="33.5" cy="33.5" r="6.5" /><path d="M30.2 39.2 28.6 45.5l4.9-2.6 4.9 2.6-1.6-6.3" /></svg>,
  gift: <svg viewBox="0 0 48 48" aria-hidden><rect x="7" y="17" width="34" height="8" rx="1" /><path d="M10 25v17h28V25M24 17v25" /><path d="M24 17c-2.5-5.5-10-8.5-10-3.6 0 3.1 6.2 3.6 10 3.6Zm0 0c2.5-5.5 10-8.5 10-3.6 0 3.1-6.2 3.6-10 3.6Z" /></svg>,
  globe: <svg viewBox="0 0 48 48" aria-hidden><circle cx="24" cy="24" r="17" /><ellipse cx="24" cy="24" rx="7.5" ry="17" /><path d="M7 24h34M9.6 15h28.8M9.6 33h28.8" /></svg>,
};
const PERKS: [keyof typeof ICON, string, string][] = [
  ["cert", "Hand-signed certificate of authenticity", "Each piece comes with a certificate of authenticity, signed by hand."],
  ["gift", "A surprise in every order", "Every order includes surprise add-ons. What they are stays a surprise."],
  ["globe", "Ships worldwide", "Art prints, canvases and UV canvases ship worldwide."],
];

type Opt<T> = { v: T; a: string; b?: string };
/** A segmented choice: native radios (arrow keys move between them) under a sliding gold-edged thumb. */
function Seg<T extends string>({ name, legend, hint, value, opts, onPick, className = "" }:
  { name: string; legend: string; hint?: string; value: T; opts: Opt<T>[]; onPick: (v: T) => void; className?: string }) {
  return (
    <fieldset className={`px-seg ${className}`} style={{ ["--n" as string]: opts.length, ["--i" as string]: Math.max(0, opts.findIndex((o) => o.v === value)) }}>
      <legend className="px-label">{legend}{hint && <span>{hint}</span>}</legend>
      <div className="px-seg__row">
        {opts.map((o) => (
          <label key={o.v} className="px-seg__opt">
            <input type="radio" name={name} value={o.v} checked={o.v === value} onChange={() => onPick(o.v)} />
            <b>{o.a}</b>{o.b && <small>{o.b}</small>}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default function ProductView({ w }: { w: Work }) {
  const pair = UV_PAIRS[w.slug];
  const [size, setSize] = useState<Size>("16x20");
  const [format, setFormat] = useState<Format>("Poster");
  const [finish, setFinish] = useState<Finish>("Classic");
  const [qty, setQty] = useState(1);
  const [moved, setMoved] = useState(false);
  const [blacklight, setBlacklight] = useState(false);
  const [buybar, setBuybar] = useState(false);
  const [intro, setIntro] = useState(true);
  const [seen, setSeen] = useState(false); // the buy area has been on screen (phones: its gold waits for it)
  const add = useCart((s) => s.add);
  const buyRef = useRef<HTMLDivElement>(null);

  // UV pigment only exists on canvas: fall back to Classic when it isn't sold
  useEffect(() => { if (!isAvailable(w, size, format, finish)) setFinish("Classic"); }, [w, size, format, finish]);
  const fin: Finish = isAvailable(w, size, format, finish) ? finish : "Classic";
  const v = variant(w, size, format, fin);
  const ok = !!v?.[2];
  const uvOk = isAvailable(w, size, "Canvas", "UV");
  const option = `${size.replace("x", "×")} · ${format} · ${FINISH_LABEL[fin]}`;
  const chosen = `${FORMAT_LABEL[format]}${fin === "UV" ? " · UV glow" : ""} · ${inches(size)}`;
  const price = (f: Format, x: Finish) => `$${money(variant(w, size, f, x)[1])}`;

  // arriving through a view transition (the glide from the wall or a card, or any page change) is the entrance;
  // only a direct load plays the room's own: the light comes up, the frame settles, the panel follows
  useLayoutEffect(() => { try { if (document.documentElement.matches(":active-view-transition")) setIntro(false); } catch {} }, []);

  // choosing the UV finish switches the blacklight on (the toggles still work on their own)
  useEffect(() => { setBlacklight(fin === "UV"); }, [fin]);

  // the price rolls to its new value; React only ever renders the first one
  const priceEl = useRef<HTMLElement>(null);
  const shown = useRef(v[1]);
  const firstPrice = useRef(money(v[1])).current;
  useEffect(() => {
    const o = { n: shown.current }, set = () => { shown.current = o.n; if (priceEl.current) priceEl.current.textContent = money(Math.round(o.n)); };
    if (still()) { o.n = v[1]; set(); return; }
    if (o.n === v[1]) return;
    const t = gsap.to(o, { n: v[1], duration: 0.8, ease: "power3.out", onUpdate: set });
    if (priceEl.current?.parentElement) priceEl.current.parentElement.style.animationName = "none"; // the arrival glint gives way for good: one clean pass
    const glint = priceEl.current?.parentElement?.animate([{ backgroundPosition: "100% 0" }, { backgroundPosition: "0% 0" }], { duration: 1300, easing: "cubic-bezier(.45, 0, .25, 1)" });
    return () => { t.kill(); glint?.cancel(); };
  }, [v]);

  // phones: once the buy buttons scroll away, a floating bar keeps the bag in reach
  useEffect(() => {
    const t0 = performance.now(); // seen, but never before the panel's own entrance has finished (a reload can land there)
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) setTimeout(() => setSeen(true), Math.max(0, 2200 - (performance.now() - t0))); setBuybar(!e.isIntersecting && e.boundingClientRect.top < 0); }, { threshold: 0 });
    io.observe(buyRef.current!); return () => io.disconnect();
  }, []);

  const related = useMemo(() => {
    const same = WORKS.filter((x) => x.c === w.c && x.slug !== w.slug);
    const i = WORKS.findIndex((x) => x.slug === w.slug);
    return [...same.slice(i % Math.max(1, same.length)), ...same, ...WORKS.filter((x) => x.slug !== w.slug)].filter((x, k, a) => a.indexOf(x) === k).slice(0, 4);
  }, [w]);

  const addToCart = () => add({ variantId: v[0], slug: w.slug, title: w.t, image: smallest(w), option, price: v[1] }, qty);
  const pickSize = (s: Size) => { setSize(s); setMoved(true); };
  // UV is canvas-only: choosing it from the art print moves to canvas
  const pickUv = () => { setFormat("Canvas"); setFinish("UV"); };
  const pickFinish = (x: Finish) => (x === "UV" ? pickUv() : setFinish("Classic"));
  const chooseUv = () => { pickUv(); scrollToId("px-room"); };

  const sold = (f: Format, x: Finish) => SIZES.some((s) => isAvailable(w, s, f, x));
  const sizes = SIZES.filter((s) => isAvailable(w, s, "Poster", "Classic") || isAvailable(w, s, "Canvas", "Classic"));
  const sizeOpts = SIZES.map((s) => ({ v: s, a: inches(s).replace(" × ", "×"), b: metric(s).replace(" × ", "×") }));
  const finishOpts: Opt<Finish>[] = [{ v: "Classic", a: "Classic", b: price(format, "Classic") }, ...(uvOk ? [{ v: "UV" as Finish, a: "UV glow ✦", b: `${format === "Poster" ? "canvas · " : ""}${price("Canvas", "UV")}` }] : [])];
  const cell = (s: Size, f: Format, x: Finish) => {
    const p = variant(w, s, f, x), on = s === size && f === format && x === fin;
    return <td className={on ? "is-sel" : ""}>{p?.[2] ? `$${money(p[1])}` : "—"}</td>;
  };

  return (
    <>
      {/* ── 1 · the viewing room ── */}
      <section id="px-room" className={`px-room is-shine ${seen ? "is-seen" : ""} ${intro ? "is-intro" : ""} ${pair && blacklight ? "is-dark" : ""}`} data-mood="black" aria-labelledby="px-title">
        <Room w={w} size={size} mat={format === "Poster"} uv={fin === "UV"} uvOk={uvOk} moved={moved} blacklight={blacklight} setBlacklight={setBlacklight} />

        <div className="px-panel">
          <nav className="crumbs px-crumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden>/</span><Link href="/shop/">Shop</Link><span aria-hidden>/</span><Link href={`/shop/?c=${w.c}`}>{CAT_LABEL[w.c]}</Link></nav>
          <p className="c-kicker"><span className="px-gleam">{CAT_LABEL[w.c]} · Original by Jyxdi</span></p>
          <h1 id="px-title" className={`px-title ${w.t.length > 16 ? "px-title--long" : ""}`}>{w.t}</h1>
          <p className="px-lede">{w.d}</p>

          <div className="px-price">
            <p className="px-price__n"><span className="px-price__num" aria-hidden><span className="px-price__cur">$</span><b ref={priceEl}>{firstPrice}</b></span><span className="sr-only">${money(v[1])}</span><span className="px-price__ccy">CAD</span></p>
            <div className="px-qty" role="group" aria-label="Quantity">
              <button type="button" onClick={() => setQty(Math.max(1, qty - 1))} disabled={qty <= 1} aria-label="Decrease quantity">−</button>
              <output aria-live="polite" aria-label={`Quantity ${qty}`}>{qty}</output>
              <button type="button" onClick={() => setQty(qty + 1)} aria-label="Increase quantity">+</button>
            </div>
            <p className="px-price__line" aria-live="polite">{chosen} · Hand-signed certificate</p>
          </div>

          <div className="px-config">
            <Seg name="px-size" legend="Size" hint="inches · cm" value={size} opts={sizeOpts} onPick={pickSize} className="px-seg--size" />
            <Seg name="px-format" legend="Format" value={format} onPick={setFormat}
              opts={[{ v: "Poster", a: "Art print", b: `poster · ${price("Poster", "Classic")}` }, { v: "Canvas", a: "Canvas", b: price("Canvas", "Classic") }]} />
            <Seg name="px-finish" legend="Finish" hint={uvOk ? "UV: canvas only" : undefined} value={fin} opts={finishOpts} onPick={pickFinish} />
          </div>

          <div ref={buyRef} className="px-buy">
            <button type="button" className="btn btn--ink btn--lg px-add" onClick={addToCart} disabled={!ok}><span>{ok ? "Add to bag" : "Unavailable"}</span><span>${money(v[1] * qty)}</span></button>
            {ok && <a className="btn btn--line btn--block px-now" href={checkoutUrl([{ variantId: v[0], qty }])} target="_blank" rel="noopener"><span>Buy now</span><i aria-hidden>↗</i><span className="sr-only">(opens checkout on jyxdi.com in a new tab)</span></a>}
          </div>

          <ul className="px-assure">{PERKS.map(([k, t]) => <li key={k}>{ICON[k]}{t}</li>)}</ul>
        </div>
      </section>

      {/* ── 2 · catalogue notes ── */}
      <section className="px-notes" data-mood="cream" aria-labelledby="px-notes-title">
        <div className="px-notes__top">
          <FadeIn className="px-notes__about" stagger={0.1} y={30}>
            <p className="c-kicker">Catalogue notes</p>
            <h2 id="px-notes-title" className="c-h2">About the <em>work.</em></h2>
            <p className="px-notes__lede">{w.d}</p>
          </FadeIn>
          <FadeIn as="dl" className="px-dl" y={30} delay={0.15}>
            <div><dt>Artist</dt><dd>Jyxdi (Jyothee Murali)</dd></div>
            <div><dt>Title</dt><dd><i>{w.t}</i></dd></div>
            <div><dt>Category</dt><dd>{CAT_LABEL[w.c]}</dd></div>
            <div><dt>Formats</dt><dd>{[sold("Poster", "Classic") && "Art print (poster)", sold("Canvas", "Classic") && "Canvas", sold("Canvas", "UV") && "UV canvas"].filter(Boolean).join(" · ")}</dd></div>
            <div><dt>Sizes</dt><dd className="px-dl__sizes">{sizes.map((s) => <span key={s} className="px-dl__size">{inches(s)} <small>{metric(s)}</small></span>)}</dd></div>
            <div><dt>Finishes</dt><dd>Classic{sold("Canvas", "UV") && " · UV glow, on canvas"}</dd></div>
            <div><dt>Certificate</dt><dd>Hand-signed certificate of authenticity</dd></div>
            <div><dt>Shipping</dt><dd>Worldwide</dd></div>
          </FadeIn>
        </div>

        <div className="px-notes__bottom">
          <FadeIn className="px-guide" y={30}>
            <h3 className="px-h3">Size &amp; price guide</h3>
            <div className="px-scroll">
              <table>
                <caption className="sr-only">Prices in Canadian dollars for each size and format</caption>
                <thead><tr><th scope="col">Size</th><th scope="col">Art print</th><th scope="col">Canvas</th><th scope="col">UV canvas</th></tr></thead>
                <tbody>{SIZES.map((s) => (
                  <tr key={s} className={s === size ? "is-on" : ""}>
                    <th scope="row"><b>{inches(s)}</b><small>{metric(s)}</small></th>
                    {cell(s, "Poster", "Classic")}{cell(s, "Canvas", "Classic")}{cell(s, "Canvas", "UV")}
                  </tr>
                ))}</tbody>
              </table>
            </div>
            <p className="px-guide__note">Prices in Canadian dollars · checkout on jyxdi.com</p>
          </FadeIn>
          <FadeIn className="px-wallbox" y={30} delay={0.12}>
            <div className="px-wallbox__head">
              <h3 className="px-h3">See it on your <em>wall</em></h3>
              <Seg name="px-wall-size" legend="Size on the wall" value={size} opts={SIZES.map((s) => ({ v: s, a: inches(s).replace(" × ", "×") }))} onPick={pickSize} className="px-seg--mini" />
            </div>
            <WallView size={size} uv={fin === "UV"} image={smallest(w)} />
          </FadeIn>
        </div>
      </section>

      {/* ── 3 · what arrives ── */}
      <section className="px-arrive" data-mood="cream" aria-labelledby="px-arrive-title">
        <FadeIn className="px-arrive__head" stagger={0.1} y={30}>
          <p className="c-kicker">What arrives</p>
          <h2 id="px-arrive-title" className="c-h2">With every <em>piece.</em></h2>
        </FadeIn>
        <FadeIn as="ul" className="px-arrive__list" stagger={0.14} y={36}>
          {PERKS.map(([k, t, d]) => <li key={k}>{ICON[k]}<h3>{t}</h3><p>{d}</p></li>)}
        </FadeIn>
        <FadeIn as="p" className="px-arrive__line" y={30} blur={6}>The same signed certificate and the same surprise, from a $90 print to the largest canvas.</FadeIn>
      </section>

      {/* ── 4 · under blacklight (works with a daylight/blacklight photo pair) ── */}
      {pair && (
        <section className="px-uvwrap" data-mood="cream" aria-labelledby="px-uv-title">
        <div className="px-uvroom mood-black">
          <FadeIn className="px-uvroom__stage" y={40}>
            <UvStage full={blacklight} day={pair.day} uv={pair.uv} alt={w.t} />
          </FadeIn>
          <FadeIn className="px-uvroom__copy" stagger={0.1} y={30}>
            <p className="c-kicker">UV canvas · after dark</p>
            <h2 id="px-uv-title" className="c-h2">Switch off <em>the lights.</em></h2>
            <p className="lede">Choose the UV finish on canvas and it&apos;s painted with fluorescent pigment. By day it looks like the original. Under a blacklight, it lights up.</p>
            <div><UvToggle on={blacklight} onChange={setBlacklight} /></div>
            <p className="px-uvroom__hint"><span className="only-fine">Move over the painting to light it.</span><span className="only-touch">Drag a finger across the painting to light it.</span></p>
            {uvOk && <div><button type="button" className="btn btn--ink" onClick={chooseUv}><span>Choose the UV canvas · {price("Canvas", "UV")}</span><i aria-hidden>↑</i></button></div>}
          </FadeIn>
        </div>
        </section>
      )}

      {/* ── 5 · more from the collection ── */}
      <section className="px-more" data-mood="cream" aria-labelledby="px-more-title">
        <div className="section__head px-more__head">
          <div>
            <p className="c-kicker">More from the collection</p>
            <h2 id="px-more-title" className="c-h2">Stay a little <em>longer.</em></h2>
          </div>
          <Link href={`/shop/?c=${w.c}`} className="c-link">All {CAT_LABEL[w.c].toLowerCase()} <span aria-hidden>→</span></Link>
        </div>
        <FadeIn className="wrap cards c-cards4" stagger={0.08} y={30}>
          {related.map((r) => <ProductCard key={r.slug} w={r} rotate={0} />)}
        </FadeIn>
      </section>

      <div className={`px-buybar ${buybar ? "is-on" : ""}`} inert={!buybar}>
        <p className="px-buybar__price">${money(v[1] * qty)}<small>{FORMAT_LABEL[format]}{fin === "UV" ? " · UV glow" : ""} · {inches(size)}</small></p>
        <button type="button" className="btn btn--ink" onClick={addToCart} disabled={!ok}><span>Add to bag</span></button>
      </div>
    </>
  );
}

/** The work hung in the dark room under its own light: size lines for the chosen size, notes beside it, and a loupe
    that follows the pointer (scroll over the work to zoom; at either end the page scrolls on). Works with a
    daylight/blacklight photo pair carry the UV torch inside the frame instead of the loupe. */
function Room({ w, size, mat, uv, uvOk, moved, blacklight, setBlacklight }:
  { w: Work; size: Size; mat: boolean; uv: boolean; uvOk: boolean; moved: boolean; blacklight: boolean; setBlacklight: (v: boolean) => void }) {
  const pair = UV_PAIRS[w.slug];
  const scene = SCENES.has(w.slug);
  const stage = useRef<HTMLDivElement>(null), img = useRef<HTMLImageElement>(null), loupe = useRef<HTMLDivElement>(null);
  const zoom = useRef(2.5), at = useRef<[number, number, boolean] | null>(null), natural = useRef(0);
  const [iw, ih] = dims(size);

  // the loupe reads the largest photo; a small photo gets a lower zoom ceiling so it stays sharp
  useEffect(() => {
    if (pair) return;
    const big = new Image();
    big.onload = () => { natural.current = big.naturalWidth; };
    big.src = largest(w);
  }, [w, pair]);
  const ceiling = (shown: number) => Math.max(1.5, Math.min(5, (natural.current || 600) * 1.6 / shown));

  const hide = () => stage.current?.classList.remove("is-zooming");
  const place = (x: number, y: number, touch: boolean) => {
    const r = img.current!.getBoundingClientRect(), s = stage.current!.getBoundingClientRect(), L = loupe.current!;
    const fx = (x - r.left) / r.width, fy = (y - r.top) / r.height;
    if (fx < 0 || fx > 1 || fy < 0 || fy > 1) return hide();
    at.current = [x, y, touch];
    const k = Math.min(zoom.current, ceiling(r.width)), half = L.offsetWidth / 2;
    L.style.left = `${x - s.left}px`;
    L.style.top = `${y - s.top - (touch ? half + 34 : 0)}px`; // a fingertip would cover it: lift it above
    L.style.backgroundSize = `${r.width * k}px ${r.height * k}px`;
    L.style.backgroundPosition = `${half - fx * r.width * k}px ${half - fy * r.height * k}px`;
    L.firstElementChild!.textContent = `${k.toFixed(1)}×`;
    stage.current!.classList.add("is-zooming");
  };
  const look = (e: React.PointerEvent) => place(e.clientX, e.clientY, e.pointerType !== "mouse");

  useEffect(() => {
    const el = img.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!at.current || !stage.current!.classList.contains("is-zooming")) return;
      const cap = ceiling(el.getBoundingClientRect().width), cur = Math.min(zoom.current, cap);
      const next = Math.min(cap, Math.max(1.5, cur * Math.exp(-e.deltaY * (e.deltaMode ? 0.06 : 0.0022))));
      if (Math.abs(next - cur) < 0.005) return; // at the end of the range: let the page scroll on
      e.preventDefault();
      e.stopPropagation(); // Lenis listens on window: keep it from scrolling the page as well
      zoom.current = next;
      place(...at.current);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="px-stage" ref={stage}>
      <div className={`px-piece is-landed ${mat ? "" : "is-bare"} ${moved ? "is-moved" : ""} ${scene ? "is-scene" : ""}`} style={{ ["--k" as string]: scene ? 1 : SCALE[size], ["--ar" as string]: w.ar }}>
        <span className="px-light" aria-hidden />
        <span className="px-pool" aria-hidden />
        <ViewTransition name={`art-${w.slug}`} share={{ "art-open": "art-morph", default: "none" }} default="none">
          {pair ? (
            <span className="lux-frame">
              <span className="lux-frame__mat"><UvStage full={blacklight} day={pair.day} uv={pair.uv} alt={w.t} /></span>
              <span className="lx-bar" aria-hidden />
            </span>
          ) : (
            <Frame imgRef={img} src={largest(w)} srcSet={srcSet(w)} sizes="(max-width: 899px) 72vw, 36vw" alt={`${w.t}, painting by Jyxdi`} loading="eager" onDragStart={(e) => e.preventDefault()}
              onPointerDown={look} onPointerMove={look} onPointerUp={(e) => { if (e.pointerType !== "mouse") hide(); }} onPointerCancel={hide} onPointerLeave={hide}>
              <span className="lx-bar" aria-hidden />
            </Frame>
          )}
        </ViewTransition>
        <span key={`v${size}`} className="lx-dim lx-dim--v" aria-hidden><span>{ih}″ · {cm(ih)} cm</span></span>
        <span key={`h${size}`} className="lx-dim lx-dim--h" aria-hidden><span>{iw}″ · {cm(iw)} cm</span></span>
        <ul className="lx-callouts px-callouts" aria-hidden>
          <li style={{ top: "12%" }}><span>Hand-signed certificate<small>of authenticity</small></span></li>
          {uvOk && <li style={{ top: "46%" }}><span>Glows under blacklight<small>{uv ? "UV glow finish" : "as a UV canvas"}</small></span></li>}
          <li style={{ top: "80%" }}><span>Shown at {iw} × {ih}″<small>{cm(iw)} × {cm(ih)} cm</small></span></li>
        </ul>
      </div>
      {!pair && <div className="lx-loupe" ref={loupe} aria-hidden style={{ backgroundImage: `url(${largest(w)})` }}><span>2.5×</span></div>}
      <div className="px-stage__foot">
        {pair ? (
          <>
            <UvToggle on={blacklight} onChange={setBlacklight} />
            <span><span className="only-fine">Move over the painting to light it</span><span className="only-touch">Drag across the painting to light it</span></span>
          </>
        ) : (
          <span><span className="only-fine">Move over the work to look closer · scroll to zoom</span><span className="only-touch">Slide a finger across the work to look closer</span></span>
        )}
        <span>{scene ? "Photographed with the original painting" : "Frame shown for display"}</span>
      </div>
    </div>
  );
}
