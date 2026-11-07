/* Jyxdi opening: "ink & gold" paint reveal.
   The right-hand brush lifts out of her mark and sweeps broad calligraphic strokes across the burgundy curtain.
   Each stroke erases the curtain (so the choice screen underneath shows through) and leaves a fine antique-gold
   rim on the burgundy side of its edge, like gold leaf on lacquer.

   Framework-free, deterministic: every frame is drawn from scratch from the time alone, so seek(ms) is exact.

   const reveal = paintReveal({ canvas, width, height, dpr, seed, logo: { x, y, w }, mark });
     canvas  a <canvas> laid over the choice screen (CSS size width×height)
     logo    the mark's SVG box in CSS px (viewBox "18 30 195 168" maps onto x, y, w, w·168/195)
     mark    optional { image, x, y, w, h }: a picture of the rest of the mark (no brushes but the left one),
             drawn under the flying brush and faded out as it lifts
   reveal.duration (ms) · reveal.seek(ms) · reveal.play() → Promise<{ deltas, work }> (rAF gaps, ms of drawing per frame)
   reveal.stop() · reveal.brushAt(ms) and reveal.timeline are there for tooling */

const GOLD = "#C6A36A", BURGUNDY = "#4C1726", INK = "#221B1D";
const GOLD_HI = "rgb(220,196,160)"; // gold 50% + cream 50%: fresh leaf, right at the brush
const GOLD_PALE = "rgb(211,183,139)"; // gold 70% + cream 30%
const GOLD_DEEP = "rgb(180,142,96)"; // gold 85% + burgundy 15%
const CURTAIN_EDGE = "rgb(63,24,35)"; // color-mix(in srgb, burgundy 68%, ink)

// one brush of her mark (JxLogo.tsx), in the logo's viewBox units; the lifting one is its mirror (x → 231 − x)
const BRUSH = {
  bristle: "M71.2,73.2 C72,67 69.5,61 64,57.5 C57,53 48,50 43,42 C45,58 52,72 61,75.8 C63.5,76.8 65.5,76.9 67.2,76.7 Z",
  flick: "M49.5,50.5 L55.8,56.8",
  ferrule: "M67.2,76.7 L71.2,73.2 L73,75 L69,78.5 Z",
  edgeA: "M69,78.5 C101.8,114.8 155.5,164.2 186.5,190.5",
  edgeB: "M73,75 C109.5,107 159.7,160 186.5,190.5",
  inner: "M71.6,77.2 C106,111.5 158,162.5 185.6,189.8",
  fill: "M69,78.5 C101.8,114.8 155.5,164.2 186.5,190.5 C159.7,160 109.5,107 73,75 Z",
};
const SW = 1.4; // the curtain draws its mark at sw 1.4
const TIP = [231 - 43, 42], BUTT = [231 - 186.5, 190.5]; // the mirrored brush: bristle tip, handle end
const AXIS0 = Math.atan2(TIP[1] - BUTT[1], TIP[0] - BUTT[0]); // its pointing angle inside the logo (≈ −46°)
const HALF = Math.hypot(TIP[0] - BUTT[0], TIP[1] - BUTT[1]) / 2; // half its length in units (≈ 103)

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const lerp = (a, b, t) => a + (b - a) * t;
const sstep = (t) => t * t * (3 - 2 * t);
const easeOut = (t) => 1 - (1 - t) ** 3;
const easeInOutSine = (t) => 0.5 - 0.5 * Math.cos(Math.PI * t);

/** CSS-style cubic-bezier easing (x1, y1, x2, y2) */
function bezier(x1, y1, x2, y2) {
  const f = (a, b, t) => 3 * a * t * (1 - t) ** 2 + 3 * b * t * t * (1 - t) + t ** 3;
  const df = (a, b, t) => 3 * a * (1 - t) ** 2 + 6 * (b - a) * t * (1 - t) + 3 * (1 - b) * t * t;
  return (x) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) { const d = df(x1, x2, t); if (Math.abs(d) < 1e-6) break; t -= (f(x1, x2, t) - x) / d; }
    return f(y1, y2, clamp01(t));
  };
}
const STROKE_EASE = bezier(0.42, 0, 0.32, 1); // accelerate in, slow out (from rest, after the press)
const ENTRY_EASE = bezier(0.3, 0.12, 0.3, 1); // the same, but already moving as it comes in from the edge

function rng(seed) { // mulberry32
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

/** a gently irregular edge: three slow sine waves of arc length, a few px at most, never jittery */
function edgeNoise(rand, hw) {
  const waves = [[560, 0.012], [210, 0.006], [80, 0.0022]].map(([len, amp]) => [(2 * Math.PI) / (len * (0.8 + 0.4 * rand())), amp * hw, rand() * 6.283]);
  return (s) => waves.reduce((v, [k, a, ph]) => v + a * Math.sin(k * s + ph), 0);
}

/** smooth pressure curve through [u, value] knots (cosine-eased between knots) */
function pressureCurve(knots) {
  return (u) => {
    if (u <= knots[0][0]) return knots[0][1];
    for (let i = 1; i < knots.length; i++) {
      const [u1, v1] = knots[i];
      if (u <= u1) { const [u0, v0] = knots[i - 1]; return lerp(v0, v1, easeInOutSine((u - u0) / (u1 - u0))); }
    }
    return knots[knots.length - 1][1];
  };
}

/** uniform Catmull-Rom through pts, resampled every ds px of arc length */
function centreline(pts, ds) {
  const P = [[2 * pts[0][0] - pts[1][0], 2 * pts[0][1] - pts[1][1]], ...pts];
  const n = pts.length;
  P.push([2 * pts[n - 1][0] - pts[n - 2][0], 2 * pts[n - 1][1] - pts[n - 2][1]]);
  const dense = [];
  for (let i = 1; i < P.length - 2; i++) {
    const [a, b, c, d] = [P[i - 1], P[i], P[i + 1], P[i + 2]];
    for (let j = 0; j < 64; j++) {
      const t = j / 64, t2 = t * t, t3 = t2 * t;
      dense.push([0, 1].map((k) => 0.5 * (2 * b[k] + (c[k] - a[k]) * t + (2 * a[k] - 5 * b[k] + 4 * c[k] - d[k]) * t2 + (3 * b[k] - a[k] - 3 * c[k] + d[k]) * t3)));
    }
  }
  dense.push(pts[n - 1]);
  const xs = [dense[0][0]], ys = [dense[0][1]];
  let acc = 0, want = ds;
  for (let i = 1; i < dense.length; i++) {
    const [x0, y0] = dense[i - 1], [x1, y1] = dense[i], seg = Math.hypot(x1 - x0, y1 - y0);
    while (acc + seg >= want) { const f = (want - acc) / seg; xs.push(x0 + (x1 - x0) * f); ys.push(y0 + (y1 - y0) * f); want += ds; }
    acc += seg;
  }
  return { xs, ys, L: (xs.length - 1) * ds };
}

/** one stroke, precomputed: centre, tangent, normal and the two edge half-widths at every sample */
function buildStroke(spec, W, H, rand, ds) {
  // a head on screen sits a set fraction of its own half-width from the edge it must cover, whatever the aspect ratio
  const pts = spec.pts.map(([x, y], i) => [i === 0 && spec.x0 ? spec.x0 * spec.hw * H : x * W, y * H]);
  const { xs, ys, L } = centreline(pts, ds);
  const n = xs.length, base = spec.hw * H, P = pressureCurve(spec.pressure);
  const noiseA = edgeNoise(rand, base), noiseB = edgeNoise(rand, base);
  const S = { n, ds, L, x: xs, y: ys, tx: [], ty: [], hwA: [], hwB: [], dir: spec.dir, f: spec.front ?? 0.5, back: spec.back ?? 0.9, head: spec.head || [2, 0] };
  // dry brush: a fringe of thin unpainted threads just inside one edge, where the brush runs dry.
  // Lanes a few px apart, streaks staggered along each lane, never overlapping. dry: [side, from u, to u]
  S.streaks = [];
  if (spec.dry) {
    const [side, from, to] = spec.dry, px = H / 900;
    [4.5, 8.5, 13].forEach((depth, lane) => {
      let u = from + rand() * 0.08 + lane * 0.05;
      while (u < to) {
        const len = (70 + 230 * rand()) * px, i0 = Math.round((u * L) / ds), i1 = Math.min(n - 2, i0 + Math.round(len / ds));
        S.streaks.push({ sg: side === "A" ? 1 : -1, i0, i1, depth: (depth + rand() - 0.5) * px, width: (1.3 + 1.3 * rand() * (1 - lane * 0.2)) * px });
        u = (i1 * ds) / L + (0.04 + 0.12 * rand());
      }
    });
  }
  for (let i = 0; i < n; i++) {
    const a = Math.max(0, i - 2), b = Math.min(n - 1, i + 2);
    let tx = xs[b] - xs[a], ty = ys[b] - ys[a];
    const len = Math.hypot(tx, ty) || 1; tx /= len; ty /= len;
    S.tx.push(tx); S.ty.push(ty);
    const s = i * ds, w = base * P(s / L);
    S.hwA.push(w + noiseA(s)); S.hwB.push(w + noiseB(s));
  }
  return S;
}

/** the sample at arc length s (linear between samples) */
function at(S, s) {
  const f = Math.min(S.n - 1.000001, Math.max(0, s / S.ds)), i = Math.floor(f), k = f - i, j = i + 1;
  let tx = lerp(S.tx[i], S.tx[j], k), ty = lerp(S.ty[i], S.ty[j], k);
  const len = Math.hypot(tx, ty) || 1; tx /= len; ty /= len;
  return { x: lerp(S.x[i], S.x[j], k), y: lerp(S.y[i], S.y[j], k), tx, ty, hwA: lerp(S.hwA[i], S.hwA[j], k), hwB: lerp(S.hwB[i], S.hwB[j], k), i };
}

/** where the bristle tip is when the paint has reached arc length s: the apex of the stroke's rounded front */
function tipAt(S, s) {
  const c = at(S, s), r = S.f * (c.hwA + c.hwB) / 2;
  return { x: c.x + c.tx * r, y: c.y + c.ty * r, tx: c.tx, ty: c.ty };
}

const CAP = 24; // points on each rounded end

/** the painted shape so far: both edges up to s, a softly pointed front (the tip leads), a rounded start,
    and the dry-brush streaks reached so far as holes. kp < 1 while the brush presses down: the head grows out of the tip. */
function shape(S, s, kp = 1) {
  const main = [], c = at(S, s), c0 = at(S, 0);
  const push = (x, y) => main.push(x, y);
  for (let i = 0; i <= c.i; i++) push(S.x[i] - S.ty[i] * S.hwA[i], S.y[i] + S.tx[i] * S.hwA[i]); // side A (+normal)
  const fr = S.f * (c.hwA + c.hwB) / 2;
  for (let k = 0; k <= CAP; k++) { // the front, side A → tip → side B
    const ph = (Math.PI * k) / CAP, lat = Math.cos(ph), fwd = Math.sin(ph) * (1 - 0.3 * Math.abs(lat));
    const hw = lat > 0 ? c.hwA : c.hwB;
    push(c.x - c.ty * lat * hw + c.tx * fwd * fr, c.y + c.tx * lat * hw + c.ty * fwd * fr);
  }
  for (let i = c.i; i >= 0; i--) push(S.x[i] + S.ty[i] * S.hwB[i], S.y[i] - S.tx[i] * S.hwB[i]); // side B (−normal)
  const br = S.back * (c0.hwA + c0.hwB) / 2;
  const [sq, skew] = S.head; // squareness (2 = round) and slant (the side-B corner reaching further back), like a brush entering at an angle
  for (let k = 1; k < CAP; k++) { // the start, side B round the back to side A
    const ph = Math.PI + (Math.PI * k) / CAP, lat = Math.cos(ph), back = -(Math.abs(Math.sin(ph)) ** (2 / sq)) * (1 - skew * lat);
    const hw = lat > 0 ? c0.hwA : c0.hwB;
    push(c0.x - c0.ty * lat * hw + c0.tx * back * br, c0.y + c0.tx * lat * hw + c0.ty * back * br);
  }
  const holes = [];
  for (const k of S.streaks) {
    const end = Math.min(k.i1, c.i - 1);
    if (end - k.i0 < 3) continue;
    const out = [], inn = [];
    for (let i = k.i0; i <= end; i++) {
      const u = (i - k.i0) / (k.i1 - k.i0), taper = Math.sin(Math.PI * u ** 0.75) ** 0.8, w = (k.width / 2) * taper;
      const hw = k.sg > 0 ? S.hwA[i] : S.hwB[i], d = k.sg * (hw - k.depth), nx = -S.ty[i], ny = S.tx[i];
      out.push([S.x[i] + nx * (d + k.sg * w), S.y[i] + ny * (d + k.sg * w)]);
      inn.push([S.x[i] + nx * (d - k.sg * w), S.y[i] + ny * (d - k.sg * w)]);
    }
    const h = [];
    for (const [x, y] of out) h.push(x, y);
    for (let i = inn.length - 1; i >= 0; i--) h.push(inn[i][0], inn[i][1]);
    holes.push(h);
  }
  if (kp < 1) { // pressing: scale the head about the tip
    const t = tipAt(S, 0);
    for (let i = 0; i < main.length; i += 2) { main[i] = t.x + (main[i] - t.x) * kp; main[i + 1] = t.y + (main[i + 1] - t.y) * kp; }
  }
  return { main, holes, front: c.i };
}

const area = (p) => { let a = 0; for (let i = 0; i < p.length; i += 2) { const j = (i + 2) % p.length; a += p[i] * p[j + 1] - p[j] * p[i + 1]; } return a; };
function addPoly(path, p, reverse) {
  const n = p.length / 2, at = (k) => (reverse ? n - 1 - k : k) * 2;
  path.moveTo(p[at(0)], p[at(0) + 1]);
  for (let k = 1; k < n; k++) path.lineTo(p[at(k)], p[at(k) + 1]);
  path.closePath();
}
/** one Path2D: the shape, with each streak wound the other way so the nonzero rule leaves it unpainted */
function toPath2D({ main, holes }) {
  const path = new Path2D(), sign = Math.sign(area(main));
  addPoly(path, main, false);
  for (const h of holes) addPoly(path, h, Math.sign(area(h)) === sign);
  return path;
}

/* ── the choreography ── strokes in fractions of the screen (x of width, y and hw of height) ── */
const LANDSCAPE = [
  { dir: 1, press: true, hw: 0.26, back: 0.7, head: [3.2, 0.55], x0: 0.6, pts: [[0, 0.235], [0.5, 0.17], [1.06, 0.2]],
    pressure: [[0, 1.04], [0.07, 0.99], [0.22, 0.86], [0.55, 0.88], [0.85, 0.96], [1, 0.93]],
    dry: ["A", 0.32, 0.97] },
  { dir: -1, hw: 0.25, pts: [[1.115, 0.46], [0.5, 0.53], [-0.06, 0.44]],
    pressure: [[0, 1], [0.3, 0.95], [0.62, 1.02], [1, 0.95]],
    dry: ["B", 0.3, 0.97] },
  { dir: 1, hw: 0.25, pts: [[-0.115, 0.83], [0.5, 0.79], [1.045, 0.83]],
    pressure: [[0, 1], [0.4, 0.94], [0.75, 1.02], [1, 0.97]] },
];
const PORTRAIT = [
  { dir: 1, press: true, hw: 0.165, back: 0.7, head: [3.2, 0.5], x0: 0.55, pts: [[0, 0.13], [0.55, 0.1], [1.12, 0.125]],
    pressure: [[0, 1], [0.15, 0.88], [0.6, 0.95], [1, 0.92]], dry: ["A", 0.3, 0.97] },
  { dir: -1, hw: 0.165, pts: [[1.3, 0.33], [0.45, 0.375], [-0.25, 0.325]],
    pressure: [[0, 1], [0.35, 0.93], [0.7, 1.03], [1, 0.95]], dry: ["B", 0.3, 0.97] },
  { dir: 1, hw: 0.165, pts: [[-0.3, 0.6], [0.5, 0.57], [1.12, 0.6]],
    pressure: [[0, 1], [0.4, 1.04], [0.75, 0.92], [1, 1]], dry: ["B", 0.3, 0.97] },
  { dir: -1, hw: 0.17, pts: [[1.3, 0.855], [0.45, 0.88], [-0.25, 0.855]],
    pressure: [[0, 1], [0.35, 0.95], [0.7, 1.04], [1, 1]] },
];
// ms: the lift (rise, then swoop), the press, each sweep, each turn between sweeps, the exit
const TIMING = {
  landscape: { rise: 120, swoop: 260, press: 70, sweep: [400, 415, 415], turn: 70, exit: 240 },
  portrait: { rise: 120, swoop: 240, press: 60, sweep: [300, 310, 310, 310], turn: 60, exit: 230 },
};
const TILT = (34 * Math.PI) / 180; // the handle trails, tilted up from the stroke by this much
const FADE = 280; // any leftover specks of curtain fade this long once the last sweep has crossed the screen
const MARK_FADE = 420; // the rest of her mark fades this long as the brush lifts out of it

export function paintReveal({ canvas, width: W, height: H, dpr = 1, seed = 7, logo, mark = null }) {
  dpr = Math.min(2, dpr || 1);
  canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
  const ctx = canvas.getContext("2d");
  const rand = rng(seed);
  const portrait = W <= 699 || (H > W && W <= 1024); // the site stacks the two worlds under the same query
  const T = TIMING[portrait ? "portrait" : "landscape"];
  const strokes = (portrait ? PORTRAIT : LANDSCAPE).map((spec) => buildStroke(spec, W, H, rand, 3));

  // the brush: small in the logo, about 40% (36% on phones) of the screen's height once lifted
  const kLogo = logo.w / 195, kBig = ((portrait ? 0.36 : 0.4) * H) / (2 * HALF);
  const logoTip = { x: logo.x + (TIP[0] - 18) * kLogo, y: logo.y + (TIP[1] - 30) * kLogo };

  // the timeline
  let t = 0;
  const lift = { rise: [0, T.rise], swoop: [T.rise, T.rise + T.swoop] };
  t = T.rise + T.swoop;
  const segs = strokes.map((S, i) => {
    const press = i === 0 && T.press ? [t, (t += T.press)] : null;
    const sweep = [t, (t += T.sweep[i])];
    const turn = i < strokes.length - 1 ? [t, (t += T.turn)] : null;
    // ease only the part of the stroke that shows: from the tip reaching the near edge (or the press)
    // to the trailing full-width section clearing the far edge. The rest happens off screen, instantly.
    const edge = (s) => { const c = at(S, s), reach = Math.max(c.hwA, c.hwB) * Math.abs(c.ty) + 12; return S.dir > 0 ? c.x - reach - W : -(c.x + reach); };
    const tipIn = (s) => { const tp = tipAt(S, s); return S.dir > 0 ? tp.x + 30 : W + 30 - tp.x; };
    let sIn = 0, sOut = S.L;
    if (!press) while (sIn < S.L && tipIn(sIn) < 0) sIn += S.ds;
    for (let x = sIn; x <= S.L; x += S.ds) if (edge(x) > 0) { sOut = x; break; }
    return { S, press, sweep, turn, sIn, sOut, ease: press ? STROKE_EASE : ENTRY_EASE };
  });
  const exit = [t, t + T.exit];
  const last = segs[segs.length - 1];
  const fade = [last.sweep[1] - 40, last.sweep[1] - 40 + FADE]; // the screen is covered as the last sweep ends
  const duration = Math.max(exit[1], fade[1]);
  const reach = (g, time) => lerp(g.sIn, g.sOut, g.ease(clamp01((time - g.sweep[0]) / (g.sweep[1] - g.sweep[0]))));

  // brush angle while painting: along the stroke, handle trailing and tilted up
  const angleOn = (S, s) => { const c = at(S, s); return Math.atan2(c.ty, c.tx) + S.dir * TILT; };
  const poseOn = (S, s, lift = 0.12) => { const tp = tipAt(S, s); return { x: tp.x, y: tp.y, a: angleOn(S, s), k: kBig, lift, alpha: 1 }; };
  const unwrap = (a, ref) => a + 2 * Math.PI * Math.round((ref - a) / (2 * Math.PI));

  function brushAt(time) {
    const first = segs[0];
    if (time <= lift.rise[1]) { // lift out of the logo: grow a little, rise, a breath of anticipation
      const e = easeOut(clamp01(time / T.rise));
      return { x: logoTip.x - 4 * e, y: logoTip.y - 14 * e, a: AXIS0 - 0.07 * e, k: kLogo * (1 + 0.14 * e), lift: 0.55 * e, alpha: 1 };
    }
    if (time <= lift.swoop[1]) { // swoop to where the first stroke lands, turning into the stroke
      const e = clamp01((time - lift.swoop[0]) / T.swoop), m = bezier(0.45, 0, 0.25, 1)(e);
      const from = { x: logoTip.x - 4, y: logoTip.y - 14, a: AXIS0 - 0.07, k: kLogo * 1.14 };
      const to = poseOn(first.S, first.sIn);
      const a = lerp(from.a, unwrap(to.a, from.a), bezier(0.3, 0, 0.2, 1)(e));
      const k = lerp(from.k, to.k, easeOut(e)) * (1 + 0.05 * Math.sin(Math.PI * e));
      // move the brush's middle along an arc, so it turns about its own centre like a lifted object
      const midFrom = { x: from.x - Math.cos(from.a) * HALF * from.k, y: from.y - Math.sin(from.a) * HALF * from.k };
      const midTo = { x: to.x - Math.cos(to.a) * HALF * to.k, y: to.y - Math.sin(to.a) * HALF * to.k };
      const c1 = { x: lerp(midFrom.x, midTo.x, 0.3), y: lerp(midFrom.y, midTo.y, 0.3) - 0.07 * H };
      const c2 = { x: lerp(midFrom.x, midTo.x, 0.8), y: lerp(midFrom.y, midTo.y, 0.8) - 0.05 * H };
      const u = 1 - m, mx = u ** 3 * midFrom.x + 3 * u * u * m * c1.x + 3 * u * m * m * c2.x + m ** 3 * midTo.x;
      const my = u ** 3 * midFrom.y + 3 * u * u * m * c1.y + 3 * u * m * m * c2.y + m ** 3 * midTo.y;
      return { x: mx + Math.cos(a) * HALF * k, y: my + Math.sin(a) * HALF * k, a, k, lift: lerp(0.55, 0.3, e) + 0.35 * Math.sin(Math.PI * e), alpha: 1 };
    }
    for (let i = 0; i < segs.length; i++) {
      const g = segs[i];
      if (g.press && time <= g.press[1]) return { ...poseOn(g.S, 0), lift: lerp(0.3, 0.1, easeOut((time - g.press[0]) / T.press)) };
      if (time <= g.sweep[1]) return poseOn(g.S, reach(g, time));
      if (g.turn && time <= g.turn[1]) { // lift a little, swing the handle over, come down on the next stroke
        const e = clamp01((time - g.turn[0]) / T.turn), m = easeInOutSine(e);
        const A = poseOn(g.S, g.sOut), B = poseOn(segs[i + 1].S, segs[i + 1].sIn);
        const ax = Math.cos(A.a), ay = Math.sin(A.a), bx = Math.cos(B.a), by = Math.sin(B.a);
        const d = 0.08 * W, u = 1 - m;
        const p1 = { x: A.x + ax * d, y: A.y + ay * d }, p2 = { x: B.x - bx * d, y: B.y - by * d };
        return {
          x: u ** 3 * A.x + 3 * u * u * m * p1.x + 3 * u * m * m * p2.x + m ** 3 * B.x,
          y: u ** 3 * A.y + 3 * u * u * m * p1.y + 3 * u * m * m * p2.y + m ** 3 * B.y,
          a: lerp(A.a, unwrap(B.a, A.a), m), k: kBig * (1 + 0.04 * Math.sin(Math.PI * e)), lift: 0.12 + 0.4 * Math.sin(Math.PI * e), alpha: 1,
        };
      }
    }
    // exit: carry on, lift away and fade
    const e = clamp01((time - exit[0]) / T.exit), m = easeOut(e), A = poseOn(last.S, last.sOut);
    const dx = Math.cos(A.a - last.S.dir * TILT), dy = Math.sin(A.a - last.S.dir * TILT);
    return { x: A.x + dx * 0.12 * W * m, y: A.y + dy * 0.12 * W * m - 0.12 * H * m, a: A.a - last.S.dir * 0.35 * m, k: kBig * (1 + 0.08 * m), lift: lerp(0.12, 0.9, m), alpha: 1 - sstep(e) };
  }

  // painted progress of each stroke at a time: arc length reached, and the press (head growing out of the tip)
  function strokeState(g, time) {
    if (g.press && time < g.press[0]) return null;
    if (!g.press && time < g.sweep[0]) return null;
    const kp = g.press ? easeOut(clamp01((time - g.press[0]) / T.press)) : 1;
    return { s: reach(g, time), kp };
  }

  /* ── offscreen layers, made once ── */
  const curtain = document.createElement("canvas");
  curtain.width = canvas.width; curtain.height = canvas.height;
  {
    const c = curtain.getContext("2d");
    c.setTransform(dpr * 1.4 * W, 0, 0, dpr * 1.1 * H, dpr * 0.5 * W, dpr * 0.42 * H); // radial-gradient(140% 110% at 50% 42%)
    const g = c.createRadialGradient(0, 0, 0, 0, 0, 1);
    g.addColorStop(0.58, BURGUNDY); g.addColorStop(1, CURTAIN_EDGE);
    c.fillStyle = g; c.fillRect(-1, -1, 2, 2);
  }
  const paths = Object.fromEntries(Object.entries(BRUSH).map(([k, d]) => [k, new Path2D(d)]));
  const shadow = (() => { // the brush's soft shadow, blurred once at full size in the logo's orientation
    const blur = 7 * kBig, pad = Math.ceil(blur * 3), s = kBig * dpr;
    const c = document.createElement("canvas");
    c.width = Math.ceil((150 * kBig + 2 * pad) * dpr); c.height = Math.ceil((156 * kBig + 2 * pad) * dpr);
    const x = c.getContext("2d");
    const ox = pad * dpr - 37 * s, oy = pad * dpr - 36 * s; // viewBox (37,36) → (pad,pad)
    // canvas shadows blur in every browser (ctx.filter does not): draw the silhouette off the canvas, keep its shadow
    const off = c.width + 50;
    x.shadowColor = INK; x.shadowBlur = 2 * blur * dpr; x.shadowOffsetX = off;
    x.setTransform(-s, 0, 0, s, ox + 231 * s - off, oy); // mirror, then scale
    x.fillStyle = INK; x.strokeStyle = INK; x.lineWidth = 3; x.lineJoin = x.lineCap = "round";
    for (const k of ["fill", "ferrule", "bristle"]) { x.fill(paths[k]); x.stroke(paths[k]); }
    return { c, ax: ox + TIP[0] * s, ay: oy + TIP[1] * s };
  })();

  function drawBrush(b) {
    if (b.alpha <= 0) return;
    // shadow: offset straight down the screen, further and softer the higher the brush is lifted
    const sc = b.k / kBig;
    ctx.save();
    ctx.globalAlpha = b.alpha * (0.18 + 0.32 * b.lift) * clamp01((b.k - kLogo) / (0.08 * kLogo) + b.lift * 2);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.translate(b.x + 2 + 8 * b.lift * sc, b.y + 5 + 22 * b.lift * sc);
    ctx.rotate(b.a - AXIS0); ctx.scale(sc / dpr, sc / dpr);
    ctx.drawImage(shadow.c, -shadow.ax, -shadow.ay);
    ctx.restore();

    ctx.save();
    ctx.globalAlpha = b.alpha;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.translate(b.x, b.y); ctx.rotate(b.a - AXIS0); ctx.scale(b.k, b.k);
    ctx.translate(-TIP[0], -TIP[1]); ctx.transform(-1, 0, 0, 1, 231, 0);
    ctx.lineJoin = ctx.lineCap = "round";
    // burgundy body and keyline: the same occlusion the logo's mask gives the brush behind it
    ctx.fillStyle = BURGUNDY; ctx.strokeStyle = BURGUNDY; ctx.lineWidth = 2.4;
    for (const k of ["fill", "ferrule", "bristle"]) { ctx.fill(paths[k]); ctx.stroke(paths[k]); }
    ctx.strokeStyle = GOLD; ctx.lineWidth = SW;
    for (const k of ["edgeA", "edgeB", "ferrule", "bristle"]) ctx.stroke(paths[k]);
    ctx.lineWidth = SW * 1.2; ctx.stroke(paths.flick);
    ctx.globalAlpha = b.alpha * 0.75; ctx.lineWidth = SW * 0.55; ctx.stroke(paths.inner);
    ctx.restore();
  }

  const RIM = 1.5, RIM_LIT = 2.3; // px of gold showing outside the paint; the lit part is fresh leaf, near the brush
  // gold leaf catches the light: pale and deep bands across the screen that drift slowly, so a moving edge shimmers
  const sheen = (time) => {
    const d = 0.35 * (W + H) * (time / duration), g = ctx.createLinearGradient(-0.4 * W + d, -0.2 * H, 0.6 * W + d, 1.2 * H);
    [[0, GOLD], [0.16, GOLD_PALE], [0.3, GOLD], [0.46, GOLD_DEEP], [0.62, GOLD], [0.8, GOLD_PALE], [1, GOLD]].forEach(([o, c]) => g.addColorStop(o, c));
    return g;
  };
  const LIT_N = Math.round(260 / 3); // samples of edge behind the front that catch the light

  function render(time, { brush = true } = {}) { // brush:false only for measuring coverage
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = "copy";
    ctx.globalAlpha = 1 - sstep(clamp01((time - fade[0]) / FADE));
    ctx.drawImage(curtain, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    if (mark && time < MARK_FADE) { // the rest of the mark fades as the brush lifts out
      ctx.globalAlpha = 1 - easeOut(clamp01(time / MARK_FADE));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.drawImage(mark.image, mark.x, mark.y, mark.w, mark.h);
    }
    ctx.globalAlpha = 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineJoin = "round";
    const leaf = sheen(time);
    for (const g of segs) {
      const st = strokeState(g, time);
      if (!st) continue;
      const sh = shape(g.S, st.s, st.kp), path = toPath2D(sh);
      // gold leaf, only onto curtain still there; the paint then cuts away the inner half of every line
      ctx.globalCompositeOperation = "source-atop";
      ctx.strokeStyle = leaf; ctx.lineWidth = 2 * RIM; ctx.stroke(path);
      // fresh leaf round the front: brighter, a touch wider, softly glowing, fading back along both edges
      const tp = st.kp < 1 ? tipAt(g.S, 0) : tipAt(g.S, st.s), r = 0.3 * Math.min(W, H) + 120;
      const lit = ctx.createRadialGradient(tp.x, tp.y, 0, tp.x, tp.y, r);
      lit.addColorStop(0, GOLD_HI); lit.addColorStop(0.45, "rgba(208,180,132,.7)"); lit.addColorStop(1, "rgba(198,163,106,0)"); // gold → gold 77% + cream
      const m = sh.main, a = Math.max(0, sh.front - LIT_N) * 2, b = Math.min(m.length, (sh.front + CAP + 3 + LIT_N) * 2);
      const front = new Path2D();
      front.moveTo(m[a], m[a + 1]);
      for (let i = a + 2; i < b; i += 2) front.lineTo(m[i], m[i + 1]);
      ctx.shadowColor = "rgba(198,163,106,.65)"; ctx.shadowBlur = 11 * dpr;
      ctx.strokeStyle = lit; ctx.lineWidth = 2 * RIM_LIT; ctx.stroke(front);
      ctx.shadowBlur = 0; ctx.shadowColor = "transparent";
      ctx.globalCompositeOperation = "destination-out";
      ctx.fill(path);
    }
    ctx.globalCompositeOperation = "source-over";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (brush) drawBrush(brushAt(time));
    ctx.restore();
  }

  let raf = 0;
  function play() {
    cancelAnimationFrame(raf);
    return new Promise((resolve) => {
      const deltas = [], work = [];
      let start = -1, prev = -1;
      const tick = (now) => {
        if (start < 0) start = now;
        if (prev >= 0) deltas.push(now - prev);
        prev = now;
        const t0 = performance.now();
        render(Math.min(duration, now - start));
        work.push(performance.now() - t0);
        if (now - start < duration) raf = requestAnimationFrame(tick);
        else resolve({ deltas, work });
      };
      raf = requestAnimationFrame(tick);
    });
  }

  return { duration, seek: render, play, stop: () => cancelAnimationFrame(raf), brushAt, timeline: { lift, segs: segs.map((g) => ({ press: g.press, sweep: g.sweep, turn: g.turn, sIn: g.sIn, sOut: g.sOut, L: g.S.L })), exit, fade } };
}
