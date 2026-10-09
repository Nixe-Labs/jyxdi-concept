"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useCart, cartCount, cartTotal } from "@/lib/cart";
import { checkoutUrl, money } from "@/lib/catalog";
import { getLenis } from "./SmoothScroll";
import JxLogo from "@/components/logo/JxLogo";

export default function CartDrawer() {
  const { lines, open, setOpen, setQty, remove } = useCart();
  const [hydrated, setHydrated] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => setHydrated(true), []);
  useEffect(() => {
    const l = getLenis();
    if (open) { l?.stop(); document.documentElement.style.overflow = "hidden"; setTimeout(() => closeRef.current?.focus(), 60); }
    else { l?.start(); document.documentElement.style.overflow = ""; }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    if (open) addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  const items = hydrated ? lines : [];
  const total = cartTotal(items);
  return (
    <div className={`drawer ${open ? "is-open" : ""}`} role="dialog" aria-modal="true" aria-label="Your bag" aria-hidden={!open}>
      <div className="drawer__backdrop" onClick={() => setOpen(false)} />
      <aside className="drawer__panel">
        <div className="drawer__head">
          <h2>Your bag <span className="note align-middle">{cartCount(items)} item{cartCount(items) === 1 ? "" : "s"}</span></h2>
          <button ref={closeRef} className="grid h-11 w-11 place-items-center border-[1.5px] border-ink" onClick={() => setOpen(false)} aria-label="Close cart">✕</button>
        </div>
        <div className="drawer__lines" data-lenis-prevent>
          {items.length === 0 ? (
            <div className="drawer__empty">
              <JxLogo />
              <p className="note m-0 !text-[30px]">nothing in here yet…</p>
              <Link href="/shop" className="btn btn--ink" onClick={() => setOpen(false)}>Browse the shop</Link>
            </div>
          ) : items.map((l) => (
            <div className="cline" key={l.variantId}>
              <img src={l.image} alt="" loading="lazy" />
              <div>
                <Link href={l.slug === "spirit-gates-vol-1" ? "/spirit-gates/" : `/shop/${l.slug}/`} className="cline__title block" onClick={() => setOpen(false)}>{l.title}</Link>
                <div className="cline__opt">{l.option}</div>
                <div className="qty" aria-label="Quantity">
                  <button onClick={() => setQty(l.variantId, l.qty - 1)} aria-label="Decrease quantity">−</button>
                  <span aria-live="polite">{l.qty}</span>
                  <button onClick={() => setQty(l.variantId, l.qty + 1)} aria-label="Increase quantity">+</button>
                </div>
              </div>
              <div>
                <div className="cline__price">${money(l.price * l.qty)}</div>
                <button className="cline__remove" onClick={() => remove(l.variantId)}>Remove</button>
              </div>
            </div>
          ))}
        </div>
        {items.length > 0 && (
          <div className="drawer__foot">
            <div className="drawer__total"><span className="text-[11px] font-bold uppercase tracking-[.2em] text-graphite">Subtotal</span><b>${money(total)} <small className="font-sans text-[11px] tracking-[.14em] text-pencil">CAD</small></b></div>
            <a className="btn btn--ink btn--lg btn--block" href={checkoutUrl(items)} target="_blank" rel="noopener"><span>Checkout securely</span><i>→</i></a>
            <p className="drawer__fine">You&apos;ll pay on Jyxdi&apos;s own Shopify checkout (Shop Pay, Apple Pay, Google Pay, PayPal or card). Shipping and taxes are calculated there. Every order includes a hand-signed certificate of authenticity.</p>
          </div>
        )}
      </aside>
    </div>
  );
}
