import type { Metadata } from "next";
import Link from "next/link";
import { Circled } from "@/components/sketch/Marks";
import Footer from "@/components/chrome/Footer";
import { WORKS, SIZES, money } from "@/lib/catalog";

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

export default function FaqPage() {
  return (
    <>
      <main>
        <header className="page-head">
          <nav className="crumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span>FAQ</span></nav>
          <p className="note m-0 mb-2">good questions —</p>
          <h1 className="display">Before you <Circled seed="buy" delay={400}><em>buy.</em></Circled></h1>
        </header>
        <section className="section !pt-4">
          <div className="faq">
            <nav className="faq__nav" aria-label="FAQ sections">{GROUPS.map((g) => <a key={g.id} href={`#${g.id}`}>{g.title}</a>)}</nav>
            <div>
              <div className="faq__group" id="formats">
                <h2>Formats &amp; sizes</h2>
                <div className="acc">
                  <Q q="Poster, canvas or UV canvas: what's the difference?" open>
                    <p className="mt-0"><b className="text-ink">Poster</b>: a print of the painting, and the most affordable way to own one.</p>
                    <p><b className="text-ink">Canvas</b>: the painting printed on canvas.</p>
                    <p className="mb-0"><b className="text-uv">UV canvas</b>: a canvas finished with fluorescent pigment. In normal light it looks like the classic canvas; under a UV blacklight, parts of the painting glow. The UV finish is available on canvas only.</p>
                  </Q>
                  <Q q="What sizes are there, and what do they cost?" open>
                    <table>
                      <thead><tr><th>Size</th><th>cm</th><th>Poster</th><th>Canvas</th><th>UV canvas</th></tr></thead>
                      <tbody>{SIZES.map((s) => (
                        <tr key={s}><td>{s.replace("x", "×")}″</td><td>{Math.round(+s.split("x")[0] * 2.54)}×{Math.round(+s.split("x")[1] * 2.54)}</td><td>${money(from(s, "Poster", "Classic"))}</td><td>${money(from(s, "Canvas", "Classic"))}</td><td>${money(from(s, "Canvas", "UV"))}</td></tr>
                      ))}</tbody>
                    </table>
                    <p className="mb-0 text-[13px]">Prices in CAD. Each painting&apos;s own page shows its exact prices and a to-scale preview of every size.</p>
                  </Q>
                  <Q q="Is every piece signed?">Yes. Every order comes with a hand-signed certificate of authenticity.</Q>
                  <Q q="What are the surprise add-ons?">Every order includes surprise customised add-ons. We&apos;ll leave the rest as a surprise.</Q>
                  <Q q="How do I see the UV effect?">You&apos;ll need an ultraviolet blacklight, often sold as a UV or blacklight bulb or LED strip. Switch off the other lights, switch on the blacklight, and the fluorescent pigment lights up.</Q>
                </div>
              </div>
              <div className="faq__group" id="ordering">
                <h2>Ordering &amp; payment</h2>
                <div className="acc">
                  <Q q="Where do I pay?">Checkout happens on Jyxdi&apos;s own Shopify store at jyxdi.com, so your payment is handled securely by Shopify. You can also <a className="underline" href="https://jyxdi.com/account/login" target="_blank" rel="noopener">sign in to your account</a> there.</Q>
                  <Q q="Which payment methods are accepted?"><div className="pay">{PAY.map((p) => <span key={p}>{p}</span>)}</div></Q>
                  <Q q="Which currency are prices in?">Prices on this site are in Canadian dollars (CAD). The store supports local currencies for many countries at checkout.</Q>
                </div>
              </div>
              <div className="faq__group" id="shipping">
                <h2>Shipping</h2>
                <div className="acc">
                  <Q q="Do you ship to my country?">Jyxdi ships worldwide. Shipping costs and delivery options for your address are shown at checkout before you pay.</Q>
                  <Q q="I have a question about my order.">Get in touch through <a className="underline" href="https://jyxdi.com/pages/contact" target="_blank" rel="noopener">the contact page</a> and include your order number.</Q>
                </div>
              </div>
              <div className="faq__group" id="care">
                <h2>Caring for your art</h2>
                <div className="acc">
                  <Q q="How should I look after a poster or canvas?">A few general tips: hang it out of direct sunlight to keep the colours bright, keep it away from damp walls and bathrooms, and dust it gently with a soft, dry cloth. Avoid cleaning sprays.</Q>
                </div>
              </div>
              <div className="faq__group" id="commissions">
                <h2>Commissions</h2>
                <div className="acc">
                  <Q q="Can I commission my own piece?">Yes, personalised paintings and installations. <Link className="underline" href="/commissions/">Send a brief</Link> and Jyxdi will be in touch.</Q>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
