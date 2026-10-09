"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { Circled } from "@/components/sketch/Marks";
import { useSearchParams } from "next/navigation";
import CountUp from "@/components/rb/CountUp";
import ProductCard from "./ProductCard";
import Sanctum from "@/components/home/Sanctum";
import { WORKS, MANGA, CAT_LABEL, type Category, type Format } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { BASE } from "@/lib/base";

type Sort = "new" | "old" | "az" | "featured";
const TABS: ("all" | Category)[] = ["all", "Divine", "Goddess", "Cosmos"];

export default function ShopClient() {
  const [cat, setCat] = useState<(typeof TABS)[number]>("all");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<Sort>("new");
  const [format, setFormat] = useState<Format>("Poster");
  const [view, setView] = useState<"grid" | "dome">("grid");
  const [ready, setReady] = useState(false);
  const grid = useRef<HTMLDivElement>(null);
  const add = useCart((s) => s.add);
  const params = useSearchParams();
  useEffect(() => { setReady(true); const c = params.get("c"); if (c && (TABS as string[]).includes(c)) setCat(c as Category); }, [params]);

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const out = WORKS.filter((w) => (cat === "all" || w.c === cat) && (!needle || `${w.t} ${w.d} ${CAT_LABEL[w.c]}`.toLowerCase().includes(needle)));
    if (sort === "new") out.sort((a, b) => b.created.localeCompare(a.created));
    if (sort === "old") out.sort((a, b) => a.created.localeCompare(b.created));
    if (sort === "az") out.sort((a, b) => a.t.localeCompare(b.t));
    return out;
  }, [cat, q, sort]);

  // cards rise in whenever the result set changes
  useEffect(() => {
    if (view !== "grid" || !grid.current) return;
    const cards = grid.current.querySelectorAll(".pcard");
    const t = gsap.fromTo(cards, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "expo.out", stagger: 0.03, clearProps: "transform" });
    return () => { t.kill(); };
  }, [list, view, format]);

  const counts = useMemo(() => Object.fromEntries(TABS.map((t) => [t, t === "all" ? WORKS.length : WORKS.filter((w) => w.c === t).length])), []);

  return (
    <>
      <header className="page-head">
        <nav className="crumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span>Shop</span></nav>
        <div className="shop-head">
          <div>
            <p className="note m-0 mb-2">everything in the studio —</p>
            <h1 className="display">Bring one <Circled seed="home" delay={500}><em>home.</em></Circled></h1>
            <p className="lede">Every painting comes as a hand-signed poster or a canvas, in four sizes up to 48×60″. Canvases can be finished in UV-reactive pigment that glows under blacklight.</p>
          </div>
          <div className="shop-meta">
            <div><b><CountUp to={WORKS.length} duration={1.4} /></b><span>works</span></div>
            <div><b>$<CountUp to={90} duration={1.4} /></b><span>posters from</span></div>
            <div><b>$<CountUp to={450} duration={1.4} /></b><span>canvases from</span></div>
          </div>
        </div>
      </header>

      <div className="toolbar">
        <div className="toolbar__inner">
          <div className="tabs" role="tablist" aria-label="Category">
            {TABS.map((t) => (
              <button key={t} role="tab" aria-selected={cat === t} className="tab" onClick={() => setCat(t)}>
                {t === "all" ? "All" : CAT_LABEL[t]}<sup>{counts[t]}</sup>
              </button>
            ))}
          </div>
          <label className="search">
            <span aria-hidden>⌕</span>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="search Shiva, lotus, cosmos…" aria-label="Search works" type="search" />
          </label>
          <div className="seg" role="group" aria-label="Show prices for">
            {(["Poster", "Canvas"] as Format[]).map((f) => <button key={f} aria-pressed={format === f} onClick={() => setFormat(f)}>{f}</button>)}
          </div>
          <div className="select">
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Sort">
              <option value="new">Newest</option><option value="old">Oldest</option><option value="az">A – Z</option>
            </select>
          </div>
          <div className="seg" role="group" aria-label="View">
            <button aria-pressed={view === "grid"} onClick={() => setView("grid")}>Grid</button>
            <button aria-pressed={view === "dome"} onClick={() => setView("dome")}>3D</button>
          </div>
          <span className="toolbar__count" aria-live="polite">{list.length} work{list.length === 1 ? "" : "s"} ✎</span>
        </div>
      </div>

      {view === "grid" ? (
        <div className="shop-grid cards" ref={grid}>
          {list.length ? list.map((w, i) => <ProductCard key={w.slug} w={w} format={format} priority={i < 4} />) : <p className="shop-empty">nothing matches “{q}”, try another name?</p>}
        </div>
      ) : (
        <div className="py-6"><Sanctum compact /></div>
      )}

      <section className="manga-strip" aria-label="Spirit Gates manga">
        <div className="manga-strip__inner" data-dark>
          <div className="manga-strip__copy">
            <p className="note !text-[#ffd2c4] m-0">also in the shop —</p>
            <h3>Spirit <em className="italic">Gates</em>, Vol. 1</h3>
            <p>The first-ever manga by JYXDI. 11″ × 5″ print with a navy blue finish and a free bookmark. The first 100 copies are hand-signed.</p>
            <div className="flex flex-wrap gap-3">
              <button className="btn btn--red" disabled={!MANGA.available} onClick={() => add({ variantId: MANGA.variantId, slug: MANGA.slug, title: MANGA.t, image: `${BASE}/img/sg-cover-800.webp`, option: "Manga · Vol. 1", price: MANGA.price })}><span>Add to bag · ${MANGA.price}</span><i>+</i></button>
              <Link href="/spirit-gates/" className="btn border-[1.5px] border-[rgba(243,236,223,.6)] text-paper"><span>About the manga</span></Link>
            </div>
          </div>
          <div className="manga-strip__img"><img src={`${BASE}/img/sg-cover-800.webp`} alt="Spirit Gates Vol. 1 cover, glowing blue" loading="lazy" /></div>
        </div>
      </section>
    </>
  );
}
