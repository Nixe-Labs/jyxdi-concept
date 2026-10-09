import catalog from "@/data/catalog.json";
import { BASE } from "@/lib/base";

/** One artwork, as published on jyxdi.com (prices in CAD). */
export type Work = {
  h: string;          // Shopify handle
  slug: string;       // URL-safe slug for this site
  t: string;          // title
  c: Category;
  img: string;        // image key in /public/img
  sizes: number[];    // available image widths
  ar: number;         // aspect ratio (w / h)
  d: string;          // short description
  v: Record<string, [number, number, boolean]>; // "size|format|finish" → [variantId, price, available]
  date: string;
  created: string;
};
export type Category = "Divine" | "Goddess" | "Cosmos";

export const WORKS = catalog.works as unknown as Work[];
export const MANGA = catalog.manga;

export const CAT_LABEL: Record<Category, string> = { Divine: "Gods", Goddess: "Goddesses", Cosmos: "Cosmos" };
export const SIZES = ["16x20", "24x30", "30x40", "48x60"] as const;
export const FORMATS = ["Poster", "Canvas"] as const;
export const FINISHES = ["Classic", "UV"] as const;
export type Size = (typeof SIZES)[number];
export type Format = (typeof FORMATS)[number];
export type Finish = (typeof FINISHES)[number];

/** Works with a matched daylight/blacklight photo pair. */
export const UV_PAIRS: Record<string, { day: string; uv: string }> = {
  karrupusaamy: { day: `${BASE}/img/k-classic-1092.webp`, uv: `${BASE}/img/k-uv-1092.webp` },
};

export const bySlug = (slug: string) => WORKS.find((w) => w.slug === slug);
export const img = (w: Work, size: number) => `${BASE}/img/${w.img}-${size}.webp`;
export const largest = (w: Work) => img(w, w.sizes[w.sizes.length - 1]);
export const smallest = (w: Work) => img(w, w.sizes[0]);
export const srcSet = (w: Work) => w.sizes.map((s) => `${img(w, s)} ${s}w`).join(", ");
export const ambient = (w: Work) => `${BASE}/img/amb-${w.img}.webp`;
export const fromPrice = (w: Work) =>
  Math.min(...Object.values(w.v).filter((x) => x[2]).map((x) => x[1]));
export const variant = (w: Work, s: Size, f: Format, fin: Finish) => w.v[`${s}|${f}|${fin}`];
export const isAvailable = (w: Work, s: Size, f: Format, fin: Finish) => !!variant(w, s, f, fin)?.[2];
export const money = (n: number) => n.toLocaleString("en-CA", { maximumFractionDigits: 0 });
export const isTamil = (s: string) => /[஀-௿]/.test(s);

/** Shopify cart permalink: lands the shopper in jyxdi.com's real checkout. */
export const checkoutUrl = (lines: { variantId: number; qty: number }[]) =>
  `https://jyxdi.com/cart/${lines.map((l) => `${l.variantId}:${l.qty}`).join(",")}`;

export const FEATURED = ["ganesh-x-shiva", "twin-flame", "durgai", "krishna-radha", "yugan", "lakshmi", "thadam", "hanuman"]
  .map(bySlug).filter(Boolean) as Work[];
export const HERO = ["arthanareeswarar", "yugan", "ganesh-x-shiva", "rise-from-the-ashes", "kali", "universe-within"]
  .map(bySlug).filter(Boolean) as Work[];
