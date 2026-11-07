import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./lux.css";
import "./styles/invite-card.css";
import "./styles/shop-scene.css";
import { serif, sans, tamil } from "@/lib/fonts";
import SmoothScroll from "@/components/chrome/SmoothScroll";
import Nav from "@/components/chrome/Nav";
import CartDrawer from "@/components/chrome/CartDrawer";
import MoodScroll from "@/components/chrome/MoodScroll";
import { curtainScript } from "@/lib/curtain";
import { BASE } from "@/lib/base";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  // An unofficial concept preview: keep it out of search results so it never competes with jyxdi.com
  robots: { index: false, follow: false },
  title: { default: "Jyxdi — Original paintings, prints & UV canvases", template: "%s · Jyxdi" },
  description: "Bold, colourful paintings by Jyxdi: myths, cosmic portraits and gods in streetwear. Hand-signed prints from $90, canvases from $450, UV canvases that glow in the dark. Ships worldwide.",
  openGraph: { title: "Jyxdi — a website concept", description: "A gallery-style redesign concept for Jyxdi's art store and live painting.", images: [{ url: `${BASE}/img/og.jpg`, width: 1200, height: 630 }] },
  twitter: { card: "summary_large_image", images: [`${BASE}/img/og.jpg`] },
  icons: { icon: `${BASE}/img/favicon.svg` },
};
export const viewport: Viewport = { themeColor: "#221b1d", viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} ${tamil.variable}`} suppressHydrationWarning>
      <body>
        {/* before first paint: on the homepage (first visit this session), raise the opening curtain */}
        <script dangerouslySetInnerHTML={{ __html: curtainScript(BASE) }} />
        <SmoothScroll />
        <Nav />
        {children}
        {/* before first paint: the page starts in the mood of its first section */}
        <script dangerouslySetInnerHTML={{ __html: "try{var s=document.querySelector('[data-mood]');if(s)document.documentElement.setAttribute('data-mood',s.getAttribute('data-mood'))}catch(e){}" }} />
        <CartDrawer />
        <MoodScroll />
      </body>
    </html>
  );
}
