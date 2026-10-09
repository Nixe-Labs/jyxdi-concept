"use client";
import { create } from "zustand";
/** Page-level UI state shared across the chrome. */
export const useUI = create<{ menu: boolean; setMenu: (v: boolean) => void; introPlaying: boolean; setIntro: (v: boolean) => void }>((set) => ({
  menu: false, setMenu: (menu) => set({ menu }),
  introPlaying: false, setIntro: (introPlaying) => set({ introPlaying }),
}));
