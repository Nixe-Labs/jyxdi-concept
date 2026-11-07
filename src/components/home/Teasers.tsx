import Link from "next/link";
import FadeIn from "./FadeIn";
import { MANGA } from "@/lib/catalog";
import { BASE } from "@/lib/base";

export default function Teasers() {
  return (
    <section className="section" data-mood="burgundy">
      <FadeIn className="c-teasers" stagger={0.12} y={30}>
        <Link href="/spirit-gates/" className="c-teaser">
          <div className="c-teaser__media"><img src={`${BASE}/img/sg-cover-800.webp`} alt="" loading="lazy" decoding="async" /></div>
          <p className="c-kicker">also by Jyxdi</p>
          <h3>Spirit Gates, Vol. 1</h3>
          <p>Her first manga. The first 100 copies are hand-signed. ${MANGA.price} CAD.</p>
          <span className="c-link">Read more →</span>
        </Link>
        <Link href="/commissions/" className="c-teaser">
          <div className="c-teaser__media"><img src={`${BASE}/img/loc-sofa-800.webp`} alt="" loading="lazy" decoding="async" className="!object-[50%_40%]" /></div>
          <p className="c-kicker">have something in mind?</p>
          <h3>Commission a painting</h3>
          <p>A personal painting or installation, made with you. Tell Jyxdi what you see.</p>
          <span className="c-link">Start a brief →</span>
        </Link>
      </FadeIn>
    </section>
  );
}
