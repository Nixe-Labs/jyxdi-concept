import type { Metadata } from "next";
import { Suspense } from "react";
import ShopClient from "@/components/shop/ShopClient";
import Footer from "@/components/chrome/Footer";

export const metadata: Metadata = {
  title: "Shop",
  description: "Shop original paintings by Jyxdi: hand-signed posters from $90, canvases from $450 and UV-reactive canvases that glow in the dark. Ships worldwide.",
};

export default function ShopPage() {
  return (
    <>
      <main><Suspense><ShopClient /></Suspense></main>
      <Footer />
    </>
  );
}
