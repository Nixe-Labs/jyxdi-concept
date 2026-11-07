import type { Metadata } from "next";
import Link from "next/link";
import "../styles/faq.css";
import FadeIn from "@/components/home/FadeIn";
import Footer from "@/components/chrome/Footer";
import { WORKS, SIZES, money } from "@/lib/catalog";
import { BASE } from "@/lib/base";
import FaqIndex from "@/components/pages/FaqIndex";

export const metadata: Metadata = {
  title: "FAQ, shipping & care",
  description: "Poster, canvas or UV canvas? Sizes, prices, shipping, payment and care for your Jyxdi artwork.",
};

const from = (s: string, f: "Poster" | "Canvas", fin: "Classic" | "UV") => Math.min(...WORKS.map((w) => (w.v[`${s}|${f}|${fin}`]?.[2] ? w.v[`${s}|${f}|${fin}`][1] : Infinity)));
const PAY = ["Visa", "Mastercard", "American Express", "Discover", "Diners Club", "PayPal", "Shop Pay", "Apple Pay", "Google Pay", "Bancontact", "iDEAL"];
const GROUPS = [
  { id: "formats", title: "Formats & sizes" },
  { id: "ordering", title: "Ordering & payment" },
  { id: "shipping", title: "Shipping" },
  { id: "care", title: "Caring for your art" },
  { id: "commissions", title: "Commissions" },
];

const Q = ({ q, children, open }: { q: string; children: React.ReactNode; open?: boolean }) => (
  <details open={open}><summary>{q}</summary><div>{children}</div></details>
);

/* cream (the questions) → burgundy (still curious?) → black footer */
export default function FaqPage() {
  return (
    <>
      <main>
        <section className="fq-top" data-mood="cream">
          <FadeIn className="fq-head" stagger={0.1} y={24}>
            <div>
              <p className="c-kicker">FAQ · Shipping &amp; care</p>
              <h1 className="fq-title">Before you <em>buy.</em></h1>
            </div>
            <p className="lede">Poster, canvas or UV canvas? Sizes, prices, shipping, payment and care for your Jyxdi artwork.</p>
          </FadeIn>
          <div className="fq-body">
            <FaqIndex groups={GROUPS.map((g) => ({ id: g.id, title: g.title }))} />
            <div>
              <div className="fq-group" id="formats">
                <h2>Formats &amp; sizes</h2>
                <div className="fq-acc">
                  <Q q="Poster, canvas or UV canvas: what's the difference?" open>
                    <p><b>Poster</b>: a print of the painting, and the most affordable way to own one.</p>
                    <p><b>Canvas</b>: the painting printed on canvas.</p>
                    <p><b>UV canvas</b>: a canvas finished with fluorescent pigment. In normal light it looks like the classic canvas; under a UV blacklight, parts of the painting glow. The UV finish is available on canvas only.</p>
                    <div className="fq-uv">
                      <figure><img src={`${BASE}/img/k-classic-700.webp`} width={700} height={876} alt="Karrupusaamy in daylight" loading="lazy" decoding="async" /><figcaption>In daylight</figcaption></figure>
                      <figure><img src={`${BASE}/img/k-uv-700.webp`} width={700} height={876} alt="Karrupusaamy under a blacklight, its fluorescent pigment glowing" loading="lazy" decoding="async" /><figcaption>Under a blacklight</figcaption></figure>
                    </div>
                  </Q>
                  <Q q="What sizes are there, and what do they cost?" open>
                    <div className="fq-table">
                      <table>
                        <thead><tr><th scope="col">Size</th><th scope="col">Poster</th><th scope="col">Canvas</th><th scope="col">UV canvas</th></tr></thead>
                        <tbody>{SIZES.map((s) => {
                          const [w, h] = s.split("x").map(Number);
                          return <tr key={s}><th scope="row">{w}×{h}″<small>{Math.round(w * 2.54)}×{Math.round(h * 2.54)} cm</small></th><td>${money(from(s, "Poster", "Classic"))}</td><td>${money(from(s, "Canvas", "Classic"))}</td><td>${money(from(s, "Canvas", "UV"))}</td></tr>;
                        })}</tbody>
                      </table>
                    </div>
                    <p className="fq-note">Prices in CAD. Each painting&apos;s own page shows its exact prices and a to-scale preview of every size.</p>
                  </Q>
                  <Q q="Is every piece signed?">Yes. Every order comes with a hand-signed certificate of authenticity.</Q>
                  <Q q="What are the surprise add-ons?">Every order includes surprise customised add-ons. We&apos;ll leave the rest as a surprise.</Q>
                  <Q q="How do I see the UV effect?">You&apos;ll need an ultraviolet blacklight, often sold as a UV or blacklight bulb or LED strip. Switch off the other lights, switch on the blacklight, and the fluorescent pigment lights up.</Q>
                </div>
              </div>
              <div className="fq-group" id="ordering">
                <h2>Ordering &amp; payment</h2>
                <div className="fq-acc">
                  <Q q="Where do I pay?">Checkout happens on Jyxdi&apos;s own Shopify store at jyxdi.com, so your payment is handled securely by Shopify. You can also <a href="https://jyxdi.com/account/login" target="_blank" rel="noopener">sign in to your account</a> there.</Q>
                  <Q q="Which payment methods are accepted?"><div className="pay">{PAY.map((p) => <span key={p}>{p}</span>)}</div></Q>
                  <Q q="Which currency are prices in?">Prices on this site are in Canadian dollars (CAD). The store supports local currencies for many countries at checkout.</Q>
                </div>
              </div>
              <div className="fq-group" id="shipping">
                <h2>Shipping</h2>
                <div className="fq-acc">
                  <Q q="Do you ship to my country?">Jyxdi ships worldwide. Shipping costs and delivery options for your address are shown at checkout before you pay.</Q>
                  <Q q="I have a question about my order.">Get in touch through <a href="https://jyxdi.com/pages/contact" target="_blank" rel="noopener">the contact page</a> and include your order number.</Q>
                </div>
              </div>
              <div className="fq-group" id="care">
                <h2>Caring for your art</h2>
                <div className="fq-acc">
                  <Q q="How should I look after a poster or canvas?">A few general tips: hang it out of direct sunlight to keep the colours bright, keep it away from damp walls and bathrooms, and dust it gently with a soft, dry cloth. Avoid cleaning sprays.</Q>
                </div>
              </div>
              <div className="fq-group" id="commissions">
                <h2>Commissions</h2>
                <div className="fq-acc">
                  <Q q="Can I commission my own piece?">Yes, personalised paintings and installations. <Link href="/commissions/">Send a brief</Link> and Jyxdi will be in touch.</Q>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="fq-ask" data-mood="burgundy" aria-labelledby="fq-ask-title">
          <FadeIn as="figure" className="fq-ask__media" y={40}>
            <img src={`${BASE}/img/loc-durgai-800.webp`} srcSet={`${BASE}/img/loc-durgai-800.webp 800w, ${BASE}/img/loc-durgai-1400.webp 1400w`} sizes="(max-width: 899px) 340px, 440px" width={1400} height={1750} alt="Jyxdi standing beside her Durgai painting on an easel" loading="lazy" decoding="async" />
          </FadeIn>
          <FadeIn stagger={0.1} y={24}>
            <p className="c-kicker">Still have a question?</p>
            <h2 id="fq-ask-title" className="c-h2">Get in <em>touch.</em></h2>
            <p className="lede">For an order, write through the contact page on jyxdi.com and include your order number. For a painting made just for you, send a brief.</p>
            <div className="fq-ask__ctas">
              <a className="btn btn--ink" href="https://jyxdi.com/pages/contact" target="_blank" rel="noopener"><span>Contact page</span><i aria-hidden>↗</i><span className="sr-only"> (opens in a new tab)</span></a>
              <Link className="c-link" href="/commissions/">Send a commission brief →</Link>
            </div>
            <p className="fq-ask__mail">Live painting, PR and inquiries: <a href="mailto:artbyjyxdi@gmail.com">artbyjyxdi@gmail.com</a></p>
          </FadeIn>
        </section>
      </main>
      <Footer />
    </>
  );
}
