import "./styles/lives.css";
import Curtain from "@/components/home/Curtain";
import Hero from "@/components/home/Hero";
import Statement from "@/components/home/Statement";
import GalleryWall from "@/components/home/GalleryWall";
import LiveCinema from "@/components/lux/LiveCinema";
import Lives from "@/components/home/Lives";
import Teasers from "@/components/home/Teasers";
import PrintClub from "@/components/home/PrintClub";
import Footer from "@/components/chrome/Footer";

/* calm colour: cream → black (the gallery and the films) → burgundy (one painting's three lives, her story, a commission, the Print Club to come) → black footer */
export default function Home() {
  return (
    <>
      <Curtain />
      <main>
        <Hero />
        <Statement />
        <GalleryWall />
        <LiveCinema />
        <Lives />
        <Teasers />
        <PrintClub />
      </main>
      <Footer />
    </>
  );
}
