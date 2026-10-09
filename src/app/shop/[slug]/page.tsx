import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductView from "@/components/shop/ProductView";
import Footer from "@/components/chrome/Footer";
import { WORKS, bySlug, largest, fromPrice } from "@/lib/catalog";

export function generateStaticParams() {
  return WORKS.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({ params }: PageProps<"/shop/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const w = bySlug(slug);
  if (!w) return {};
  return {
    title: w.t,
    description: `${w.d} Hand-signed prints and canvases from $${fromPrice(w)} CAD.`,
    openGraph: { title: `${w.t} · Jyxdi`, images: [largest(w)] },
  };
}

export default async function ProductPage({ params }: PageProps<"/shop/[slug]">) {
  const { slug } = await params;
  const w = bySlug(slug);
  if (!w) notFound();
  return (
    <>
      <main><ProductView key={w.slug} w={w} /></main>
      <Footer />
    </>
  );
}
