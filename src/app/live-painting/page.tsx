import type { Metadata } from "next";
import "../styles/live.css";
import "../styles/live-hero.css";
import LiveHero from "@/components/live/LiveHero";
import Why from "@/components/live/Why";
import How from "@/components/live/How";
import Reels from "@/components/live/Reels";
import Inquiry from "@/components/live/Inquiry";
import Arrive from "@/components/live/Arrive";
import Footer from "@/components/chrome/Footer";

export const metadata: Metadata = {
  title: "Live Painting",
  description: "Jyxdi is an international wedding live painter. She paints your wedding or event as it happens, in front of your guests, and you keep the original painting. Check your date.",
};

export default function LivePaintingPage() {
  return (
    <>
      {/* the page moves through the palette: black (the invitation opening onto the films) → cream (a canvas paints itself) → burgundy (how it works)
          → black (more films) → cream (the inquiry) → the black footer */}
      <main className="lp">
        <LiveHero />
        <Why />
        <How />
        <Reels />
        <Inquiry />
        <Arrive />
      </main>
      <Footer />
    </>
  );
}
