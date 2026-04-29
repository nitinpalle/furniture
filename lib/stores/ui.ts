"use client";

import { create } from "zustand";

/**
 * Global UI state — for elements that need to be triggered from multiple
 * places (e.g. the search modal can be opened from the navbar OR from the
 * mobile PDP gallery overlay).
 */
type UIStore = {
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  toggleSearch: () => void;
};

export const useUIStore = create<UIStore>((set) => ({
  searchOpen: false,
  setSearchOpen: (searchOpen) => set({ searchOpen }),
  toggleSearch: () => set((s) => ({ searchOpen: !s.searchOpen })),
}));
