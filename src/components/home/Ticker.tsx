"use client";
import { useState } from "react";

const LINE = ["Hand-signed", "Certificate of authenticity", "Ships worldwide", "Prints from $90", "Worked with Michael B. Jordan · COACH · XO · OVO40"];

/** One slim line drifting by (pure CSS); four copies so the loop never shows a gap. It holds still under the pointer,
    and the pause stops it (WCAG 2.2.2). */
export default function Ticker() {
  const [paused, setPaused] = useState(false);
  return (
    <section className={`c-ticker ${paused ? "is-paused" : ""}`} data-mood="cream" aria-label="Why buy from Jyxdi">
      <div className="c-ticker__track" aria-hidden>
        {[0, 1, 2, 3].map((k) => <span key={k} className="c-ticker__item">{LINE.map((t) => <span key={t}>{t}<i>✦</i></span>)}</span>)}
      </div>
      <p className="sr-only">Hand-signed, certificate of authenticity, ships worldwide, prints from $90. Jyxdi has worked with Michael B. Jordan, COACH, XO and OVO40.</p>
      <button type="button" className="c-ticker__pause" onClick={() => setPaused(!paused)} aria-label={paused ? "Play the moving line" : "Pause the moving line"}>{paused ? "Play" : "Pause"}</button>
    </section>
  );
}
