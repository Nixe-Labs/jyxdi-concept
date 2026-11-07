import { Instrument_Serif, Manrope, Noto_Serif_Tamil } from "next/font/google";

/** Display: an editorial serif with a drawn, slightly condensed italic. */
export const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--nf-serif", display: "swap" });
export const sans = Manrope({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--nf-sans", display: "swap" });
export const tamil = Noto_Serif_Tamil({ subsets: ["tamil"], weight: ["400", "500"], variable: "--nf-tamil", display: "swap", preload: false }); // only a few captions use it
