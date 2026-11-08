import Link from "next/link";
import FadeIn from "./FadeIn";
import { BASE } from "@/lib/base";

export default function Teasers() {
  return (
    <section className="section" data-mood="burgundy">
      <FadeIn className="c-teasers c-teasers--one" y={30}>
        <Link href="/commissions/" className="c-teaser">
          <div className="c-teaser__media"><img src={`${BASE}/img/loc-sofa-800.webp`} alt="" loading="lazy" decoding="async" className="!object-[50%_40%]" /></div>
          <div className="c-teaser__words">
            <p className="c-kicker">have something in mind?</p>
            <h3>Commission a painting</h3>
            <p>A personal painting or installation, made with you. Tell Jyxdi what you see.</p>
            <span className="c-link">Start a brief →</span>
          </div>
        </Link>
      </FadeIn>
    </section>
  );
}
