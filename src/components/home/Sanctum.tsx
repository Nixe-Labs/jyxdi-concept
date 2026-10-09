"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import DomeGallery from "@/components/rb/DomeGallery";
import { WORKS, largest } from "@/lib/catalog";

const IMAGES = WORKS.map((w) => ({ src: largest(w), alt: w.t }));

/** All 36 works on the inside of a dome you can spin and tap. */
export default function Sanctum({ compact = false }: { compact?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [touch, setTouch] = useState(false);
  useEffect(() => {
    setTouch(matchMedia("(hover: none)").matches);
    const io = new IntersectionObserver(([e]) => setNear(e.isIntersecting), { rootMargin: "300px 0px" });
    io.observe(ref.current!); return () => io.disconnect();
  }, []);
  const dome = near && (
    <DomeGallery images={IMAGES} fit={touch ? 0.9 : 0.62} minRadius={touch ? 380 : 620} segments={touch ? 26 : 34} grayscale={false}
      overlayBlurColor="#f3ecdf" imageBorderRadius="14px" openedImageBorderRadius="10px"
      openedImageWidth="min(78vw, 420px)" openedImageHeight="min(97vw, 525px)"
      maxVerticalRotationDeg={touch ? 0 : 6} dragDampening={1.6} touchAction={touch ? "pan-y" : "none"} />
  );
  if (compact) return <div className="dome-wrap" ref={ref} data-cursor-hide>{dome}</div>;
  return (
    <section className="sanctum" id="sanctum" ref={ref}>
      <div className="absolute inset-0" data-cursor-hide>{dome}</div>
      <div className="sanctum__head">
        <p className="chapter"><span>Chapter V</span>The Sanctum</p>
        <h2>Step inside. <em className="italic">Every work, all around you.</em></h2>
      </div>
      <div className="sanctum__foot">
        <p className="sanctum__hint">{touch ? "Swipe sideways to turn · tap to look closer" : "Drag to turn · click to look closer"}</p>
        <Link href="/shop" className="btn btn--gold"><span>Shop all {WORKS.length} works</span><i>→</i></Link>
      </div>
    </section>
  );
}
