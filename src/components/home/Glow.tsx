import Link from "next/link";
import FadeIn from "./FadeIn";
import { BASE } from "@/lib/base";

/** A window onto a still painting: the photo stays put while the card scrolls over it (clip-path + position: fixed). */
export default function Glow() {
  return (
    <section className="c-glow-wrap" id="glow" data-mood="cream" aria-label="UV canvases">
    <div className="c-glow">
      <div className="c-glow__bg" aria-hidden><img src={`${BASE}/img/durgai-uv-1400.webp`} alt="" loading="lazy" decoding="async" /></div>
      <FadeIn className="c-glow__card" y={40} blur={6}>
        <p className="c-kicker">UV canvases · a little secret</p>
        <h2 className="c-h2">Some of them <em>glow</em> in the dark.</h2>
        <p>Choose the UV finish on any canvas and it&apos;s painted with fluorescent pigment. By day it looks like the original. Under a blacklight, it lights up.</p>
        <Link href="/shop/karrupusaamy/" className="btn btn--light"><span>Shop UV canvases</span><i>→</i></Link>
      </FadeIn>
      <p className="c-glow__cap">Durgai, under blacklight</p>
    </div>
    </section>
  );
}
