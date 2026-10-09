import Link from "next/link";
import Print from "@/components/sketch/Tape";
import FadeIn from "./FadeIn";
import { Underlined } from "@/components/sketch/Marks";
import { BASE } from "@/lib/base";

export default function ArtistBlock() {
  return (
    <section className="section">
      <div className="artist">
        <div className="artist__photos">
          <Print className="artist__p1" src={`${BASE}/img/loc-live-paint-800.webp`} alt="Jyxdi painting live on stage" rotate={-3} tape={["tl", "tr"]} />
          <Print className="artist__p2" src={`${BASE}/img/loc-kalki-horse-800.webp`} alt="Jyxdi on the beach with the Kalki painting and a white horse" rotate={5} tape={["t"]} polaroid caption="the Kalki shoot ✎" />
        </div>
        <FadeIn stagger={0.08}>
          <p className="kicker"><b>Meet</b> the artist</p>
          <h2 className="display display--md">This is <Underlined seed="jyxdi"><em>Jyxdi.</em></Underlined></h2>
          <p className="lede">A painter, educator and the creator of the Spirit Gates fandom. Her paintings take gods, goddesses and myths and turn the colour all the way up, and her work has led to collaborations with names you&apos;ll know.</p>
          <div className="collabs">{["Michael B. Jordan", "COACH", "XO", "OVO40"].map((c) => <span key={c}>{c}</span>)}</div>
          <blockquote>“With each brushstroke, Jyxdi continues to push the boundaries of art.”</blockquote>
          <Link href="/artist/" className="btn btn--ink"><span>Read her story</span><i>→</i></Link>
        </FadeIn>
      </div>
    </section>
  );
}
