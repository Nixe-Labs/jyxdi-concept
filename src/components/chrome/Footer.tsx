import Link from "next/link";
import JxLogo from "@/components/logo/JxLogo";
import { LINKS } from "@/lib/links";

const PAY = ["Visa", "Mastercard", "Amex", "PayPal", "Shop Pay", "Apple Pay", "Google Pay"];

export default function Footer() {
  return (
    <footer className="footer" data-dark>
      <div className="footer__grid">
        <div>
          <div className="footer__logo" aria-hidden><JxLogo sw={1.3} /></div>
          <p className="footer__sig">thank you for looking ✎</p>
          <p className="m-0 max-w-[36ch] text-[14px] text-[rgba(243,236,223,.65)]">Original paintings, prints and UV-reactive canvases by Jyxdi. Painter, educator and creator of Spirit Gates.</p>
        </div>
        <div>
          <h4>Explore</h4>
          <ul><li><Link href="/">Home</Link></li>{LINKS.map((l) => <li key={l.href}><Link href={l.href}>{l.label}</Link></li>)}</ul>
        </div>
        <div>
          <h4>Shop</h4>
          <ul>
            <li><Link href="/shop/">All works</Link></li>
            <li><Link href="/shop/?c=Goddess">Goddesses</Link></li>
            <li><Link href="/shop/?c=Cosmos">Cosmos</Link></li>
            <li><Link href="/spirit-gates/">Spirit Gates manga</Link></li>
          </ul>
        </div>
        <div>
          <h4>Help</h4>
          <ul>
            <li><Link href="/faq/#formats">Poster, canvas or UV?</Link></li>
            <li><Link href="/faq/#shipping">Shipping</Link></li>
            <li><a href="https://jyxdi.com/pages/contact" target="_blank" rel="noopener">Contact</a></li>
            <li><a href="https://jyxdi.com/account/login" target="_blank" rel="noopener">Your account</a></li>
          </ul>
        </div>
      </div>
      <div className="footer__fine">
        <span>Unofficial concept preview, not affiliated with or operated by Jyxdi · Artwork © Jyxdi · Checkout links go to jyxdi.com</span>
        <span>Secure checkout on Shopify · {PAY.join(" · ")}</span>
      </div>
    </footer>
  );
}
