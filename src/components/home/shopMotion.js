// Pointer-driven turntable + moving highlight for the shop scene. attach(root) -> cleanup.
// root: the .lx-scene--shop element (or anything containing .lx-shop__stage).
export function attach(root) {
  const stage = root.querySelector(".lx-shop__stage") || root;
  const still = matchMedia("(prefers-reduced-motion: reduce)");
  const zone = root.closest(".lx-world--shop") || root;
  let tx = 0, ty = 0, x = 0, y = 0, raf = 0;

  const tick = () => {
    x += (tx - x) * 0.06;
    y += (ty - y) * 0.06;
    stage.style.setProperty("--lx-shop-px", x.toFixed(4));
    stage.style.setProperty("--lx-shop-py", y.toFixed(4));
    raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.0005 ? requestAnimationFrame(tick) : 0;
  };
  const aim = (nx, ny) => {
    tx = nx;
    ty = ny;
    if (!raf) raf = requestAnimationFrame(tick);
  };
  const move = (e) => {
    if (e.pointerType === "touch" || still.matches) return;
    const r = zone.getBoundingClientRect();
    const clamp = (v) => Math.max(-1, Math.min(1, v));
    aim(clamp(((e.clientX - r.left) / r.width) * 2 - 1), clamp(((e.clientY - r.top) / r.height) * 2 - 1));
  };
  const leave = () => aim(0, 0);

  zone.addEventListener("pointermove", move);
  zone.addEventListener("pointerleave", leave);
  return () => {
    zone.removeEventListener("pointermove", move);
    zone.removeEventListener("pointerleave", leave);
    cancelAnimationFrame(raf);
    stage.style.removeProperty("--lx-shop-px");
    stage.style.removeProperty("--lx-shop-py");
  };
}
