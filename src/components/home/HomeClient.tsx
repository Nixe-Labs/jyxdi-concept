"use client";
import { useEffect, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Intro from "./Intro";
import Hero from "./Hero";
import Ticker from "./Ticker";
import StudioWall from "./StudioWall";
import AfterDark from "./AfterDark";
import Polaroids from "./Polaroids";

/** Client-only parts of the home page; server-rendered sections are passed in as children slots. */
export default function HomeClient({ newArrivals, artist, formats, teasers }: { newArrivals: React.ReactNode; artist: React.ReactNode; formats: React.ReactNode; teasers: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  useEffect(() => { if (ready) ScrollTrigger.refresh(); }, [ready]);
  return (
    <>
      <Intro onReveal={() => setReady(true)} />
      <main>
        <Hero ready={ready} />
        <Ticker />
        {newArrivals}
        <StudioWall />
        {artist}
        <AfterDark />
        {formats}
        <Polaroids />
        {teasers}
      </main>
    </>
  );
}
