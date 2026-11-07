import Link from "next/link";
import FadeIn from "./FadeIn";
import Float from "./Float";
import { BASE } from "@/lib/base";

/** The "our story" panel from the reel: a calm statement, with two photos that fly in from the corners. */
export default function ArtistBlock() {
  return (
    <section className="section overflow-x-clip" data-mood="burgundy">
      <div className="c-story">
        <Float speed={0.12} spin={-6} className="c-story__cut c-story__cut--l">
          <FadeIn x={-90} y={110} rotate={-18} delay={0.3}><img src={`${BASE}/img/loc-live-paint-800.webp`} alt="" loading="lazy" decoding="async" /></FadeIn>
        </Float>
        <Float speed={0.2} spin={8} className="c-story__cut c-story__cut--r">
          <FadeIn x={90} y={110} rotate={16} delay={0.55}><img src={`${BASE}/img/loc-kalki-horse-800.webp`} alt="" loading="lazy" decoding="async" /></FadeIn>
        </Float>
        <FadeIn className="c-story__copy" stagger={0.12} y={24} blur={8}>
          <p className="c-kicker">meet the artist</p>
          <h2 className="c-story__text">This is Jyxdi: a painter, educator and the creator of the Spirit Gates fandom. Her paintings take gods, goddesses and myths and turn the colour all the way up.</h2>
          <p className="c-story__collabs">Collaborations with Michael B. Jordan · COACH · XO · OVO40</p>
          {/* wrapped: a .btn animates its own transform, which fights the fade-in and leaves it offset */}
          <div><Link href="/artist/" className="btn btn--line"><span>Read her story</span><i>→</i></Link></div>
        </FadeIn>
      </div>
    </section>
  );
}
