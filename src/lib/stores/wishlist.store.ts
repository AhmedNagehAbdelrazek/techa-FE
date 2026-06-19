"use client";

import { create } from "zustand";

interface WishlistState {
  itemCount: number;
  isLoading: boolean;
  fetchWishlist: () => Promise<void>;
  setItemCount: (count: number) => void;
}

export const useWishlistStore = create<WishlistState>((set) => ({
  itemCount: 0,
  isLoading: false,
  fetchWishlist: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch("/api/wishlist");
      if (!res.ok) {
        set({ itemCount: 0, isLoading: false });
        return;
      }
      const data = await res.json();
      const items = Array.isArray(data) ? data : data?.data ?? [];
      set({ itemCount: items.length, isLoading: false });
    } catch {
      set({ itemCount: 0, isLoading: false });
    }
  },
  setItemCount: (count) => set({ itemCount: count }),
}));
