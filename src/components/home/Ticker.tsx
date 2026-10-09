"use client";
import ScrollVelocity from "@/components/rb/ScrollVelocity";

export default function Ticker() {
  const a = <span className="ticker__item">Hand-signed<span className="dot">✶</span>Certificate of authenticity<span className="dot">✶</span>Ships worldwide<span className="dot">✶</span>Prints from $90<span className="dot">✶</span></span>;
  const b = <span className="ticker__item">Worked with <em>Michael B. Jordan</em><span className="dot">·</span><em>COACH</em><span className="dot">·</span><em>XO</em><span className="dot">·</span><em>OVO40</em><span className="dot">✶</span></span>;
  return (
    <section className="ticker" aria-label="Why buy from Jyxdi">
      <ScrollVelocity texts={[a, b]} velocity={30} numCopies={4} className="pr-[.5em]" parallaxClassName="relative overflow-hidden" scrollerClassName="flex whitespace-nowrap" />
      <p className="sr-only">Hand-signed, certificate of authenticity, ships worldwide, prints from $90. Jyxdi has worked with Michael B. Jordan, COACH, XO and OVO40.</p>
    </section>
  );
}
