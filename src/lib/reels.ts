import { BASE } from "@/lib/base";

/** Reels from instagram.com/jyxdi, re-encoded silent (their soundtracks are licensed to Instagram only). */
export type Reel = { key: string; ig: string; label: string; kind: "live" | "uv" | "studio" };

export const REELS: Reel[] = [
  { key: "live-west-indian", ig: "DfVBFMEzLLi", label: "A West Indian wedding, painted live", kind: "live" },
  { key: "live-hindu-couple", ig: "DfFbE6sTP1M", label: "A Hindu wedding, and the couple's reaction", kind: "live" },
  { key: "live-outdoor-canada", ig: "DfZ-Rc4v1r9", label: "An outdoor wedding in Canada", kind: "live" },
  { key: "live-hindu-guests", ig: "DfNTI2bzCfL", label: "Guests gather to watch her paint", kind: "live" },
  { key: "live-guest-reactions", ig: "DfPtxxYzqnC", label: "Guests' reactions, part 3", kind: "live" },
  { key: "uv-hanuman", ig: "DfKjxkfzHr9", label: "Hanuman, glowing in the dark", kind: "uv" },
  { key: "studio-process", ig: "DfSXQ79zbTC", label: "Detail, stroke by stroke", kind: "studio" },
  { key: "studio-sold", ig: "DRUpEeKkcoW", label: "An oil painting, from first sketch to sold", kind: "studio" },
  { key: "art-journey", ig: "Dci9FRBzLPx", label: "From pencil sketches to UV murals", kind: "studio" },
];

export const reel = (key: string) => REELS.find((r) => r.key === key)!;
export const reelSrc = (r: Reel) => `${BASE}/video/${r.key}.mp4`;
export const reelPoster = (r: Reel) => `${BASE}/video/${r.key}.jpg`;
export const reelUrl = (r: Reel) => `https://www.instagram.com/reel/${r.ig}/`;
