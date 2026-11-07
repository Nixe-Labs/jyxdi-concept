import Link from "next/link";
import { LINKS } from "@/lib/links";

const PAY = ["Visa", "Mastercard", "Amex", "PayPal", "Shop Pay", "Apple Pay", "Google Pay"];

export default function Footer() {
  return (
    <footer className="footer mood-black" data-mood="black">
      <div className="footer__grid">
        <div>
          <p className="c-kicker">Thank you for looking</p>
          <p className="m-0 max-w-[36ch] text-[14px] text-graphite">Original paintings, prints and UV-reactive canvases by Jyxdi. Painter, educator and creator of Spirit Gates.</p>
          <p className="footer__contact">Live painting, PR and inquiries:<br /><a href="mailto:artbyjyxdi@gmail.com">artbyjyxdi@gmail.com</a><br /><a href="https://www.instagram.com/jyxdi/" target="_blank" rel="noopener">@jyxdi on Instagram ↗</a></p>
        </div>
        <div>
          <h2 className="footer__h">Explore</h2>
          <ul><li><Link href="/">Home</Link></li>{LINKS.map((l) => <li key={l.href}><Link href={l.href}>{l.label}</Link></li>)}</ul>
        </div>
        <div>
          <h2 className="footer__h">Shop</h2>
          <ul>
            <li><Link href="/shop/">All works</Link></li>
            <li><Link href="/shop/?c=Goddess">Goddesses</Link></li>
            <li><Link href="/shop/?c=Cosmos">Cosmos</Link></li>
            <li><Link href="/spirit-gates/">Spirit Gates manga</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="footer__h">Help</h2>
          <ul>
            <li><Link href="/faq/#formats">Poster, canvas or UV?</Link></li>
            <li><Link href="/faq/#shipping">Shipping</Link></li>
            <li><a href="https://jyxdi.com/pages/contact" target="_blank" rel="noopener">Contact</a></li>
            <li><a href="https://jyxdi.com/account/login" target="_blank" rel="noopener">Your account</a></li>
          </ul>
        </div>
      </div>
      <p className="footer__word" aria-hidden>Jyxdi</p>
      <div className="footer__fine">
        <span>Unofficial concept preview, not affiliated with or operated by Jyxdi · Artwork © Jyxdi · Checkout links go to jyxdi.com</span>
        <span>Secure checkout on Shopify · {PAY.join(" · ")}</span>
      </div>
    </footer>
  );
}
