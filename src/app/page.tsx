import "./styles/uvroom.css";
import Curtain from "@/components/home/Curtain";
import Hero from "@/components/home/Hero";
import Statement from "@/components/home/Statement";
import Featured from "@/components/home/Featured";
import Ways from "@/components/home/Ways";
import LiveCinema from "@/components/lux/LiveCinema";
import Reactions from "@/components/home/Reactions";
import Glow from "@/components/home/Glow";
import GalleryWall from "@/components/home/GalleryWall";
import Artist from "@/components/home/Artist";
import Teasers from "@/components/home/Teasers";
import PrintClub from "@/components/home/PrintClub";
import Closing from "@/components/home/Closing";
import Footer from "@/components/chrome/Footer";

/* Akka's order: the hero, featured artwork (and the three formats), live wedding painting, the UV glow, the gallery, the
   artist, [press & collaborations], commissions, [testimonials], then shop or book. The two in brackets wait on her photos,
   links and quotes. Calm colour: cream → black (the weddings, the glow, the gallery) → burgundy → black footer */
export default function Home() {
  return (
    <>
      <Curtain />
      <main>
        <Hero />
        <Statement />
        <Featured />
        <Ways />
        <LiveCinema />
        <Reactions />
        <Glow />
        <GalleryWall />
        <Artist />
        <Teasers />
        <PrintClub />
        <Closing />
      </main>
      <Footer />
    </>
  );
}
