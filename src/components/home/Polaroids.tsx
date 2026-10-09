"use client";
import { useRef } from "react";
import { motion } from "motion/react";
import { Underlined } from "@/components/sketch/Marks";
import { BASE } from "@/lib/base";

const SHOTS: [string, string, string, number, number, number][] = [
  // key, caption, alt, left %, top %, rotation
  ["loc-kalki-horse", "Kalki, on the beach", "Jyxdi on the beach beside a white horse with the Kalki painting", 2, 8, -6],
  ["loc-batu-caves", "Murugan at Batu Caves", "The Murugan painting in front of the golden Murugan statue", 20, 30, 4],
  ["loc-blossoms", "Radha Krishna in bloom", "The Radha Krishna painting under cherry blossoms", 38, 4, -3],
  ["loc-noir", "the charcoal one", "Black and white portrait with the charcoal Astral Serpent", 56, 26, 7],
  ["loc-river", "painting Bloom outside", "Jyxdi painting Bloom beside a river", 74, 6, -5],
  ["loc-thadam-glow", "தடம், under neon", "Close view of the Thadam canvas in neon light", 6, 52, 5],
  ["loc-kali-shore", "Kali vs the tide", "The Kali painting on a rocky shoreline", 44, 54, -7],
  ["loc-kalabhairava", "palette still wet", "Jyxdi with Kalabhairava and her palette", 78, 50, 3],
];

export default function Polaroids() {
  const table = useRef<HTMLDivElement>(null);
  const card = (s: (typeof SHOTS)[number]) => (
    <>
      <span className="tape tape--t" aria-hidden />
      <img src={`${BASE}/img/${s[0]}-800.webp`} alt={s[2]} loading="lazy" draggable={false} />
      <figcaption className="print__cap">{s[1]}</figcaption>
    </>
  );
  return (
    <section className="section">
      <div className="section__head">
        <div>
          <p className="kicker"><b>Off</b> the wall</p>
          <h2 className="display display--md">From the camera roll<br />of a <Underlined seed="travel"><em>travelling painter.</em></Underlined></h2>
        </div>
        <p className="note m-0 only-fine">go on, move them around ✎</p>
      </div>
      <div className="ptable max-[899px]:!hidden" ref={table}>
        {SHOTS.map((s, i) => (
          <motion.figure key={s[0]} className="print print--polaroid m-0" style={{ left: `${s[3]}%`, top: `${s[4]}%`, rotate: s[5], zIndex: i }}
            drag dragConstraints={table} dragElastic={0.15} whileDrag={{ scale: 1.06, zIndex: 50, cursor: "grabbing" }} whileHover={{ scale: 1.03 }}
            initial={{ opacity: 0, y: -40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.7, delay: i * 0.06, ease: [0.22, 0.8, 0.2, 1] }}
            data-cursor="Drag">
            {card(s)}
          </motion.figure>
        ))}
      </div>
      <div className="table__scroll min-[900px]:!hidden">
        {SHOTS.map((s) => <figure key={s[0]} className="print print--polaroid m-0" style={{ ["--r" as string]: `${s[5] / 2}deg` }}>{card(s)}</figure>)}
      </div>
    </section>
  );
}
