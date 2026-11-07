import Link from "next/link";
import ProductCard from "@/components/shop/ProductCard";
import FadeIn from "./FadeIn";
import { WORKS } from "@/lib/catalog";
import { WALL_SLUGS } from "@/lib/wall";

const NEWEST = [...WORKS].sort((a, b) => b.created.localeCompare(a.created)).slice(0, 4);

export default function NewArrivals() {
  return (
    <section className="section" data-mood="cream">
      <div className="section__head">
        <div>
          <p className="c-kicker">new in the shop</p>
          <h2 className="c-h2">Fresh off the <em>easel.</em></h2>
        </div>
        <Link href="/shop/" className="btn btn--line"><span>See all {WORKS.length} works</span><i>→</i></Link>
      </div>
      <FadeIn className="wrap cards c-cards4" stagger={0.08} y={30}>
        {NEWEST.map((w) => <ProductCard key={w.slug} w={w} isNew rotate={0} vt={!WALL_SLUGS.includes(w.slug)} />)}
      </FadeIn>
    </section>
  );
}
