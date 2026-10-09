import type { Metadata } from "next";
import Link from "next/link";
import BriefForm from "@/components/pages/BriefForm";
import Print from "@/components/sketch/Tape";
import { Circled } from "@/components/sketch/Marks";
import Footer from "@/components/chrome/Footer";
import { WORKS, SIZES, money } from "@/lib/catalog";
import { BASE } from "@/lib/base";

export const metadata: Metadata = {
  title: "Commissions",
  description: "Commission a personal painting or installation from Jyxdi. Share your idea and collaborate on composition, palette and scale.",
};

const canvasFrom = (s: string, fin: "Classic" | "UV") => Math.min(...WORKS.map((w) => w.v[`${s}|Canvas|${fin}`]?.[1] ?? Infinity));

export default function CommissionsPage() {
  return (
    <>
      <main>
        <header className="page-head">
          <nav className="crumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span>Commissions</span></nav>
          <p className="note m-0 mb-2">have something in mind?</p>
          <h1 className="display">Your idea, <Circled seed="painted" delay={400}><em>painted.</em></Circled></h1>
          <p className="lede">Transform your vision into reality with a personalised painting or installation. Share your ideas and preferences, and Jyxdi will collaborate closely with you to bring your unique piece to life.</p>
        </header>

        <section className="section !pt-6">
          <div className="brief">
            <div>
              <ol className="steps">
                <li><span className="n">1</span><div><b>Send a brief</b><p>Tell Jyxdi the idea, the size you have in mind and when you need it. A rough sketch or a reference link helps.</p></div></li>
                <li><span className="n">2</span><div><b>Shape it together</b><p>Work through composition, palette and scale together until it feels right.</p></div></li>
                <li><span className="n">3</span><div><b>It&apos;s painted, once</b><p>Your piece is made for you, hand-signed, and arrives with a certificate of authenticity.</p></div></li>
              </ol>
              <div className="relative mt-14 h-[360px] max-[899px]:hidden">
                <Print src={`${BASE}/img/loc-thadam-easel-800.webp`} alt="A finished canvas on an easel at an event" rotate={-4} tape={["tl", "tr"]} className="!absolute left-0 top-0 w-[58%]" />
                <Print src={`${BASE}/img/loc-live-paint-800.webp`} alt="Jyxdi painting live on stage" rotate={5} tape={["t"]} polaroid caption="painting live ✎" className="!absolute right-0 top-14 w-[46%]" />
              </div>
            </div>
            <BriefForm />
          </div>
        </section>

        <section className="section !pt-0">
          <div className="wrap paper-card grid-paper p-[clamp(22px,3vw,44px)]">
            <p className="note m-0">for a sense of scale —</p>
            <h2 className="display display--sm mb-6">What canvases cost in the shop</h2>
            <div className="acc !mt-0 !border-t-0">
              <table>
                <thead><tr><th>Size</th><th>Centimetres</th><th>Canvas</th><th>UV canvas</th></tr></thead>
                <tbody>{SIZES.map((s) => (
                  <tr key={s}><td>{s.replace("x", "×")}″</td><td>{Math.round(+s.split("x")[0] * 2.54)} × {Math.round(+s.split("x")[1] * 2.54)}</td><td>from ${money(canvasFrom(s, "Classic"))}</td><td>${money(canvasFrom(s, "UV"))}</td></tr>
                ))}</tbody>
              </table>
            </div>
            <p className="mt-4 mb-0 text-[14px] text-graphite">These are prices for existing works in the shop. Commissions are quoted per project.</p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
