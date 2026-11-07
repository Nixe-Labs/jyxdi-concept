import Curtain from "@/components/home/Curtain";
import Hero from "@/components/home/Hero";
import Statement from "@/components/home/Statement";
import GalleryWall from "@/components/home/GalleryWall";
import LiveCinema from "@/components/lux/LiveCinema";
import NewArrivals from "@/components/home/NewArrivals";
import Ticker from "@/components/home/Ticker";
import FilmBand from "@/components/home/FilmBand";
import Glow from "@/components/home/Glow";
import Formats from "@/components/home/Formats";
import ArtistBlock from "@/components/home/ArtistBlock";
import Teasers from "@/components/home/Teasers";
import Footer from "@/components/chrome/Footer";

/* calm colour: cream → black (the gallery and the films) → cream → burgundy (three ways, her story) → black footer */
export default function Home() {
  return (
    <>
      <Curtain />
      <main>
        <Hero />
        <Statement />
        <GalleryWall />
        <LiveCinema />
        <NewArrivals />
        <FilmBand />
        <Ticker />
        <Glow />
        <Formats />
        <ArtistBlock />
        <Teasers />
      </main>
      <Footer />
    </>
  );
}
