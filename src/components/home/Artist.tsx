import Link from "next/link";
import FadeIn from "./FadeIn";
import { BASE } from "@/lib/base";

const photo = (w: number) => `${BASE}/img/loc-kalki-horse-${w}.webp`;

/** This is Jyxdi: the words, then a large photo of her (the commission below leads with its photo, so the two alternate). */
export default function Artist() {
  return (
    <section className="section c-ed c-artist" data-mood="burgundy" aria-labelledby="c-artist-title">
      <div className="c-ed__grid">
        <FadeIn className="c-ed__copy" stagger={0.1} y={26}>
          <p className="c-kicker">Behind every painting</p>
          <h2 id="c-artist-title" className="c-h2">This is <em>Jyxdi.</em></h2>
          <p className="c-ed__text">A painter, educator and the creator of the Spirit Gates fandom. Her paintings take gods and goddesses and paint them in rich, saturated colour.</p>
          <div className="c-ed__collab">
            <p>Collaborations</p>
            <ul><li>Michael B. Jordan</li><li>COACH</li><li>XO</li><li>OVO40</li></ul>
          </div>
          <div><Link href="/artist/" className="btn btn--line"><span>Read her story</span><i>→</i></Link></div>
        </FadeIn>
        <FadeIn as="figure" className="c-ed__media" y={50}>
          <div className="c-ed__photo"><img src={photo(800)} srcSet={`${photo(800)} 800w, ${photo(1400)} 1400w`} sizes="(max-width: 899px) 92vw, 42vw" width={1400} height={1867} alt="Jyxdi on the beach beside a white horse and her Kalki painting" loading="lazy" decoding="async" /></div>
          <figcaption>Jyxdi, with Kalki, on the beach</figcaption>
        </FadeIn>
      </div>
    </section>
  );
}
