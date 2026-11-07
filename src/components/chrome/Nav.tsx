"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import JxLogo from "@/components/logo/JxLogo";
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
  const burger = useRef<HTMLButtonElement>(null);
  const close = () => setMenu(false);
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
    if (!menu) return;
    // the page under the menu is out of reach (Tab stays in the nav and menu); Escape closes it
    const page = document.querySelectorAll("main, footer");
    page.forEach((el) => el.setAttribute("inert", ""));
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setMenu(false); burger.current?.focus(); } };
    addEventListener("keydown", onKey);
    return () => { page.forEach((el) => el.removeAttribute("inert")); removeEventListener("keydown", onKey); };
  }, [menu, setMenu]);

  return (
    <>
      <header className={`nav ${scrolled ? "is-scrolled" : ""} ${hidden && !menu ? "is-hidden" : ""} ${menu ? "is-menu" : ""}`} style={{ viewTransitionName: "site-header" }}>
        <Link className="nav__brand" href="/" aria-label="Jyxdi, home">
          <span className="nav__logo" data-nav-logo><JxLogo sw={2.2} /></span>
        </Link>
        <nav className="nav__links" aria-label="Primary">
          {LINKS.map((l) => <Link key={l.href} href={l.href} className={active(l.href) ? "is-active" : ""} aria-current={active(l.href) ? "page" : undefined}>{l.label}</Link>)}
        </nav>
        <div className="nav__actions">
          <button className="bag" onClick={() => { close(); setOpen(true); }} aria-label={`Open bag, ${count} item${count === 1 ? "" : "s"}`}>
            <span className="bag__label">Bag</span>
            <span className={`bag__count ${count ? "" : "is-zero"}`}>{count}</span>
          </button>
          <button ref={burger} className="burger" aria-expanded={menu} aria-controls="menu" aria-label={menu ? "Close menu" : "Open menu"} onClick={() => setMenu(!menu)}><span /><span /></button>
        </div>
      </header>
      <div className={`menu ${menu ? "is-open" : ""}`} id="menu" aria-hidden={!menu}>
        <nav className="menu__links" aria-label="Mobile">
          <Link href="/" tabIndex={menu ? 0 : -1} onClick={close}><em>01</em>Home<small>Start here</small></Link>
          {LINKS.map((l, i) => <Link key={l.href} href={l.href} tabIndex={menu ? 0 : -1} onClick={close} aria-current={active(l.href) ? "page" : undefined}><em>{String(i + 2).padStart(2, "0")}</em>{l.label}<small>{l.desc}</small></Link>)}
        </nav>
        <p className="c-kicker">Art prints from $90 · Canvases from $450</p>
      </div>
    </>
  );
}
