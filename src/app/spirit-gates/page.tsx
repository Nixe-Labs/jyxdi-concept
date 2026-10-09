import type { Metadata } from "next";
import Link from "next/link";
import MangaHero from "@/components/pages/MangaHero";
import { Underlined } from "@/components/sketch/Marks";
import FadeIn from "@/components/home/FadeIn";
import Footer from "@/components/chrome/Footer";

export const metadata: Metadata = {
  title: "Spirit Gates, Vol. 1",
  description: "Spirit Gates is the first-ever manga by JYXDI. 11″ × 5″ print, free bookmark, first 100 copies hand-signed. $49 CAD.",
};

export default function SpiritGatesPage() {
  return (
    <>
      <main>
        <MangaHero />
        <section className="section">
          <div className="wrap grid gap-[clamp(30px,6vw,100px)] md:grid-cols-[1fr_1.2fr]">
            <div>
              <p className="kicker"><b>The story</b></p>
              <h2 className="display display--md">A nation that forgot <Underlined seed="roots"><em>its roots.</em></Underlined></h2>
            </div>
            <FadeIn className="prose" stagger={0.06}>
              <p>Join Akiko, a young orphan unaware of her extraordinary potential, as she navigates a nation disconnected from its spiritual roots and mired in oblivion.</p>
              <p>The spirit world is not as it seems, ruled with an iron grip by the tyrannical Queen Alora, a master of dark magic. Akiko&apos;s destiny takes a dangerous turn as she sets out to find a fallen meteorite from the human world.</p>
              <p>The quest carries her into a parallel universe, where she meets her enigmatic counterpart, Akiko 2.0. Can she secure the elusive stone, a beacon of hope, and break free from Alora&apos;s control? Or will it lead to trouble galore?</p>
            </FadeIn>
          </div>
        </section>
        <section className="section !pt-0">
          <div className="section__head"><h2 className="display display--sm">Meet the cast</h2><p className="note m-0">no spoilers, promise</p></div>
          <FadeIn className="cast" stagger={0.1}>
            <div className="cast__card paper-card"><span className="note">the hero</span><h3>Akiko</h3><p>A young orphan who has no idea how much power she holds.</p></div>
            <div className="cast__card paper-card ruled"><span className="note">the ruler</span><h3>Queen Alora</h3><p>Tyrant of the spirit world and a master of dark magic.</p></div>
            <div className="cast__card paper-card"><span className="note">the mirror</span><h3>Akiko 2.0</h3><p>Akiko&apos;s enigmatic counterpart from a parallel universe.</p></div>
          </FadeIn>
          <div className="mt-14 text-center"><Link href="/shop/" className="link-hand">or browse the paintings →</Link></div>
        </section>
      </main>
      <Footer />
    </>
  );
}
