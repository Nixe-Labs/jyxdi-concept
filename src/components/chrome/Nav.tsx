"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import JxLogo from "@/components/logo/JxLogo";
import { roughLine } from "@/components/sketch/Marks";
import { useCart, cartCount } from "@/lib/cart";
import { useUI } from "./ui";
import { getLenis } from "./SmoothScroll";
import { LINKS } from "@/lib/links";


export default function Nav() {
  const pathname = usePathname();
  const lines = useCart((s) => s.lines);
  const setOpen = useCart((s) => s.setOpen);
  const { menu, setMenu } = useUI();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const lastY = useRef(0);
  const count = hydrated ? cartCount(lines) : 0;
  const active = (href: string) => pathname.startsWith(href.replace(/\/$/, ""));

  useEffect(() => setHydrated(true), []);
  useEffect(() => setMenu(false), [pathname, setMenu]);
  useEffect(() => {
    const onScroll = () => { const y = scrollY; setScrolled(y > 40); setHidden(y > lastY.current && y > 500); lastY.current = y; };
    onScroll(); addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    document.documentElement.style.overflow = menu ? "hidden" : "";
    const l = getLenis(); if (menu) l?.stop(); else l?.start();
  }, [menu]);

  return (
    <>
      <p className="announce"><span className="max-[899px]:hidden">Every piece is <b>hand-signed</b> with a certificate of authenticity · Surprise add-ons in every order · Ships worldwide</span><span className="min-[900px]:hidden"><b>Hand-signed</b> · Ships worldwide · Prints from $90</span></p>
      <header className={`nav ${scrolled ? "is-scrolled" : ""} ${hidden && !menu ? "is-hidden" : ""}`}>
        <Link className="nav__brand" href="/" aria-label="Jyxdi, home">
          <span className="nav__logo" data-nav-logo><JxLogo sw={2.2} /></span>
        </Link>
        <nav className="nav__links" aria-label="Primary">
          {LINKS.map((l, i) => (
            <Link key={l.href} href={l.href} className={active(l.href) ? "is-active" : ""}>
              {l.label}
              <svg className="mark" viewBox="0 0 100 9" preserveAspectRatio="none" aria-hidden><path d={roughLine(100, 9, "nav" + i, 1)} pathLength={1} /></svg>
            </Link>
          ))}
        </nav>
        <div className="nav__actions">
          <button className="bag" onClick={() => setOpen(true)} aria-label={`Open bag, ${count} item${count === 1 ? "" : "s"}`}>
            <span className="bag__label">Bag</span>
            <span className={`bag__count ${count ? "" : "is-zero"}`}>{count}</span>
          </button>
          <button className="burger" aria-expanded={menu} aria-controls="menu" aria-label={menu ? "Close menu" : "Open menu"} onClick={() => setMenu(!menu)}><span /><span /></button>
        </div>
      </header>
      <div className={`menu ${menu ? "is-open" : ""}`} id="menu" aria-hidden={!menu}>
        <nav className="menu__links" aria-label="Mobile">
          <Link href="/" tabIndex={menu ? 0 : -1}><em>01</em>Home</Link>
          {LINKS.map((l, i) => <Link key={l.href} href={l.href} tabIndex={menu ? 0 : -1}><em>{String(i + 2).padStart(2, "0")}</em>{l.label}</Link>)}
        </nav>
        <p className="note">prints from $90 · canvases from $450</p>
      </div>
    </>
  );
}
