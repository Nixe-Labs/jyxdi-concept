import Link from "next/link";
import FadeIn from "./FadeIn";

/** The homepage's last word (Akka's plan): take a painting home, or ask about an event. */
export default function Closing() {
  return (
    <section className="section c-close" data-mood="burgundy" aria-labelledby="c-close-title">
      <FadeIn className="c-close__in" stagger={0.1} y={30}>
        <p className="c-kicker">Shop or book</p>
        <h2 id="c-close-title" className="c-h2">Your wall, <em>or your day.</em></h2>
        <p className="lede">Take a painting home, or have Jyxdi paint your wedding or event live, in Canada, the USA or anywhere in the world.</p>
        <div className="c-close__ctas">
          <Link href="/shop/" className="btn btn--gold"><span>Shop Artwork</span><i>→</i></Link>
          <Link href="/live-painting/#inquire" className="btn btn--line"><span>Inquire About an Event</span><i>→</i></Link>
        </div>
      </FadeIn>
    </section>
  );
}
