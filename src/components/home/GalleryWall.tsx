"use client";
import Link from "next/link";
import { ViewTransition, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getLenis } from "@/components/chrome/SmoothScroll";
import Frame from "@/components/lux/Frame";
import { HANG } from "@/lib/wall";
import { bySlug, srcSet, smallest, CAT_LABEL, WORKS, type Work } from "@/lib/catalog";

gsap.registerPlugin(ScrollTrigger);

const ITEMS = HANG.map(([slug, h, drop, tone, mat]) => ({ w: bySlug(slug) as Work, h, drop, tone, mat }));
const still = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const frameOf = (el: Element) => el.querySelector<HTMLElement>(".lux-frame")!;

/** The gallery wall, in the black room: framed works hanging from a picture rail. On desktop the wall pins and you
    walk along it as you scroll; elsewhere you swipe. Hover lifts and swings a work; a click lifts it off its hook
    while the room falls away, and the frame glides into the work's own viewing room (a shared view transition). */
export default function GalleryWall() {
  const root = useRef<HTMLElement>(null), stage = useRef<HTMLDivElement>(null), track = useRef<HTMLUListElement>(null);
  const [hover, setHover] = useState(0);
  const [hovering, setHovering] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [swipe, setSwipe] = useState(false);
  const walk = useRef<ScrollTrigger | null>(null);

  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(min-width: 900px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
      const t = track.current!, s = stage.current!;
      const dist = () => Math.max(0, t.scrollWidth - s.clientWidth);
      const tw = gsap.to(t, { x: () => -dist(), ease: "none", scrollTrigger: { trigger: root.current, start: "top top", end: () => `+=${dist()}`, pin: true, scrub: 0.8, invalidateOnRefresh: true } });
      walk.current = tw.scrollTrigger ?? null;
      return () => { walk.current = null; tw.scrollTrigger?.kill(); tw.kill(); };
    });
    mm.add("(max-width: 899px), (hover: none), (pointer: coarse), (prefers-reduced-motion: reduce)", () => { setSwipe(true); return () => setSwipe(false); });
    return () => mm.revert();
  }, []);

  // swiping: the caption follows the work in the middle of the wall
  useEffect(() => {
    if (!swipe) return;
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) setHover(Number((e.target as HTMLElement).dataset.i)); }), { root: stage.current, rootMargin: "0px -49%" });
    track.current!.querySelectorAll("li").forEach((li) => io.observe(li));
    return () => io.disconnect();
  }, [swipe]);

  // keyboard: a work that takes focus comes to the middle of the wall (the walk scrolls to it, or the strip swipes to it)
  const reveal = (i: number, a: HTMLAnchorElement) => {
    setHover(i);
    if (!a.matches(":focus-visible")) return; // a click also focuses: the work is already in view
    const li = a.closest("li")!, s = walk.current;
    if (!s) { li.scrollIntoView({ inline: "center", block: "nearest", behavior: still() ? "auto" : "smooth" }); return; }
    const dist = track.current!.scrollWidth - stage.current!.clientWidth;
    const p = Math.min(1, Math.max(0, (li.offsetLeft + li.offsetWidth / 2 - stage.current!.clientWidth / 2) / dist));
    const y = s.start + p * (s.end - s.start);
    const l = getLenis(); if (l) l.scrollTo(y, { duration: 0.9 }); else scrollTo(0, y);
  };

  const spot = (e: React.PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  const enter = (i: number, e: React.PointerEvent<HTMLAnchorElement>) => {
    setHover(i); setHovering(true);
    if (e.pointerType !== "mouse" || still()) return;
    const r = e.currentTarget.getBoundingClientRect(), dir = e.clientX < r.left + r.width / 2 ? 1 : -1;
    gsap.fromTo(e.currentTarget, { rotation: dir * 2.6 }, { rotation: 0, duration: 1.8, ease: "elastic.out(1, 0.3)", overwrite: "auto" });
  };
  const tilt = (e: React.PointerEvent<HTMLAnchorElement>) => {
    if (e.pointerType !== "mouse" || still() || leaving) return;
    const r = e.currentTarget.getBoundingClientRect(), px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
    gsap.to(frameOf(e.currentTarget), { rotationY: px * 16, rotationX: -py * 12, scale: 1.07, duration: 0.6, ease: "power3.out", overwrite: "auto" });
  };
  const leave = (e: React.PointerEvent<HTMLAnchorElement>) => {
    if (leaving) return;
    setHovering(false);
    gsap.to(frameOf(e.currentTarget), { rotationY: 0, rotationX: 0, scale: 1, duration: 1.1, ease: "elastic.out(1, 0.5)", overwrite: "auto" });
  };
  // the chosen work squares up and lifts off the wall; the rest of the room falls away as the page changes
  const choose = (i: number, a: HTMLAnchorElement) => {
    setHover(i); setLeaving(true);
    gsap.killTweensOf([frameOf(a), a]);
    gsap.set(a, { rotation: 0 });
    gsap.set(frameOf(a), { rotationX: 0, rotationY: 0, scale: still() ? 1 : 1.06 });
  };
  const nudge = (dir: number) => stage.current!.scrollBy({ left: dir * stage.current!.clientWidth * 0.7, behavior: still() ? "auto" : "smooth" });

  const cur = ITEMS[hover].w;
  return (
    <section ref={root} className={`lx-wall ${swipe ? "is-swipe" : ""} ${hovering ? "is-hovering" : ""} ${leaving ? "is-leaving" : ""}`} data-mood="black" onPointerMove={spot} aria-labelledby="wall-title">
      <div className="lx-wall__head">
        <div>
          <p className="c-kicker">The collection · Framed and hung</p>
          <h2 id="wall-title" className="c-h2">Walk the <em>gallery.</em></h2>
        </div>
        <p className="lede">Eight favourites, framed and hung. Move along the wall, then step up to any work to see it in its own room, in every size.</p>
      </div>
      <div className="lx-wall__stage" ref={stage}>
        <ul className="lx-wall__track" ref={track}>
          {ITEMS.map(({ w, h, drop, tone, mat }, i) => (
            <li key={w.slug} data-i={i} className={`lx-wall__item ${hover === i ? "is-hover" : ""}`} style={{ ["--h" as string]: `${h}px`, ["--drop" as string]: `${drop}px`, ["--ar" as string]: w.ar }}>
              <Link href={`/shop/${w.slug}/`} transitionTypes={["art-open"]} className="lx-wall__piece" aria-label={`${w.t}: view the work`}
                onPointerEnter={(e) => enter(i, e)} onPointerMove={tilt} onPointerLeave={leave} onFocus={(e) => reveal(i, e.currentTarget)} onClick={(e) => choose(i, e.currentTarget)}>
                <svg className="lx-hanger" viewBox="0 0 100 60" preserveAspectRatio="none" aria-hidden><line x1="6" y1="60" x2="50" y2="0" /><line x1="94" y1="60" x2="50" y2="0" /></svg>
                <span className="lx-hook" aria-hidden />
                <ViewTransition name={`art-${w.slug}`} share={{ "art-open": "art-morph", default: "none" }} default="none">
                  <Frame tone={tone} mat={mat} src={smallest(w)} srcSet={srcSet(w)} sizes="(max-width: 899px) 50vw, 22vw" alt="">
                    <span className="lx-bar" aria-hidden />
                  </Frame>
                </ViewTransition>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="lx-wall__foot">
        <p className="lx-wall__caption" aria-live="polite"><b>{cur.t}</b>{CAT_LABEL[cur.c]} · <span className="only-fine">Click</span><span className="only-touch">Tap</span> to view</p>
        <div className="lx-wall__ctas">
          <div className="lx-wall__nav"><button aria-label="Previous works" onClick={() => nudge(-1)}>←</button><button aria-label="More works" onClick={() => nudge(1)}>→</button></div>
          <Link href="/shop/" className="btn btn--line"><span>Explore all {WORKS.length} works</span><i>→</i></Link>
        </div>
      </div>
    </section>
  );
}
