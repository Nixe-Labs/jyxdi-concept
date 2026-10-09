import Link from "next/link";
import FadeIn from "./FadeIn";
import { Underlined } from "@/components/sketch/Marks";

const Rolled = <svg viewBox="0 0 120 100"><rect x="18" y="14" width="70" height="80" /><path d="M88 14 c14 0 14 10 0 10 M18 94 c-10 0 -10 -8 0 -8" /><path d="M30 30 h46 M30 40 h30" /></svg>;
const Easel = <svg viewBox="0 0 120 100"><rect x="30" y="8" width="60" height="62" /><path d="M36 70 L24 98 M84 70 L96 98 M60 70 V96 M30 82 H90" /><path d="M40 20 l40 38 M80 20 l-40 38" /></svg>;
const Glow = <svg viewBox="0 0 120 100"><rect x="34" y="16" width="52" height="66" /><path className="glow" d="M60 4 v6 M60 88 v8 M20 49 h8 M92 49 h8 M28 18 l6 6 M86 80 l6 6 M92 18 l-6 6 M34 80 l-6 6" /><path className="glow" d="M60 34 a14 14 0 1 1 0 28 a14 14 0 1 1 0 -28" /></svg>;

export default function Formats() {
  return (
    <section className="section">
      <div className="section__head">
        <div>
          <p className="kicker"><b>Pick</b> your format</p>
          <h2 className="display display--md">Every painting, <Underlined seed="three"><em>three ways.</em></Underlined></h2>
        </div>
        <Link href="/faq/#formats" className="link-hand">compare sizes &amp; prices →</Link>
      </div>
      <FadeIn className="formats" stagger={0.1}>
        <div className="format paper-card">{Rolled}<h3>Poster</h3><span className="from">from $90</span>
          <ul><li>The most affordable way to own a piece</li><li>Four sizes, 16×20″ up to 48×60″</li><li>Hand-signed certificate of authenticity</li></ul></div>
        <div className="format paper-card">{Easel}<h3>Canvas</h3><span className="from">from $450</span>
          <ul><li>The painting on canvas</li><li>Four sizes, 16×20″ up to 48×60″</li><li>Hand-signed certificate of authenticity</li></ul></div>
        <div className="format format--uv paper-card" data-dark>{Glow}<h3>UV canvas</h3><span className="from">from $550</span>
          <ul><li>Fluorescent pigment that lights up under blacklight</li><li>Looks like the classic canvas by day</li><li>Four sizes, 16×20″ up to 48×60″</li></ul></div>
      </FadeIn>
    </section>
  );
}
