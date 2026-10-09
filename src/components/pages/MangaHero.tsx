"use client";
import { useEffect, useRef, useState } from "react";
import Galaxy from "@/components/rb/Galaxy";
import Stack from "@/components/rb/Stack";
import { MANGA, checkoutUrl } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { BASE } from "@/lib/base";

const PHOTOS = [
  [`${BASE}/img/sg-cover-800.webp`, "Spirit Gates Vol. 1 cover, glowing blue"],
  [`${BASE}/img/sg-fan-800.webp`, "Spirit Gates character cards fanned out"],
  [`${BASE}/img/sg-spread-800.webp`, "An interior spread of the manga"],
  [`${BASE}/img/sg-hold-800.webp`, "Jyxdi holding up the manga"],
];

export default function MangaHero() {
  const add = useCart((s) => s.add);
  const sec = useRef<HTMLElement>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setNear(e.isIntersecting), { rootMargin: "200px" });
    io.observe(sec.current!); return () => io.disconnect();
  }, []);
  return (
    <section className="night" ref={sec} data-dark>
      <div className="night__galaxy" aria-hidden>{near && <Galaxy hueShift={200} density={1} glowIntensity={0.35} saturation={0.5} twinkleIntensity={0.5} rotationSpeed={0.04} speed={0.7} mouseRepulsion={false} transparent />}</div>
      <div className="manga-hero">
        <div>
          <p className="kicker"><b>The manga</b> · written &amp; published by JYXDI</p>
          <h1 className="manga-title">Spirit<em>Gates</em></h1>
          <p className="note !text-[#ffd2c4]">volume one — the first 100 copies are hand-signed</p>
          <p className="max-w-[46ch] text-[17px] leading-relaxed text-[rgba(243,236,223,.85)]">The first-ever manga comic book by JYXDI: an epic journey into a realm where dormant powers are concealed, and destiny unfolds in the most unexpected ways.</p>
          <ul className="my-6 grid gap-2 p-0 text-[14px] text-[rgba(243,236,223,.8)] [list-style:none]">
            <li>✦ 11″ × 5″ high-quality print with a navy blue finish</li>
            <li>✦ Includes a free Spirit Gates bookmark</li>
            <li>✦ First 100 copies hand-signed by JYXDI</li>
          </ul>
          <p className="mb-5 font-serif text-[52px] leading-none">${MANGA.price} <small className="font-sans text-[12px] tracking-[.14em] text-[rgba(243,236,223,.6)]">CAD</small></p>
          <div className="flex flex-wrap gap-3">
            <button className="btn btn--red btn--lg" disabled={!MANGA.available} onClick={() => add({ variantId: MANGA.variantId, slug: MANGA.slug, title: MANGA.t, image: `${BASE}/img/sg-cover-800.webp`, option: "Manga · Vol. 1", price: MANGA.price })}><span>Add to bag</span><i>+</i></button>
            <a className="btn btn--lg border-[1.5px] border-[rgba(243,236,223,.6)] text-paper" href={checkoutUrl([{ variantId: MANGA.variantId, qty: 1 }])} target="_blank" rel="noopener"><span>Buy it now</span><i>↗</i></a>
          </div>
        </div>
        <div>
          <div className="stack-wrap" data-cursor="Drag">
            <Stack cards={PHOTOS.map(([src, alt]) => <img key={src} src={src} alt={alt} className="h-full w-full object-cover" draggable={false} />)} layout="pile" frame={8} frameColor="#f3ecdf" radius={6} tilt={6} sendToBackOnClick autoplay autoplayDelay={3200} pauseOnHover />
          </div>
          <p className="note mt-6 text-center !text-[#ffd2c4]">flick the top one away →</p>
        </div>
      </div>
    </section>
  );
}
