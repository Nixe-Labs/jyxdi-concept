import type { Metadata } from "next";
import Link from "next/link";
import { ViewTransition } from "react";
import "../styles/about.css";
import TrailHero from "@/components/pages/TrailHero";
import FadeIn from "@/components/home/FadeIn";
import Polaroids, { Films } from "@/components/home/Polaroids";
import Footer from "@/components/chrome/Footer";
import { WORKS, smallest, srcSet, type Work } from "@/lib/catalog";
import { BASE } from "@/lib/base";

export const metadata: Metadata = {
  title: "The Artist",
  description: "Meet Jyxdi: painter, educator and creator of the Spirit Gates fandom, with collaborations including Michael B. Jordan, COACH, XO and OVO40.",
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const YEARS = Object.entries([...WORKS].sort((a, b) => b.created.localeCompare(a.created)).reduce<Record<string, Work[]>>((acc, w) => {
  (acc[w.created.slice(0, 4)] ||= []).push(w); return acc;
}, {})).sort(([a], [b]) => b.localeCompare(a));

const ROLES: [string, string, [string, string]?][] = [
  ["Painter", "Gods, goddesses and myths in loud, saturated colour; cosmic portraits; charcoal studies; and canvases finished in UV pigment that glow in the dark.", ["/shop/", "See the paintings →"]],
  ["Educator", "A dedicated art teacher, sharing her knowledge and expertise with aspiring artists of all ages."],
  ["Storyteller", "Creator of Spirit Gates, her manga about Akiko, a young orphan drawn into a spirit world ruled by the tyrannical Queen Alora.", ["/spirit-gates/", "Read about it →"]],
];
const COLLABS = ["Michael B. Jordan", "COACH", "XO", "OVO40"];
const sofa = (w: number) => `${BASE}/img/loc-sofa-${w}.webp`;

/* the page moves through the palette: black (the gates) → burgundy (her story) → cream (her camera roll) → black (her reels) → cream (every painting) → black footer */
export default function ArtistPage() {
  return (
    <>
      <main className="ab">
        <TrailHero />

        <section className="ab-story section" data-mood="burgundy" aria-labelledby="ab-story-title">
          <div className="ab-story__grid">
            <FadeIn as="figure" className="ab-story__photo" y={70}>
              <img src={sofa(1400)} srcSet={`${sofa(800)} 800w, ${sofa(1400)} 1400w`} sizes="(max-width: 899px) 92vw, 40vw" alt="Jyxdi seated beside her Arthanareeswarar painting" width={1400} height={1960} loading="lazy" decoding="async" />
              <figcaption>With Arthanareeswarar</figcaption>
            </FadeIn>
            <div className="ab-story__copy">
              <FadeIn stagger={0.1} y={30}>
                <p className="c-kicker">Biography</p>
                <h2 id="ab-story-title" className="c-h2">Stories, told <em>in paint.</em></h2>
                <p className="ab-story__lead">Jyxdi is a visionary painter, educator and the creator of the Spirit Gates fandom. With a passion for storytelling through art, she has captivated audiences worldwide.</p>
                <p className="lede">An international wedding live painter, she paints celebrations as they happen, in front of the guests, and takes on custom paintings, murals and digital art.</p>
              </FadeIn>
              <FadeIn as="ol" className="ab-roles" stagger={0.12} y={30}>
                {ROLES.map(([role, text, link], i) => (
                  <li key={role}>
                    <span className="ab-roles__n" aria-hidden>{["i.", "ii.", "iii."][i]}</span>
                    <h3>{role}</h3>
                    <p>{text}</p>
                    {link && <Link href={link[0]} className="c-link">{link[1]}</Link>}
                  </li>
                ))}
              </FadeIn>
            </div>
          </div>
          <div className="ab-collabs">
            <FadeIn as="p" className="c-kicker" y={20}>Collaborations include</FadeIn>
            <FadeIn as="ul" stagger={0.1} y={30}>
              {COLLABS.map((c) => <li key={c}>{c}</li>)}
            </FadeIn>
          </div>
        </section>

        <Polaroids />
        <Films />

        <section className="ab-log section" data-mood="cream" aria-labelledby="ab-log-title">
          <FadeIn className="ab-log__head" stagger={0.1} y={30}>
            <p className="c-kicker">The studio log</p>
            <h2 id="ab-log-title" className="c-h2">When each painting <em>arrived.</em></h2>
            <p className="lede">Every work in the shop, in the order it landed, newest first. Choose one to see it in its own room.</p>
          </FadeIn>
          <div className="ab-log__years">
            {YEARS.map(([year, works]) => (
              <div className="ab-year" key={year}>
                <h3 className="ab-year__label"><b>{year}</b><span>{works.length} {works.length === 1 ? "work" : "works"}</span></h3>
                <ol>
                  {works.map((w) => (
                    <li key={w.slug}>
                      <Link href={`/shop/${w.slug}/`} transitionTypes={["art-open"]} className="ab-work">
                        <span className="ab-work__media">
                          <ViewTransition name={`art-${w.slug}`} share={{ "art-open": "art-morph", default: "none" }} default="none">
                            <img src={smallest(w)} srcSet={w.sizes.length > 1 ? srcSet(w) : undefined} sizes="(max-width: 899px) 46vw, 13vw" alt="" width={600} height={Math.round(600 / w.ar)} loading="lazy" decoding="async" />
                          </ViewTransition>
                        </span>
                        <b>{w.t}</b>
                        <span>{MONTHS[+w.created.slice(5, 7) - 1]} {year}</span>
                      </Link>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
          <FadeIn className="ab-end" stagger={0.1} y={30}>
            <p className="c-kicker">Like what you see?</p>
            <h2 className="c-h2">Own a piece, or <em>commission one.</em></h2>
            {/* wrapped: a .btn animates its own transform, which fights the fade-in */}
            <div className="ab-end__ctas">
              <Link href="/shop/" className="btn btn--ink"><span>Shop the collection</span><i>→</i></Link>
              <Link href="/commissions/" className="btn btn--line"><span>Start a commission</span></Link>
            </div>
            <p className="ab-end__mail">Live painting, PR and inquiries: <a href="mailto:artbyjyxdi@gmail.com">artbyjyxdi@gmail.com</a></p>
          </FadeIn>
        </section>
      </main>
      <Footer />
    </>
  );
}
