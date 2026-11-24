"use client";
import { useEffect } from "react";
import { scrollToId } from "@/components/chrome/SmoothScroll";

/** Arriving at a #part of a page (the homepage's /live-painting/#inquire and /shop/#formats): the browser jumps there before
    a pin adds its scroll room above it, so land on it again once that room exists (after SmoothScroll's 300ms refresh).
    Then the hash goes (Next keeps its state on the entry), so Back to this page returns to where the visitor was, not to it. */
export default function Arrive() {
  useEffect(() => {
    const id = decodeURIComponent(location.hash.slice(1));
    if (!id) return;
    const t = setTimeout(() => { scrollToId(id, true); history.replaceState(null, "", location.pathname + location.search); }, 450);
    return () => clearTimeout(t);
  }, []);
  return null;
}
