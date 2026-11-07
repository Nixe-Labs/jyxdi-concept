/** The works hung on the homepage gallery wall: slug, art height px, wire length px, moulding, mat.
    All eight have large photos, so their viewing rooms stay sharp up close, and all are flat photos of the painting
    (never a photo of her or of a room: only artworks are framed). */
export const HANG: [string, number, number, "gold" | "black", boolean][] = [
  ["ganesh-x-shiva", 300, 54, "gold", true],
  ["the-egg", 250, 96, "black", true],
  ["kali", 330, 40, "gold", false],
  ["universe-within", 270, 82, "black", true],
  ["gaia", 310, 58, "gold", true],
  ["yugan", 262, 92, "gold", false],
  ["rise-from-the-ashes", 300, 50, "black", true],
  ["arthanareeswarar", 282, 74, "gold", true],
];
export const WALL_SLUGS = HANG.map((h) => h[0]);
