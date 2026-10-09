import type { Metadata, Viewport } from "next";
import "./globals.css";
import { serif, hand, sans, tamil } from "@/lib/fonts";
import SmoothScroll from "@/components/chrome/SmoothScroll";
import Nav from "@/components/chrome/Nav";
import CartDrawer from "@/components/chrome/CartDrawer";
import Cursor from "@/components/chrome/Cursor";
import Progress from "@/components/chrome/Progress";
import ClickSparkLayer from "@/components/rb/ClickSparkLayer";
import { BASE } from "@/lib/base";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  // An unofficial concept preview: keep it out of search results so it never competes with jyxdi.com
  robots: { index: false, follow: false },
  title: { default: "Jyxdi — Original paintings, prints & UV canvases", template: "%s · Jyxdi" },
  description: "Bold, colourful paintings by Jyxdi: myths, cosmic portraits and gods in streetwear. Hand-signed prints from $90, canvases from $450, UV canvases that glow in the dark. Ships worldwide.",
  openGraph: { title: "Jyxdi — a website concept", description: "A sketchbook-style redesign concept for Jyxdi's art store.", images: [{ url: `${BASE}/img/og.jpg`, width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", images: [`${BASE}/img/og.jpg`] },
  icons: { icon: `${BASE}/img/favicon.svg` },
};
export const viewport: Viewport = { themeColor: "#f3ecdf", viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${hand.variable} ${sans.variable} ${tamil.variable}`}>
      <body>
        <SmoothScroll />
        <Progress />
        <Nav />
        {children}
        <CartDrawer />
        <Cursor />
        <ClickSparkLayer sparkColor="#c63f28" sparkSize={9} sparkRadius={18} sparkCount={7} />
      </body>
    </html>
  );
}
