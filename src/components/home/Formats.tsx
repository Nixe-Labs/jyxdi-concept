import Link from "next/link";
import FadeIn from "./FadeIn";

const Rolled = <svg viewBox="0 0 120 100" aria-hidden><rect x="18" y="14" width="70" height="80" /><path d="M88 14 c14 0 14 10 0 10 M18 94 c-10 0 -10 -8 0 -8" /><path d="M30 30 h46 M30 40 h30" /></svg>;
const Easel = <svg viewBox="0 0 120 100" aria-hidden><rect x="30" y="8" width="60" height="62" /><path d="M36 70 L24 98 M84 70 L96 98 M60 70 V96 M30 82 H90" /><path d="M40 20 l40 38 M80 20 l-40 38" /></svg>;
const Glow = <svg viewBox="0 0 120 100" aria-hidden><rect x="34" y="16" width="52" height="66" /><path className="glow" d="M60 4 v6 M60 88 v8 M20 49 h8 M92 49 h8 M28 18 l6 6 M86 80 l6 6 M92 18 l-6 6 M34 80 l-6 6" /><path className="glow" d="M60 34 a14 14 0 1 1 0 28 a14 14 0 1 1 0 -28" /></svg>;

export default function Formats() {
  return (
    <section className="section" data-mood="burgundy">
      <div className="section__head">
        <div>
          <p className="c-kicker">Three ways to own a Jyxdi</p>
          <h2 className="c-h2">Every painting, <em>three ways.</em></h2>
        </div>
        <Link href="/faq/#formats" className="c-link">Compare sizes →</Link>
      </div>
      <FadeIn className="c-formats" stagger={0.1} y={30}>
        <div className="c-format">{Rolled}<h3>Art print</h3>
          <ul><li>The poster edition, and the easiest way to begin a collection</li><li>Four sizes, 16×20″ up to 48×60″</li></ul></div>
        <div className="c-format">{Easel}<h3>Canvas</h3>
          <ul><li>The painting on canvas</li><li>Four sizes, 16×20″ up to 48×60″</li></ul></div>
        <div className="c-format c-format--uv mood-black">{Glow}<h3>UV canvas</h3>
          <ul><li>Fluorescent pigment that lights up under blacklight</li><li>Looks like the classic canvas by day</li><li>Four sizes, 16×20″ up to 48×60″</li></ul></div>
      </FadeIn>
    </section>
  );
}
