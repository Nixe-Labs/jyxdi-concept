import Link from "next/link";
import FadeIn from "./FadeIn";
import { BASE } from "@/lib/base";

const photo = (w: number) => `${BASE}/img/loc-sofa-${w}.webp`;

/** Commission a painting: a large photo of her beside the words (the scene above it has its words on the left, so the photo leads here). */
export default function Teasers() {
  return (
    <section className="section c-ed" data-mood="burgundy" aria-labelledby="c-comm-title">
      <div className="c-ed__grid">
        <FadeIn as="figure" className="c-ed__media" y={50}>
          <div className="c-ed__photo"><img src={photo(800)} srcSet={`${photo(800)} 800w, ${photo(1400)} 1400w`} sizes="(max-width: 899px) 92vw, 42vw" width={1400} height={1960} alt="Jyxdi seated beside her painting Arthanareeswarar" loading="lazy" decoding="async" style={{ objectPosition: "50% 40%" }} /></div>
          <figcaption>Jyxdi, with Arthanareeswarar</figcaption>
        </FadeIn>
        <FadeIn className="c-ed__copy" stagger={0.1} y={26}>
          <p className="c-kicker">Have something in mind?</p>
          <h2 id="c-comm-title" className="c-h2">Commission <em>a painting.</em></h2>
          <p className="lede">A personal painting or installation, made with you. Tell Jyxdi what you see.</p>
          <div><Link href="/commissions/" className="btn btn--ink"><span>Start a brief</span><i>→</i></Link></div>
        </FadeIn>
      </div>
    </section>
  );
}
