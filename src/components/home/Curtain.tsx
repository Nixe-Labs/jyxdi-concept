"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import JxLogo, { blinkLids } from "@/components/logo/JxLogo";
import { getLenis } from "@/components/chrome/SmoothScroll";
import { paintReveal } from "./paintReveal";
import { InviteScene, ShopScene } from "./CurtainScenes";

const WAIT = 8; // seconds before the homepage opens by itself (held while the visitor moves around or tabs through)
const WORLDS = [
  { key: "invite", href: "/live-painting/", kicker: "Weddings · Now booking 2027", title: "Book live painting", go: "Check your date" },
  { key: "shop", href: "/shop/", kicker: "Prints & canvases", title: "Shop the collection", go: "Browse the works" },
] as const;
type Go = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => void;
let runs = 0; // which run of the opening is the current one (see the cleanup)
let decided = false; // the visitor entered or chose a world in this page load: a homepage mounted again must not replay it

/** The opening, once per visit. Her mark draws itself in gold on burgundy (CSS, from the first paint). Then the brush on
    its right lifts out of the mark and paints the curtain away in calligraphic, gold-edged sweeps (paintReveal), revealing
    her two worlds side by side: a wedding invitation (book live painting) and a boutique bag (shop the collection).
    Choosing one opens it to the whole screen and goes there; "enter the site", scrolling, Esc, or 8 quiet seconds
    lift the curtain onto the homepage. */
export default function Curtain() {
  const root = useRef<HTMLDivElement>(null);
  const act = useRef<{ go?: Go; enter?: () => void }>({});
  const router = useRouter();
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    // it plays on a full load of the homepage only: coming back to the homepage inside the site (Next keeps a page you
    // leave alive, hidden, and runs this again on Back) finds it already released, as does code that arrived after 7s
    // (Back pressed while the chosen page was on its way can mount the homepage afresh: by then the visitor has decided)
    if (!html.classList.contains("is-curtain") || decided) {
      document.querySelectorAll("header.nav, main, footer").forEach((p) => p.removeAttribute("inert"));
      html.classList.remove("is-curtain", "curtain-js", "from-curtain"); getLenis()?.start();
      setGone(true); return;
    }
    const run = ++runs;
    const el = root.current!, $ = <T extends Element = HTMLElement>(s: string) => el.querySelector<T>(s)!;
    const brand = $(".lx-curtain__brand"), worlds = $(".lx-worlds"), canvas = $<HTMLCanvasElement>(".lx-paint");
    html.classList.add("curtain-js"); // scripts are here: drop the CSS failsafe that would clear the curtain at 7s
    getLenis()?.stop();
    const page = document.querySelectorAll("header.nav, main, footer");
    page.forEach((p) => p.setAttribute("inert", ""));
    let stage: "draw" | "reveal" | "worlds" | "out" = "draw", live = true, released = false, openedAt = 0, wheelAt = 0;
    let paint: ReturnType<typeof paintReveal> | null = null, words: gsap.core.Tween | null = null, still: ReturnType<typeof setTimeout>, stuck: ReturnType<typeof setTimeout>;
    const home = location.pathname;
    const hold = new Set<string>();
    const timer = gsap.fromTo($(".lx-curtain__timer"), { scaleX: 0 }, { scaleX: 1, duration: WAIT, ease: "none", paused: true, onComplete: () => enter() });
    // the countdown runs only once the worlds are up, while nobody is exploring them, and while the tab is in view
    const sync = () => (stage === "worlds" && el.classList.contains("is-ready") && !hold.size && !document.hidden ? timer.resume() : timer.pause());
    // a trackpad flick that entered the site keeps scrolling for a moment: wake the smooth scroll once it's still
    const startWhenStill = () => (performance.now() - wheelAt < 250 ? setTimeout(startWhenStill, 100) : getLenis()?.start());
    const release = () => { released = true; page.forEach((p) => p.removeAttribute("inert")); el.style.display = "grid"; html.classList.remove("is-curtain", "curtain-js"); startWhenStill(); };

    // her mark draws in CSS from the first paint; once it has, the eyes blink, then the brush lifts out
    const drawing = brand.getAnimations({ subtree: true });
    const finish = () => drawing.forEach((a) => { try { a.finish(); } catch {} });
    const letters = brand.querySelectorAll(".lg-letter");
    letters[letters.length - 1]?.getAnimations()[0]?.finished.then(() => { if (live && stage === "draw") blinkLids([...brand.querySelectorAll(".lg-eye__lid")]); }, () => {});
    Promise.all(drawing.map((a) => a.finished)).then(() => reveal(), () => {});

    // calls go once two frames in a row have come quickly (or at max ms), never before min ms
    const settle = (go: () => void, min: number, max: number) => {
      const t0 = performance.now(); let prev = t0, calm = 0;
      const tick = (t: number) => {
        if (!live) return;
        calm = t - prev < 24 ? calm + 1 : 0; prev = t;
        if ((calm >= 2 && t - t0 >= min) || t - t0 >= max) go(); else requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const reveal = () => {
      if (!live || stage !== "draw") return;
      stage = "reveal"; finish();
      const mark = brand.querySelector("svg.jx-logo")!.getBoundingClientRect();
      paint = paintReveal({ canvas, width: innerWidth, height: innerHeight, dpr: devicePixelRatio, seed: 7, logo: { x: mark.left, y: mark.top, w: mark.width } });
      paint.seek(0); // the curtain and the brush, exactly where the mark's own brush is
      el.classList.add("is-reveal"); // ...so in the same frame the page curtain steps aside and that brush leaves the mark
      // a browser's first frames of the canvas and of the scenes under it can be slow (it is setting up the graphics):
      // let them pass while nothing moves, then lift the brush once frames come smoothly (a breath of 150 to 450 ms)
      settle(start, 150, 450);
    };
    const start = () => {
      if (!live || stage !== "reveal" || !paint) return;
      gsap.to(brand, { opacity: 0, duration: 0.42, ease: "power2.out" });
      words = gsap.delayedCall(Math.max(0, paint.duration - 450) / 1000, ready); // the words rise as the last sweep lands
      paint.play().then(() => { if (live) painted(); }, () => {});
    };
    const painted = () => { el.classList.add("is-done"); paint?.stop(); paint = null; canvas.width = canvas.height = 0; }; // free its full-screen bitmaps
    const skip = () => { if (stage !== "reveal" || !paint) return; words?.kill(); painted(); ready(); };

    const ready = () => {
      if (!live || stage !== "reveal") return;
      stage = "worlds"; openedAt = performance.now();
      el.classList.add("is-open");
      gsap.fromTo(el.querySelectorAll(".lx-world__text > *"), { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", stagger: 0.06, clearProps: "transform,opacity" });
      gsap.fromTo(el.querySelectorAll(".lx-world__seam"), { scale: 0 }, { scale: 1, duration: 1.1, ease: "power3.inOut" });
      gsap.fromTo(el.querySelectorAll(".lx-worlds__enter"), { opacity: 0 }, { opacity: 1, duration: 0.5, delay: 0.15, clearProps: "opacity",
        onComplete: () => { if (!live) return; el.classList.add("is-ready"); sync(); } });
      if (!el.contains(document.activeElement)) el.focus({ preventScroll: true }); // a keyboard user already on a world stays there
    };

    const enter = () => {
      if (!live || stage === "out") return;
      const opening = stage === "reveal";
      paint?.stop(); words?.kill();
      stage = "out"; decided = true; timer.pause(); finish();
      gsap.timeline({ onComplete: () => setGone(true) })
        .to(el.querySelectorAll(`.lx-curtain__brand, .lx-paint, .lx-world__text, .lx-world__seam, .lx-worlds__enter${opening ? ", .lx-worlds" : ""}`), { opacity: 0, duration: 0.45, ease: "power2.in", overwrite: "auto" })
        .add(() => { el.classList.add("is-lifting"); release(); }) // the hero's entrance starts under the rising curtain
        .to(el, { yPercent: -100, duration: 1.3, ease: "power3.inOut" }, "-=.1");
    };

    // into a world: the words and the other world step back at once (CSS: opacity and transform only), then the page changes
    // and the chosen object (the invitation, or the boutique's framed print) glides into its place on the next page while
    // the rest of the opening dissolves. Those are shared view transitions, run by the compositor, so they stay smooth while
    // the next page is being built; nothing is laid out or redrawn on the way.
    const go: Go = (e, href) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // a new tab or window: the browser's job
      e.preventDefault();
      if (!live || stage === "out") return;
      // a click while it paints (or a second click of a double-click) means "skip ahead", never "choose for me";
      // a keyboard Enter (a click with detail 0) on a world chooses at once
      if (stage !== "worlds" || (e.detail > 0 && performance.now() - openedAt < 600)) { if (stage === "draw") reveal(); else skip(); return; }
      stage = "out"; decided = true; timer.pause();
      e.currentTarget.classList.add("is-chosen");
      el.classList.add("is-walking");
      html.classList.add("from-curtain"); setTimeout(() => html.classList.remove("from-curtain"), 2400); // the hand-off's own timing; the nav arrives with the page
      // one frame for that step-back to start on the compositor, then the page change
      requestAnimationFrame(() => setTimeout(() => {
        if (!live) return;
        router.push(href, { transitionTypes: [href === "/live-painting/" ? "invite-open" : "shop-open"] });
        stuck = setTimeout(giveBack, 4000); // the next page never took over (offline, a failed load): give the homepage back
      }, 0));
    };
    act.current = { go, enter };

    const onKey = (e: KeyboardEvent) => {
      if (stage === "out" || e.metaKey || e.ctrlKey || e.altKey || /^F\d+$/.test(e.key)) return; // browser shortcuts and F-keys pass through
      if (e.key === "Escape") { e.preventDefault(); return enter(); }
      if (e.key === "Shift" || e.key === "Tab") { if (stage === "draw") reveal(); return; }
      if (stage === "draw") { e.preventDefault(); return reveal(); } // any key skips ahead
      if (stage === "reveal") { e.preventDefault(); return skip(); }
      const onControl = (e.target as Element | null)?.closest?.("a, button");
      if (["ArrowDown", "PageDown", "End"].includes(e.key) || (e.key === " " && !onControl)) { e.preventDefault(); enter(); }
    };
    const onClick = (e: MouseEvent) => { if ((e.target as Element).closest("a, button")) return; if (stage === "draw") reveal(); else skip(); };
    const onWheel = (e: WheelEvent) => { wheelAt = performance.now(); if (stage !== "out" && Math.abs(e.deltaY) > 2) enter(); };
    let y0 = -1;
    const onTouchStart = (e: TouchEvent) => { y0 = e.touches[0]?.clientY ?? -1; };
    const onTouchMove = (e: TouchEvent) => { if (y0 >= 0 && y0 - (e.touches[0]?.clientY ?? y0) > 48) { y0 = -1; enter(); } }; // a swipe up
    const onMove = () => { hold.add("p"); sync(); clearTimeout(still); still = setTimeout(() => { hold.delete("p"); sync(); }, 1500); };
    // keyboard focus on a world holds the countdown (a mouse click that focuses a link, e.g. Cmd+click for a new tab, doesn't)
    const onFocusIn = (e: FocusEvent) => { if ((e.target as Element).matches(":focus-visible")) hold.add("f"); else hold.delete("f"); sync(); };
    const onFocusOut = (e: FocusEvent) => { if (!worlds.contains(e.relatedTarget as Node)) { hold.delete("f"); sync(); } };
    const onResize = () => skip(); // the strokes were laid out for the old size: finish them
    // Back pressed while the chosen page was still on its way: the homepage is showing again, so the curtain steps aside
    // (once the next page has taken over, this page is hidden and these listeners are gone)
    const giveBack = () => { if (live && stage === "out" && location.pathname === home) { release(); setGone(true); } };
    const onPop = () => setTimeout(giveBack, 0);
    const ons: [EventTarget, string, EventListener][] = [
      [window, "keydown", onKey as EventListener], [el, "click", onClick as EventListener], [window, "wheel", onWheel as EventListener],
      [el, "touchstart", onTouchStart as EventListener], [el, "touchmove", onTouchMove as EventListener], [document, "visibilitychange", sync],
      [worlds, "pointermove", onMove], [worlds, "focusin", onFocusIn as EventListener], [worlds, "focusout", onFocusOut as EventListener], [window, "resize", onResize], [window, "popstate", onPop],
    ];
    ons.forEach(([t, n, f]) => t.addEventListener(n, f, { passive: n !== "keydown" }));
    return () => {
      live = false; timer.kill(); paint?.stop(); words?.kill(); clearTimeout(still); clearTimeout(stuck); act.current = {};
      ons.forEach(([t, n, f]) => t.removeEventListener(n, f));
      // the page let go of the curtain (unmounted, or hidden by Next when the visitor went elsewhere): release the page,
      // unless this was React dev mode's instant remount, which has already started the next run
      setTimeout(() => {
        if (runs !== run) return;
        document.querySelectorAll("header.nav, main, footer").forEach((p) => p.removeAttribute("inert"));
        html.classList.remove("is-curtain", "curtain-js");
        if (!released) getLenis()?.start(); // (after a lift, startWhenStill already has it)
      }, 0);
    };
  }, [router]);

  if (gone) return null;
  return (
    <div ref={root} className="lx-curtain mood-burgundy" role="dialog" aria-modal="true" aria-label="Welcome to Jyxdi" tabIndex={-1}>
      <nav className="lx-worlds" aria-label="Where would you like to begin?">
        <div className="lx-worlds__inner">
          {WORLDS.map((d) => (
            <Link key={d.key} href={d.href} className={`lx-world lx-world--${d.key}`} onClick={(e) => act.current.go?.(e, d.href)}>
              <div className={`lx-scene lx-scene--${d.key}`} aria-hidden>{d.key === "invite" ? <InviteScene /> : <ShopScene />}</div>
              <span className="lx-world__text">
                <span className="lx-world__kicker">{d.kicker}</span>
                <span className="lx-world__title">{d.title}</span>
                <span className="lx-world__go">{d.go} <i aria-hidden>→</i></span>
              </span>
              {d.key === "invite" && <span className="lx-world__seam" aria-hidden />}
            </Link>
          ))}
        </div>
        <button type="button" className="lx-worlds__enter" onClick={() => act.current.enter?.()}>
          <span>or enter the site <i aria-hidden>↓</i></span>
          <span className="lx-curtain__timer" aria-hidden />
        </button>
      </nav>
      <canvas className="lx-paint" aria-hidden />
      <div className="lx-curtain__brand">
        <div className="lx-curtain__mark"><JxLogo sw={1.4} alive={false} /></div>
        <p className="lx-curtain__name" aria-hidden>JYXDI</p>
        <p className="lx-curtain__line">Fine art · Live painting</p>
      </div>
    </div>
  );
}
