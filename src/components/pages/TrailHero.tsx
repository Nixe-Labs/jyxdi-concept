"use client";
import { useEffect, useState } from "react";
import ImageTrail from "@/components/rb/ImageTrail";
import { WORKS, smallest } from "@/lib/catalog";

const ITEMS = WORKS.filter((_, i) => i % 2 === 0).map(smallest);

/** React Bits <ImageTrail>: paintings spill out behind the cursor (or finger). */
export default function TrailHero() {
  const [touch, setTouch] = useState(false);
  useEffect(() => setTouch(matchMedia("(hover: none)").matches), []);
  return (
    <section className="trail-hero grid-paper" aria-label="Jyxdi">
      <div className="trail-hero__trail" data-cursor-hide><ImageTrail items={ITEMS} variant={1} /></div>
      <div className="trail-hero__copy">
        <div>
          <p className="note m-0">painter · educator · storyteller</p>
          <h1 className="trail-hero__name">Jyxdi</h1>
        </div>
      </div>
      <p className="trail-hero__hint note m-0">{touch ? "drag your finger across the page ✎" : "move your cursor across the page ✎"}</p>
    </section>
  );
}
