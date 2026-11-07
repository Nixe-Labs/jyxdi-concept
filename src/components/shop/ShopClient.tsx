"use client";
import Link from "next/link";
import { Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import gsap from "gsap";
import ProductCard from "./ProductCard";
import { WORKS, MANGA, CAT_LABEL, type Category } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { getLenis } from "@/components/chrome/SmoothScroll";
import { BASE } from "@/lib/base";

type Sort = "new" | "old" | "az";
type Tab = "all" | Category;
const TABS: Tab[] = ["all", "Divine", "Goddess", "Cosmos"];
const SORTS: Sort[] = ["new", "old", "az"];
const COUNT = Object.fromEntries(TABS.map((t) => [t, t === "all" ? WORKS.length : WORKS.filter((w) => w.c === t).length])) as Record<Tab, number>;
const label = (t: Tab) => (t === "all" ? "All" : CAT_LABEL[t]);

/** The selection lives in the URL (?c= category, ?q= search, ?sort=), so a link, a reload or Back lands on the same works.
    Only this part reads the URL, so the rest of the collection is prerendered into the static HTML. */
function FromUrl({ onUrl }: { onUrl: (p: URLSearchParams, first: boolean) => void }) {
  const params = useSearchParams();
  const first = useRef(true);
  // before paint: coming Back, the list is already the one the visitor left, so the scroll lands on it
  useLayoutEffect(() => { onUrl(new URLSearchParams(params.toString()), first.current); first.current = false; }, [params, onUrl]);
  return null;
}
const setUrl = (k: string, v: string, def: string) => {
  const p = new URLSearchParams(location.search);
  if (v === def) p.delete(k); else p.set(k, v);
  const s = p.toString();
  history.replaceState(null, "", `${location.pathname}${s ? `?${s}` : ""}`); // no new history entry
};

/** The collection in daylight: the page head (children), the glass toolbar and every work.
    featured: the work hung in the head, which carries its view-transition name there, so its card here must not. */
export default function ShopClient({ featured, children }: { featured: string; children: React.ReactNode }) {
  const [cat, setCat] = useState<Tab>("all");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<Sort>("new");
  const bar = useRef<HTMLDivElement>(null);
  const results = useRef<HTMLDivElement>(null);
  const quiet = useRef(false); // the selection came back from the URL on arrival: no scroll, no rising cards

  const onUrl = useCallback((p: URLSearchParams, first: boolean) => {
    // Next applies our own replaceState later, in a transition: follow only the URL the browser shows now
    if (p.toString() !== new URLSearchParams(location.search).toString()) return;
    const c = p.get("c") as Tab, s = p.get("sort") as Sort;
    const next = { cat: TABS.includes(c) ? c : "all", q: p.get("q") ?? "", sort: SORTS.includes(s) ? s : "new" };
    if (first && (next.cat !== "all" || next.q || next.sort !== "new")) quiet.current = true;
    setCat(next.cat); setQ(next.q); setSort(next.sort);
  }, []);
  const pickCat = (t: Tab) => { setCat(t); setUrl("c", t, "all"); };
  const pickQ = (v: string) => { setQ(v); setUrl("q", v, ""); };
  const pickSort = (v: Sort) => { setSort(v); setUrl("sort", v, "new"); };

  const list = useMemo(() => {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean); // every word must appear: "kali shiva" finds "Kali x Shiva"
    const out = WORKS.filter((w) => (cat === "all" || w.c === cat) && words.every((n) => `${w.t} ${w.d} ${CAT_LABEL[w.c]}`.toLowerCase().includes(n)));
    if (sort === "new") out.sort((a, b) => b.created.localeCompare(a.created));
    if (sort === "old") out.sort((a, b) => a.created.localeCompare(b.created));
    if (sort === "az") out.sort((a, b) => a.t.localeCompare(b.t));
    return out;
  }, [cat, q, sort]);

  // a new selection starts from its first work (if the visitor was deep in the old one, the toolbar comes back to sit
  // just above the works), and the cards rise in. Not on arrival: the page itself rises in.
  const key = list.map((w) => w.slug).join();
  const shown = useRef(key);
  useEffect(() => {
    if (shown.current === key) return;
    shown.current = key;
    if (quiet.current) { quiet.current = false; return; }
    const el = results.current!;
    const y = el.getBoundingClientRect().top + scrollY - bar.current!.offsetHeight - parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-h"));
    if (scrollY > y + 1) { const l = getLenis(); if (l) l.scrollTo(y, { immediate: true }); else scrollTo(0, y); }
    const cards = el.querySelectorAll(".pcard");
    if (!cards.length || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = gsap.fromTo(cards, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "expo.out", stagger: 0.03, clearProps: "transform,opacity" });
    return () => { t.kill(); };
  }, [key]);

  // Leaving the page, only the work you clicked keeps its view-transition name (shop.css drops the rest). Every work here is
  // named, so otherwise each one also shown on the next page (the homepage, a product's related works) would fly there too.
  const section = useRef<HTMLElement>(null);
  useEffect(() => {
    const sec = section.current!;
    const leave = (e: Event) => {
      const a = e instanceof MouseEvent ? (e.target as Element).closest?.("a[href]") : null;
      if (e instanceof MouseEvent && (!a || a.getAttribute("target") || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)) return;
      sec.querySelectorAll(".is-chosen").forEach((c) => c.classList.remove("is-chosen"));
      a?.closest(".sx-coll .pcard, .sx-piece")?.classList.add("is-chosen");
      sec.classList.add("is-leaving");
    };
    document.addEventListener("click", leave, true);
    addEventListener("popstate", leave);
    return () => { document.removeEventListener("click", leave, true); removeEventListener("popstate", leave); };
  }, []);

  return (
    <section ref={section} className="sx-coll" data-mood="cream" aria-labelledby="sx-title">
      <Suspense fallback={null}><FromUrl onUrl={onUrl} /></Suspense>
      {children}

      <div className="toolbar sx-bar" ref={bar}>
        <div className="sx-bar__in">
          <div className="sx-tabs" role="group" aria-label="Category">
            {TABS.map((t) => (
              <button key={t} type="button" className="sx-tab" aria-pressed={cat === t} aria-label={`${label(t)}, ${COUNT[t]} works`} onClick={() => pickCat(t)}>
                {label(t)}<span className="sx-tab__n" aria-hidden>{COUNT[t]}</span>
              </button>
            ))}
          </div>
          <div className="sx-search">
            <svg viewBox="0 0 20 20" aria-hidden><circle cx="8.5" cy="8.5" r="5.75" /><path d="m13 13 4.5 4.5" /></svg>
            <input type="search" value={q} onChange={(e) => pickQ(e.target.value)} placeholder={`Search ${WORKS.length} works`} aria-label="Search works by name, story or category" />
            {q && <button type="button" className="sx-search__x" onClick={() => pickQ("")} aria-label="Clear search">×</button>}
          </div>
          <label className="sx-sort">
            <span aria-hidden>Sort</span>
            <select value={sort} onChange={(e) => pickSort(e.target.value as Sort)} aria-label="Sort works">
              <option value="new">Newest</option><option value="old">Oldest</option><option value="az">A – Z</option>
            </select>
          </label>
          <p className="sx-count" aria-live="polite">{list.length} {list.length === 1 ? "work" : "works"}</p>
        </div>
      </div>

      {list.length ? (
        <div className="sx-grid" ref={results}>
          {list.map((w, i) => <ProductCard key={w.slug} w={w} priority={i < 3} vt={w.slug !== featured} />)}
        </div>
      ) : (
        <div className="sx-empty" ref={results}>
          <p className="c-kicker">Nothing on the wall</p>
          <p className="sx-empty__t">No work matches <em>“{q.trim()}”</em>{cat !== "all" && <> in {CAT_LABEL[cat]}</>}.</p>
          <p className="lede">Try a name, a god or a colour, or see the whole collection.</p>
          <div className="sx-empty__acts">
            <button type="button" className="btn btn--ink" onClick={() => { pickQ(""); pickCat("all"); }}><span>Show all {WORKS.length} works</span></button>
            <Link href="/commissions/" className="c-link">Or commission your own →</Link>
          </div>
        </div>
      )}
    </section>
  );
}

/** Spirit Gates, straight into the bag. */
export function MangaAdd() {
  const add = useCart((s) => s.add);
  return (
    <button type="button" className="btn btn--ink" disabled={!MANGA.available}
      onClick={() => add({ variantId: MANGA.variantId, slug: MANGA.slug, title: MANGA.t, image: `${BASE}/img/sg-cover-800.webp`, option: "Manga · Vol. 1", price: MANGA.price })}>
      <span>Add to bag · ${MANGA.price}</span><i aria-hidden>+</i>
    </button>
  );
}
