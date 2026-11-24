import type { Metadata } from "next";
import Link from "next/link";
import "../styles/commissions.css";
import BriefForm from "@/components/pages/BriefForm";
import FadeIn from "@/components/home/FadeIn";
import Footer from "@/components/chrome/Footer";
import { PRINT, CANVAS, UV } from "@/lib/catalog";
import { BASE } from "@/lib/base";

export const metadata: Metadata = {
  title: "Commissions",
  description: "Commission a personal painting, mural or digital artwork from Jyxdi. Share your idea and shape the composition, palette and scale together.",
};

const photo = (name: string, w: number) => `${BASE}/img/${name}-${w}.webp`;
const srcSet = (name: string) => `${photo(name, 800)} 800w, ${photo(name, 1400)} 1400w`;
// commissions, in Akka's order: each gets its own starting price once she sends them; until then, quoted per project
const MADE = ["Custom digital artwork", "Original acrylic paintings", "Original oil paintings", "Murals & installations"];

const STEPS = [
  { title: "Send a brief", text: "Tell Jyxdi the idea, the size you have in mind and when you need it. A rough sketch or a reference link helps.", img: "loc-noir-2", alt: "Jyxdi holding up a large graphite drawing", pos: "50% 78%", tpos: "50% 48%" },
  { title: "Shape it together", text: "Work through composition, palette and scale together until it feels right.", img: "loc-kalabhairava", alt: "Jyxdi with Kalabhairava and her palette", pos: "50% 40%", tpos: "50% 12%" },
  { title: "It’s painted, once", text: "Your piece is made for you, hand-signed, and arrives with a certificate of authenticity.", img: "loc-sofa", alt: "Jyxdi seated beside Arthanareeswarar", pos: "50% 42%" },
];

/* calm colour: cream (hero, steps, prices) → burgundy (the brief) → black footer */
export default function CommissionsPage() {
  return (
    <>
      <main>
        <section className="cm-hero" data-mood="cream">
          <div>
            <p className="c-kicker cm-hero__kicker">Commissions · Painting, mural &amp; digital art</p>
            <h1 className="cm-hero__title">
              <span className="cm-line"><span>Your idea,</span></span>
              <span className="cm-line"><span><em>painted.</em></span></span>
            </h1>
            <p className="lede">Transform your vision into reality with a personalised painting or installation. Share your ideas and preferences, and Jyxdi will collaborate closely with you to bring your unique piece to life.</p>
            <div className="cm-hero__ctas">
              <a href="#brief" className="btn btn--ink"><span>Start your brief</span><i aria-hidden>↓</i></a>
              <Link href="/live-painting/" className="c-link">Weddings &amp; events: live painting →</Link>
            </div>
            <div className="cm-hero__meta">
              <ul className="cm-hero__trust"><li>Hand-signed</li><li>Certificate of authenticity</li><li>Quoted per project</li></ul>
              <p className="cm-hero__collab">Collaborations with <b>Michael B. Jordan · COACH · XO · OVO40</b></p>
            </div>
          </div>
          <div className="cm-hero__media">
            <div className="cm-arch">
              <div className="cm-arch__reveal">
                <img src={photo("loc-hanuman", 1400)} srcSet={srcSet("loc-hanuman")} sizes="(max-width: 899px) 78vw, 500px" width={1400} height={1750} alt="Jyxdi seated with her palette beside her Hanuman painting" fetchPriority="high" decoding="async" />
              </div>
              <p className="cm-arch__tag">Jyxdi, with her Hanuman</p>
            </div>
          </div>
        </section>

        <section className="section cm-steps" data-mood="cream" aria-labelledby="cm-steps-title">
          <FadeIn className="cm-steps__head" stagger={0.1} y={24}>
            <div>
              <p className="c-kicker">How it works</p>
              <h2 id="cm-steps-title" className="c-h2">How a commission <em>comes to life.</em></h2>
            </div>
            <p className="lede">Three steps, from the first idea to a piece that was made only once, for you.</p>
          </FadeIn>
          <ol className="cm-deck">
            {STEPS.map((s, i) => (
              <li key={s.title} className="cm-card" style={{ ["--i" as string]: i }}>
                <div className="cm-card__text">
                  <span className="cm-card__n" aria-hidden>{i + 1}</span>
                  <div>
                    <h3>{s.title}</h3>
                    <p>{s.text}</p>
                  </div>
                </div>
                <div className="cm-card__media">
                  <img src={photo(s.img, 1400)} srcSet={srcSet(s.img)} sizes="(max-width: 899px) 100vw, 680px" alt={s.alt} loading="lazy" decoding="async" style={{ ["--pos" as string]: s.pos, ["--pos-t" as string]: s.tpos ?? s.pos }} />
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="section cm-scale" data-mood="cream" aria-labelledby="cm-scale-title">
          <FadeIn className="cm-price" y={24}>
            <p className="c-kicker">A guide to pricing</p>
            <h2 id="cm-scale-title" className="c-h2">What a commission <em>costs.</em></h2>
            <p className="lede">A commission is an original, made once, for you, so it is priced on its own, apart from the prints and canvases of existing works in the shop.</p>
            <h3>In the shop</h3>
            <ul>
              <li><span>Fine Art Prints &amp; canvases</span><b><small>from</small>${PRINT}</b>
                <p>Reproductions of existing works: a Fine Art Print from ${PRINT}, a Premium Canvas from ${CANVAS}, a Signature UV Glow Canvas from ${UV}. <Link className="c-link" href="/shop/">Shop the collection →</Link></p></li>
            </ul>
            <h3>Made for you</h3>
            <ul>{MADE.map((m) => <li key={m}><span>{m}</span><b className="is-quote">Quoted per project</b></li>)}</ul>
            <p className="cm-scale__note">Prices in CAD.</p>
          </FadeIn>
        </section>

        <section id="brief" className="section cm-brief" data-mood="burgundy" aria-labelledby="cm-brief-title">
          <div className="cm-brief__grid">
            <div className="cm-brief__intro">
              <FadeIn stagger={0.1} y={24}>
                <p className="c-kicker">Your brief</p>
                <h2 id="cm-brief-title" className="c-h2">Tell Jyxdi <em>what you see.</em></h2>
                <p className="lede">A deity, a person, a memory, a feeling, the room it will live in. Send a brief and Jyxdi will be in touch.</p>
                <ul className="cm-notes"><li>Commissions are quoted per project</li><li>Hand-signed, with a certificate of authenticity</li><li>Brands, PR agencies and sponsors: choose “Brand collaboration”</li><li>Sent through Jyxdi’s own contact form on jyxdi.com</li></ul>
              </FadeIn>
              <Link href="/live-painting/" className="cm-live">
                <img src={photo("loc-live-paint", 800)} alt="" loading="lazy" decoding="async" />
                <span><b>Planning a wedding or an event?</b>Jyxdi paints it live, in front of your guests.<br /><i>Live painting →</i></span>
              </Link>
            </div>
            <BriefForm />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
