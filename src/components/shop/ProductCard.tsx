"use client";
import Link from "next/link";
import { ViewTransition } from "react";
import { type Work, CAT_LABEL, UV_PAIRS, smallest, srcSet } from "@/lib/catalog";

/** One work in the collection: the painting, its title and its category. Price and buying are on its own page. */
/** vt: the image glides into the work's own page (React <ViewTransition>). Only one element per page may carry a work's name, so pass vt={false} for a second copy. */
export default function ProductCard({ w, priority = false, isNew = false, rotate, vt = true }: { w: Work; priority?: boolean; isNew?: boolean; rotate?: number; vt?: boolean }) {
  const tilt = rotate ?? ((w.slug.length * 37) % 7) * 0.5 - 1.5;
  return (
    <article className="pcard">
      <div className="pcard__print" style={{ ["--r" as string]: `${tilt}deg` }}>
        {isNew && <span className="pcard__stamp stamp">New</span>}
        <Link href={`/shop/${w.slug}/`} transitionTypes={["art-open"]} className="pcard__media">
          {vt ? <ViewTransition name={`art-${w.slug}`} share={{ "art-open": "art-morph", default: "none" }} default="none"><img src={smallest(w)} srcSet={w.sizes.length > 1 ? srcSet(w) : undefined} sizes="(max-width: 899px) 46vw, 25vw" width={600} height={Math.round(600 / w.ar)} alt={`${w.t}, painting by Jyxdi`} loading={priority ? "eager" : "lazy"} decoding="async" /></ViewTransition> : <img src={smallest(w)} srcSet={w.sizes.length > 1 ? srcSet(w) : undefined} sizes="(max-width: 899px) 46vw, 25vw" width={600} height={Math.round(600 / w.ar)} alt={`${w.t}, painting by Jyxdi`} loading={priority ? "eager" : "lazy"} decoding="async" />}
          {UV_PAIRS[w.slug] && <span className="pcard__badge">✦ glows under UV</span>}
        </Link>
      </div>
      <div className="pcard__meta">
        <Link href={`/shop/${w.slug}/`} transitionTypes={["art-open"]} className="pcard__title">{w.t}</Link>
      </div>
      <span className="pcard__cat">{CAT_LABEL[w.c].toLowerCase()}</span>
    </article>
  );
}
