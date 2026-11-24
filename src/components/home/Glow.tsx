import Link from "next/link";
import FadeIn from "./FadeIn";
import { UvRoom } from "./AfterDark";
import { UV_PAIRS } from "@/lib/catalog";

const { day, uv } = UV_PAIRS.karrupusaamy;

/** The UV glow on the homepage (Akka's plan, after the weddings): Karrupusaamy in the blacklight room, with the dimmer
    and the switch in the visitor's hands. The same room closes his own page. */
export default function Glow() {
  return (
    <UvRoom day={day} uv={uv} alt="Karrupusaamy" aria-labelledby="c-glow-title" head={
      <FadeIn stagger={0.1} y={30}>
        <p className="c-kicker">Signature UV Glow Canvas</p>
        <h2 id="c-glow-title" className="c-h2">Switch off <em>the lights.</em></h2>
        <p className="lede">The canvas, with fluorescent pigment painted on by hand. By day it looks like the original; under a blacklight, it lights up.</p>
        <p className="uvr__hint">Slide the lights down to blacklight, or tap Lights off.</p>
      </FadeIn>
    }>
      <Link href="/shop/karrupusaamy/" className="btn btn--gold"><span>Shop Karrupusaamy</span><i>→</i></Link>
      <Link href="/shop/#formats" className="c-link">Explore art formats →</Link>
    </UvRoom>
  );
}
