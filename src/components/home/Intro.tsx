"use client";
/* The cover: the logo draws itself on a dark sketchbook cover, then the cover opens onto paper.
   the name writes in. Then the black opens like an iris from the third eye and
   the mark flies into the nav. */
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import JxLogo, { blinkLids, type JxLogoHandle } from "@/components/logo/JxLogo";
import { getLenis } from "@/components/chrome/SmoothScroll";

type Mode = "full" | "short" | "skip";

export default function Intro({ onReveal }: { onReveal: () => void }) {
  const [mode, setMode] = useState<Mode | null>(null);
  const [gone, setGone] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const logo = useRef<JxLogoHandle>(null);
  const api = useRef<{ enter: () => void; skip: () => void }>({ enter: () => {}, skip: () => {} });

  useEffect(() => {
    let seen = false;
    try { seen = sessionStorage.getItem("jx-seen") === "1"; } catch {}
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    setMode(location.hash || reduced ? "skip" : seen ? "short" : "full");
  }, []);

  useEffect(() => {
    if (!mode) return;
    if (mode === "skip") { setGone(true); onReveal(); return; }
    document.body.classList.add("is-loading");
    getLenis()?.stop();
    const el = root.current!, svg = logo.current!.svg!;
    const q = (s: string) => [...svg.querySelectorAll(s)];
    const lids = q(".lg-eye__lid");
    const pigment = startPigment(el.querySelector("canvas")!);
    let entered = false, auto: ReturnType<typeof setTimeout>;

    gsap.set(q(".lg-stroke"), { strokeDasharray: "1 1.1", strokeDashoffset: 1.05 }); // gap > 1: round caps can't leak dots
    gsap.set(q(".lg-pupil, .lg-glint"), { opacity: 0 });
    gsap.set(lids, { scaleY: 0.06, transformOrigin: "50% 55%" });
    svg.style.setProperty("--sw", ".95");

    const tl = gsap.timeline({ delay: 0.2 });
    tl.to(q(".lg-liner, .lg-lower"), { strokeDashoffset: 0, duration: 1.1, ease: "power2.inOut", stagger: 0.08 })
      .to(lids, { scaleY: 1, duration: 0.9, ease: "expo.out" }, "-=.35")
      .to(q(".lg-iris__ring"), { strokeDashoffset: 0, duration: 0.8 }, "<")
      .to(q(".lg-pupil, .lg-glint"), { opacity: 1, duration: 0.5 }, "<.2")
      .add(() => { lids.forEach((l) => { l.removeAttribute("transform"); (l as SVGGElement).style.transformOrigin = "80.5px 44.2px"; }); blinkLids(lids); }, "+=.15")
      .to(q(".lg-bristle, .lg-flick, .lg-ferrule"), { strokeDashoffset: 0, duration: 0.9, ease: "power2.inOut", stagger: 0.05 }, "-=.25")
      .to(pigment.state, { a: 1, duration: 2.2, ease: "power1.inOut" }, "<")
      .to(el.querySelector("canvas"), { opacity: 1, duration: 1.6 }, "<")
      .to(q(".lg-brush--l .lg-handle"), { strokeDashoffset: 0, duration: 1.15, ease: "power3.inOut", stagger: 0.06 }, "-=.35")
      .to(q(".lg-brush--r .lg-handle"), { strokeDashoffset: 0, duration: 1.15, ease: "power3.inOut", stagger: 0.06 }, "<.18")
      .to(q(".lg-letter"), { strokeDashoffset: 0, duration: 0.7, ease: "power2.out", stagger: 0.09 }, "-=.6")
      .to(q(".lg-third"), { opacity: 1, duration: 0.3, ease: "none" }, "-=.2")
      .fromTo(q(".lg-third"), { scale: 0, transformOrigin: "50% 50%" }, { scale: 1, duration: 0.8, ease: "elastic.out(1,.5)" }, "<")
      .to(q(".lg-bloom"), { opacity: 1, duration: 1.2 }, "<")
      .to(el.querySelector(".cover__title"), { opacity: 1, y: 0, duration: 0.9 }, "-=.6");
    if (mode === "full") tl.to(el.querySelector(".cover__enter"), { autoAlpha: 1, duration: 0.8 }, "-=.3").add(() => { auto = setTimeout(() => enter(), 4200); });
    tl.timeScale(mode === "full" ? 1.45 : 2.6);
    if (mode === "short") tl.add(() => enter(), "-=.2");
    // failsafe: whatever happens (background tab, slow device), never leave a visitor stuck on the cover
    const failsafe = setTimeout(() => enter(), mode === "full" ? 12000 : 6000);
    const hardStop = setTimeout(() => { pigment.stop(); document.body.classList.remove("is-loading"); getLenis()?.start(); onReveal(); setGone(true); }, mode === "full" ? 16000 : 9000);

    function enter() {
      if (entered) return;
      entered = true; clearTimeout(auto); tl.progress(1);
      try { sessionStorage.setItem("jx-seen", "1"); } catch {}
      const veil = el.querySelector<HTMLElement>(".cover__veil")!, glow = el.querySelector<HTMLElement>(".cover__glow")!;
      const third = svg.querySelector(".lg-third")!.getBoundingClientRect();
      const ix = third.left + third.width / 2, iy = third.top + third.height / 2;
      const feather = Math.max(180, Math.min(innerWidth, innerHeight) * 0.38); // soft, glowing edge
      const maxR = Math.hypot(Math.max(ix, innerWidth - ix), Math.max(iy, innerHeight - iy)) + feather;
      veil.style.setProperty("--ix", ix + "px"); veil.style.setProperty("--iy", iy + "px"); veil.style.setProperty("--if", feather + "px");
      veil.classList.add("is-opening");
      gsap.set(glow, { x: ix, y: iy, xPercent: -50, yPercent: -50 });
      const host = el.querySelector<HTMLElement>(".cover__logo")!;
      const to = document.querySelector("[data-nav-logo]")!.getBoundingClientRect(), from = host.getBoundingClientRect();
      const hero = document.querySelector<HTMLElement>(".hero");
      const iris = { r: 0 };
      gsap.timeline({ onComplete: () => { clearTimeout(hardStop); pigment.stop(); getLenis()?.start(); setGone(true); ScrollTrigger.refresh(); } })
        .to(el.querySelectorAll(".cover__title, .cover__enter"), { autoAlpha: 0, y: -8, duration: 0.3, ease: "power2.in" })
        .add(() => blinkLids(lids), "<")
        .to(pigment.state, { burst: 1, duration: 1.1, ease: "power2.in" }, "<")
        // a bloom of gold light from the third eye…
        .fromTo(glow, { opacity: 0, scale: 0.2 }, { opacity: 1, scale: 1, duration: 0.45, ease: "power2.out" }, 0.15)
        .to(glow, { scale: 3.2, opacity: 0, duration: 1.1, ease: "power2.out" }, ">-.05")
        // …and the world behind it starts to surface while the veil is still opening
        .add(() => { document.body.classList.remove("is-loading"); onReveal(); }, 0.3)
        .fromTo(hero, { filter: "blur(16px) brightness(1.15)", scale: 1.06 },
          { filter: "blur(0px) brightness(1)", scale: 1, duration: 1.5, ease: "expo.out", clearProps: "filter,transform" }, 0.35)
        .to(iris, { r: maxR, duration: 1.25, ease: "power3.inOut", onUpdate: () => veil.style.setProperty("--ir", iris.r + "px") }, 0.3)
        .to(veil, { opacity: 0, duration: 0.55, ease: "power1.in" }, 0.95)
        .to(host, { x: to.left + to.width / 2 - (from.left + from.width / 2), y: to.top + to.height / 2 - (from.top + from.height / 2), scale: to.width / from.width, duration: 1.15, ease: "expo.inOut" }, 0.3)
        .to(svg, { "--sw": 2.2, color: "#1f1b18", duration: 1.15, ease: "expo.inOut" }, "<")
        .to(q(".lg-bloom"), { opacity: 0, duration: 0.4 }, "<")
        .set(host, { autoAlpha: 0 });
    }
    api.current = { enter, skip: () => { if (!entered && tl.progress() < 1) tl.progress(1); } };
    return () => { tl.kill(); clearTimeout(auto); clearTimeout(failsafe); clearTimeout(hardStop); pigment.stop(); document.body.classList.remove("is-loading"); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  if (gone) return null;
  return (
    <div ref={root} className="cover" aria-hidden onClick={(e) => { if (!(e.target as Element).closest("button")) api.current.skip(); }}>
      <div className="cover__veil"><canvas className="cover__pigment" /></div>
      <div className="cover__glow" />
      <div className="cover__stage">
        <div className="cover__logo"><JxLogo ref={logo} alive={mode !== null} /></div>
        <p className="cover__title">the studio of Jyxdi</p>
        <div className="cover__enter">
          <button className="cover__btn" onClick={() => api.current.enter()}>Open the sketchbook <span aria-hidden>→</span></button>
          <span className="cover__hint">or wait a moment</span>
        </div>
      </div>
    </div>
  );
}

/* soft blooms of colour, like paint dropped into water */
function startPigment(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d")!;
  const state = { a: 0, burst: 0 };
  const cols = ["255,138,61", "229,72,44", "224,51,138", "122,77,255", "47,170,255", "244,217,156", "73,255,176"];
  let W = 0, H = 0, raf = 0, alive = true;
  const resize = () => { W = canvas.width = Math.round(innerWidth * 0.5); H = canvas.height = Math.round(innerHeight * 0.5); };
  resize(); addEventListener("resize", resize);
  const blobs = Array.from({ length: 26 }, (_, i) => ({ ang: Math.random() * 6.28, sp: 0.15 + Math.random() * 0.5, d: Math.random() * 0.12, r: 0.08 + Math.random() * 0.2, c: cols[i % cols.length], ph: Math.random() * 6.28, w: 0.3 + Math.random() * 0.7 }));
  const draw = (t: number) => {
    if (!alive) return;
    ctx.clearRect(0, 0, W, H); ctx.globalCompositeOperation = "lighter";
    const m = Math.min(W, H), cx = W / 2, cy = H * 0.46, time = t / 1000;
    for (const b of blobs) {
      const dist = (b.d + state.a * b.sp * 0.55 + state.burst * b.sp * 1.6) * m;
      const x = cx + Math.cos(b.ang + Math.sin(time * 0.2 + b.ph) * 0.3) * dist, y = cy + Math.sin(b.ang + Math.cos(time * 0.17 + b.ph) * 0.3) * dist * 0.8;
      const r = (b.r * (0.4 + state.a * 0.9) + state.burst * 0.5) * m, alpha = 0.085 * state.a * b.w * (1 - state.burst * 0.6);
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(${b.c},${alpha})`); g.addColorStop(1, `rgba(${b.c},0)`);
      ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
    raf = requestAnimationFrame(draw);
  };
  raf = requestAnimationFrame(draw);
  return { state, stop() { alive = false; cancelAnimationFrame(raf); removeEventListener("resize", resize); } };
}
