// Invitation scene: the card leans toward the pointer (at most about 6deg), its shadow stays on the envelope and its light
// drifts. Only the individual transform properties of those three layers change ("rotate", "translate"), so nothing is
// restyled or repainted while the pointer moves. Fine pointers only; nothing runs under prefers-reduced-motion.
// Returns a cleanup.
export function attach(root) {
  const mq = (q) => window.matchMedia(q).matches;
  if (!root || mq("(prefers-reduced-motion: reduce)") || !mq("(hover: hover) and (pointer: fine)")) return () => {};
  const area = root.closest(".lx-world--invite") || root; // the whole half answers, words included
  const tilt = root.querySelector(".lx-invite__tilt"), shadow = root.querySelector(".lx-invite__shadow"), light = root.querySelector(".lx-invite__light");
  if (!tilt) return () => {};
  const clamp = (v) => Math.max(-1, Math.min(1, v));
  let tx = 0, ty = 0, x = 0, y = 0, u = 0, raf = 0;
  const apply = () => {
    const a = Math.hypot(x, y);
    tilt.style.rotate = a < 1e-4 ? "" : `${(-y).toFixed(4)} ${x.toFixed(4)} 0 ${(a * 4.2).toFixed(3)}deg`;
    if (shadow) shadow.style.translate = `${(-0.8 * u * x).toFixed(2)}px ${(-0.8 * u * y).toFixed(2)}px`;
    if (light) light.style.translate = `${(-22 * x).toFixed(2)}% ${(-16 * y).toFixed(2)}%`;
  };
  const frame = () => {
    x += (tx - x) * 0.08;
    y += (ty - y) * 0.08;
    const done = Math.abs(tx - x) + Math.abs(ty - y) < 0.001;
    if (done) { x = tx; y = ty; }
    apply();
    raf = done ? 0 : requestAnimationFrame(frame);
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };
  const move = (e) => {
    const r = root.getBoundingClientRect();
    if (!u) u = tilt.offsetWidth / 100; // the card is 100 units wide (measured once a move begins, before any writes)
    tx = clamp(((e.clientX - r.left) / r.width) * 2 - 1);
    ty = clamp(((e.clientY - r.top) / r.height) * 2 - 1);
    kick();
  };
  const leave = () => { tx = 0; ty = 0; kick(); };
  const resize = () => { u = 0; };
  area.addEventListener("pointermove", move, { passive: true });
  area.addEventListener("pointerleave", leave);
  addEventListener("resize", resize);
  return () => {
    cancelAnimationFrame(raf);
    area.removeEventListener("pointermove", move);
    area.removeEventListener("pointerleave", leave);
    removeEventListener("resize", resize);
    for (const el of [tilt, shadow, light]) if (el) { el.style.rotate = ""; el.style.translate = ""; }
  };
}
