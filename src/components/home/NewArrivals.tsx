import Link from "next/link";
import ProductCard from "@/components/shop/ProductCard";
import { Underlined } from "@/components/sketch/Marks";
import { WORKS } from "@/lib/catalog";

const NEWEST = [...WORKS].sort((a, b) => b.created.localeCompare(a.created)).slice(0, 4);

export default function NewArrivals() {
  return (
    <section className="section">
      <div className="section__head">
        <div>
          <p className="kicker"><b>New</b> in the shop</p>
          <h2 className="display display--md">Fresh off the <Underlined seed="easel"><em>easel.</em></Underlined></h2>
        </div>
        <Link href="/shop/" className="btn btn--line"><span>See all {WORKS.length} works</span><i>→</i></Link>
      </div>
      <div className="wrap cards">
        {NEWEST.map((w, i) => <ProductCard key={w.slug} w={w} isNew rotate={[-1.5, 1, -0.8, 1.6][i]} />)}
      </div>
    </section>
  );
}
