import type { Metadata } from "next";
import Link from "next/link";
import TrailHero from "@/components/pages/TrailHero";
import Print from "@/components/sketch/Tape";
import { Circled, Underlined } from "@/components/sketch/Marks";
import FadeIn from "@/components/home/FadeIn";
import Polaroids from "@/components/home/Polaroids";
import Footer from "@/components/chrome/Footer";
import { WORKS, smallest, type Work } from "@/lib/catalog";
import { BASE } from "@/lib/base";

export const metadata: Metadata = {
  title: "The Artist",
  description: "Meet Jyxdi: painter, educator and creator of the Spirit Gates fandom, with collaborations including Michael B. Jordan, COACH, XO and OVO40.",
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const byYear = [...WORKS].sort((a, b) => b.created.localeCompare(a.created)).reduce<Record<string, Work[]>>((acc, w) => {
  (acc[w.created.slice(0, 4)] ||= []).push(w); return acc;
}, {});

export default function ArtistPage() {
  return (
    <>
      <main>
        <TrailHero />

        <section className="section">
          <div className="artist">
            <div className="artist__photos">
              <Print className="artist__p1" src={`${BASE}/img/loc-sofa-800.webp`} alt="Jyxdi seated beside Arthanareeswarar" rotate={-3} tape={["tl", "tr"]} />
              <Print className="artist__p2" src={`${BASE}/img/loc-saraswati-800.webp`} alt="Jyxdi standing beside her Saraswati painting" rotate={4} tape={["t"]} polaroid caption="with Saraswati" />
            </div>
            <FadeIn className="prose" stagger={0.06}>
              <p className="kicker"><b>Biography</b></p>
              <h2 className="display display--md">Stories, told <Circled seed="paint"><em>in paint.</em></Circled></h2>
              <p>Jyxdi is a visionary painter, educator and the creator of the groundbreaking Spirit Gates fandom. With a passion for storytelling through art, she has captivated audiences worldwide with paintings that are each a testament to her boundless creativity and unique perspective.</p>
              <p>Beyond her own canvases, Jyxdi is a dedicated art educator, sharing her knowledge and expertise with aspiring artists of all ages and helping them unlock their own creative potential.</p>
              <p>She has collaborated with a diverse range of notable figures, including acclaimed actor Michael B. Jordan, COACH, XO and OVO40, bringing her artistry to new heights of recognition.</p>
              <p>Not content with traditional mediums, she has also stepped into the digital realm, launching her own NFT collection through the Spirit Gates fandom. Volume 1 has already captured the imagination of fans, with more volumes set to follow.</p>
              <p className="note">— adapted from Jyxdi&apos;s biography</p>
            </FadeIn>
          </div>
        </section>

        <section className="section !pt-0">
          <div className="section__head"><h2 className="display display--sm">Three hats, <Underlined seed="hats"><em>one studio.</em></Underlined></h2></div>
          <FadeIn className="roles" stagger={0.1}>
            <div className="role paper-card"><span className="num">01</span><h3>Painter</h3><p>Gods, goddesses and myths in loud, saturated colour; cosmic portraits; charcoal studies; and canvases finished in UV pigment that glow in the dark.</p><Link href="/shop/" className="link-hand mt-4">see the paintings →</Link></div>
            <div className="role paper-card ruled"><span className="num">02</span><h3>Educator</h3><p>A dedicated art teacher, sharing her knowledge and expertise with aspiring artists of all ages.</p></div>
            <div className="role paper-card"><span className="num">03</span><h3>Storyteller</h3><p>Creator of Spirit Gates, her manga about Akiko, a young orphan drawn into a spirit world ruled by the tyrannical Queen Alora.</p><Link href="/spirit-gates/" className="link-hand mt-4">read about it →</Link></div>
          </FadeIn>
        </section>

        <section className="ticker !py-10 text-center" aria-label="Collaborations">
          <p className="note m-0">collaborations include</p>
          <p className="m-0 font-serif text-[clamp(38px,6vw,96px)] leading-[1.05]">Michael B. Jordan · <em>COACH</em> · XO · <em>OVO40</em></p>
        </section>

        <section className="section">
          <div className="section__head">
            <div>
              <p className="kicker"><b>The studio log</b></p>
              <h2 className="display display--md">When each painting <Underlined seed="log"><em>arrived.</em></Underlined></h2>
            </div>
            <p className="note m-0 max-w-[26ch]">in the order they landed in the shop, newest first</p>
          </div>
          <div className="log">
            {Object.entries(byYear).sort(([a], [b]) => b.localeCompare(a)).map(([year, works]) => (
              <div className="log__year" key={year}>
                <h3>{year}</h3>
                <div className="log__items">
                  {works.map((w, i) => (
                    <Link href={`/shop/${w.slug}/`} className="log__item" key={w.slug} data-cursor="View">
                      <figure className="print m-0" style={{ ["--r" as string]: `${((i * 53) % 7) - 3}deg` }}><img src={smallest(w)} alt={w.t} loading="lazy" className="aspect-[4/5] object-cover" /></figure>
                      <b>{w.t}</b><span>{MONTHS[+w.created.slice(5, 7) - 1]} {year}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <Polaroids />

        <section className="section !pt-0 text-center">
          <p className="note">like what you see?</p>
          <h2 className="display display--md mb-8">Own a piece, or <em>commission one.</em></h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/shop/" className="btn btn--ink"><span>Shop the collection</span><i>→</i></Link>
            <Link href="/commissions/" className="btn btn--line"><span>Start a commission</span></Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
