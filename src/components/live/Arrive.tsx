"use client";
import { useEffect } from "react";
import { scrollToId } from "@/components/chrome/SmoothScroll";

/** Arriving at /live-painting/#inquire (the homepage's "Check your date"): the browser jumps to the form before the
    films' pin adds its scroll room above it, so land on it again once that room exists (after SmoothScroll's 300ms refresh). */
export default function Arrive() {
  useEffect(() => {
    const id = decodeURIComponent(location.hash.slice(1));
    if (!id) return;
    const t = setTimeout(() => scrollToId(id, true), 450);
    return () => clearTimeout(t);
  }, []);
  return null;
}
