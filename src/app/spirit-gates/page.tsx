import type { Metadata } from "next";
import "../styles/manga.css";
import MangaHero, { MangaBook, Signing } from "@/components/pages/MangaHero";
import Footer from "@/components/chrome/Footer";

export const metadata: Metadata = {
  title: "Spirit Gates, Vol. 1",
  description: "Spirit Gates is the first-ever manga by JYXDI. 11″ × 5″ print, free bookmark, first 100 copies hand-signed. $49 CAD.",
};

/* the page moves through the palette: black (the volume) → cream (the story, a book that turns its pages) → burgundy (the signing note) → black footer */
export default function SpiritGatesPage() {
  return (
    <>
      <main className="mg">
        <MangaHero />
        <MangaBook />
        <Signing />
      </main>
      <Footer />
    </>
  );
}
