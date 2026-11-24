import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* The lit gallery wall, shared by the homepage's featured artwork and its three ways (Featured.tsx, Ways.tsx; styled in
   lux.css). Call these inside a gsap.matchMedia() callback, which reverts their tweens; each returns its listeners' cleanup. */

/** A warm light trails the cursor across the section, a little behind it like a lamp being turned, and every work's shadow
    falls away from it: --lx/--ly/--lon on the section, --fsx/--fsy on each work. */
export function lightWall(el: HTMLElement, works: HTMLElement[]) {
  const light = { x: 0, y: 0, on: 0 };
  let at: PointerEvent | null = null;
  const paint = () => {
    const s = el.getBoundingClientRect();
    el.style.setProperty("--lx", `${light.x.toFixed(1)}px`); el.style.setProperty("--ly", `${light.y.toFixed(1)}px`); el.style.setProperty("--lon", light.on.toFixed(3));
    for (const c of works) {
      const r = c.getBoundingClientRect(), dx = r.left + r.width / 2 - s.left - light.x, dy = r.top + r.height / 2 - s.top - light.y, d = Math.hypot(dx, dy) || 1, k = (Math.min(d, 700) / 700) * 16 * light.on;
      c.style.setProperty("--fsx", ((dx / d) * k).toFixed(1)); c.style.setProperty("--fsy", ((dy / d) * k).toFixed(1));
    }
  };
  const lx = gsap.quickTo(light, "x", { duration: 0.9, ease: "power3.out", onUpdate: paint });
  const ly = gsap.quickTo(light, "y", { duration: 0.9, ease: "power3.out", onUpdate: paint });
  const aim = () => { if (!at) return; const s = el.getBoundingClientRect(); lx(at.clientX - s.left); ly(at.clientY - s.top); };
  const move = (e: PointerEvent) => { at = e; aim(); };
  const enter = (e: PointerEvent) => {
    const s = el.getBoundingClientRect();
    at = e; light.x = e.clientX - s.left; light.y = e.clientY - s.top; // switched on where the cursor is, not swept in from the last place
    gsap.to(light, { on: 1, duration: 0.8, ease: "power2.out", onUpdate: paint, overwrite: "auto" });
  };
  const leave = () => { at = null; gsap.to(light, { on: 0, duration: 1.1, ease: "power2.out", onUpdate: paint, overwrite: "auto" }); };
  el.addEventListener("pointerenter", enter); el.addEventListener("pointermove", move); el.addEventListener("pointerleave", leave);
  addEventListener("scroll", aim, { passive: true }); // the page moves under a still cursor: the light stays with the cursor
  return () => { el.removeEventListener("pointerenter", enter); el.removeEventListener("pointermove", move); el.removeEventListener("pointerleave", leave); removeEventListener("scroll", aim); };
}

/** A work leans toward the cursor, with the glint where the cursor is: --frx/--fry and --fgx/--fgy on the work. */
export function lean(work: HTMLElement, media: HTMLElement) {
  const t = { rx: 0, ry: 0 };
  const set = () => { work.style.setProperty("--frx", `${t.rx.toFixed(2)}deg`); work.style.setProperty("--fry", `${t.ry.toFixed(2)}deg`); };
  const qx = gsap.quickTo(t, "rx", { duration: 0.7, ease: "power3.out", onUpdate: set }), qy = gsap.quickTo(t, "ry", { duration: 0.7, ease: "power3.out", onUpdate: set });
  const tilt = (e: PointerEvent) => {
    const r = media.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    qx((0.5 - py) * 8); qy((px - 0.5) * 10);
    work.style.setProperty("--fgx", `${(px * 100).toFixed(1)}%`); work.style.setProperty("--fgy", `${(py * 100).toFixed(1)}%`);
  };
  const rest = () => { qx(0); qy(0); };
  work.addEventListener("pointermove", tilt); work.addEventListener("pointerleave", rest);
  return () => { work.removeEventListener("pointermove", tilt); work.removeEventListener("pointerleave", rest); };
}

/** A button leans a few px toward the cursor, never into the next one, and its ink spreads from where the cursor came in (--ix/--iy). */
const lean5 = gsap.utils.clamp(-5, 5); // buttons sit 10-12px apart
export function magnet(b: HTMLElement) {
  const qx = gsap.quickTo(b, "x", { duration: 0.5, ease: "power3.out" }), qy = gsap.quickTo(b, "y", { duration: 0.5, ease: "power3.out" });
  const into = (e: PointerEvent) => { const r = b.getBoundingClientRect(); b.style.setProperty("--ix", `${e.clientX - r.left}px`); b.style.setProperty("--iy", `${e.clientY - r.top}px`); };
  const pull = (e: PointerEvent) => { const r = b.getBoundingClientRect(); qx(lean5((e.clientX - r.left - r.width / 2) * 0.15)); qy(lean5((e.clientY - r.top - r.height / 2) * 0.25)); };
  const back = () => { qx(0); qy(0); };
  b.addEventListener("pointerenter", into); b.addEventListener("pointermove", pull); b.addEventListener("pointerleave", back);
  return () => { b.removeEventListener("pointerenter", into); b.removeEventListener("pointermove", pull); b.removeEventListener("pointerleave", back); };
}

/** The hand-drawn gold line under a heading's last words (.c-swash), drawn by the scroll, both ways. `st` moves where it draws. */
export const drawLine = (path: Element | null, st: ScrollTrigger.Vars = {}) => path && gsap.fromTo(path, { strokeDashoffset: 1.05 }, { strokeDashoffset: 0, ease: "none", autoRound: false, scrollTrigger: { trigger: path, start: "top 92%", end: "top 55%", scrub: 0.8, ...st } });
