"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartLine = {
  variantId: number;
  slug: string;
  title: string;
  image: string;
  option: string; // e.g. "24×30 · Canvas · UV glow"
  price: number;
  qty: number;
};

type CartState = {
  lines: CartLine[];
  open: boolean;
  add: (line: Omit<CartLine, "qty">, qty?: number) => void;
  setQty: (variantId: number, qty: number) => void;
  remove: (variantId: number) => void;
  clear: () => void;
  setOpen: (open: boolean) => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      open: false,
      add: (line, qty = 1) =>
        set((s) => {
          const hit = s.lines.find((l) => l.variantId === line.variantId);
          const lines = hit
            ? s.lines.map((l) => (l.variantId === line.variantId ? { ...l, qty: l.qty + qty } : l))
            : [...s.lines, { ...line, qty }];
          return { lines, open: true };
        }),
      setQty: (variantId, qty) =>
        set((s) => ({
          lines: qty <= 0 ? s.lines.filter((l) => l.variantId !== variantId) : s.lines.map((l) => (l.variantId === variantId ? { ...l, qty } : l)),
        })),
      remove: (variantId) => set((s) => ({ lines: s.lines.filter((l) => l.variantId !== variantId) })),
      clear: () => set({ lines: [] }),
      setOpen: (open) => set({ open }),
    }),
    { name: "jyxdi-cart", partialize: (s) => ({ lines: s.lines }) }
  )
);

export const cartCount = (lines: CartLine[]) => lines.reduce((n, l) => n + l.qty, 0);
export const cartTotal = (lines: CartLine[]) => lines.reduce((n, l) => n + l.qty * l.price, 0);
