"use client";
import Link from "next/link";
import { type Work, CAT_LABEL, UV_PAIRS, smallest, srcSet, variant, money, type Format } from "@/lib/catalog";
import { useCart } from "@/lib/cart";

/** A print taped to the page: tilts back straight on hover, one-tap quick add of the entry option. */
export default function ProductCard({ w, format = "Poster", priority = false, isNew = false, rotate }: { w: Work; format?: Format; priority?: boolean; isNew?: boolean; rotate?: number }) {
  const add = useCart((s) => s.add);
  const v = variant(w, "16x20", format, "Classic");
  const from = Math.min(...Object.entries(w.v).filter(([k, x]) => x[2] && k.includes(`|${format}|`)).map(([, x]) => x[1]));
  const tilt = rotate ?? ((w.slug.length * 37) % 7) * 0.5 - 1.5;
  return (
    <article className="pcard">
      <div className="pcard__print" style={{ ["--r" as string]: `${tilt}deg` }}>
        {isNew && <span className="pcard__stamp stamp">New</span>}
        <Link href={`/shop/${w.slug}/`} className="pcard__media" data-cursor="View">
          <img src={smallest(w)} srcSet={w.sizes.length > 1 ? srcSet(w) : undefined} sizes="(max-width: 899px) 46vw, 25vw" width={600} height={Math.round(600 / w.ar)} alt={`${w.t}, painting by Jyxdi`} loading={priority ? "eager" : "lazy"} decoding="async" />
          {UV_PAIRS[w.slug] && <span className="pcard__badge">✦ glows under UV</span>}
        </Link>
        <button className="pcard__quick" onClick={() => add({ variantId: v[0], slug: w.slug, title: w.t, image: smallest(w), option: `16×20 · ${format} · Classic`, price: v[1] })} aria-label={`Add ${w.t} to bag: 16 by 20 ${format.toLowerCase()}, $${v[1]}`}>
          <span>+ Add to bag</span><span className="opacity-60"><span className="only-fine">16×20 {format} · </span>${money(v[1])}</span>
        </button>
      </div>
      <div className="pcard__meta">
        <Link href={`/shop/${w.slug}/`} className="pcard__title">{w.t}</Link>
        <span className="pcard__price"><small>from </small>${money(from)}</span>
      </div>
      <span className="pcard__cat">{CAT_LABEL[w.c].toLowerCase()}</span>
    </article>
  );
}
