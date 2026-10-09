import Link from "next/link";
import { MANGA } from "@/lib/catalog";
import { BASE } from "@/lib/base";

export default function Teasers() {
  return (
    <section className="section !pt-0">
      <div className="teasers">
        <Link href="/spirit-gates/" className="teaser" data-dark data-cursor="Read">
          <img src={`${BASE}/img/sg-cover-800.webp`} alt="" loading="lazy" />
          <p className="note">also by Jyxdi —</p>
          <h3>Spirit Gates, Vol. 1</h3>
          <p>Her first manga. The first 100 copies are hand-signed. ${MANGA.price} CAD.</p>
          <span className="btn btn--red self-start"><span>Read more</span><i>→</i></span>
        </Link>
        <Link href="/commissions/" className="teaser" data-dark data-cursor="Begin">
          <img src={`${BASE}/img/loc-saraswati-800.webp`} alt="" loading="lazy" className="!object-[50%_30%]" />
          <p className="note">have something in mind?</p>
          <h3>Commission a painting</h3>
          <p>A personal painting or installation, made with you. Tell Jyxdi what you see.</p>
          <span className="btn btn--red self-start"><span>Start a brief</span><i>→</i></span>
        </Link>
      </div>
    </section>
  );
}
