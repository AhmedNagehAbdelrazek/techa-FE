"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getWishlist } from "@/lib/api/wishlist";
import type { WishlistItem } from "@/lib/api/wishlist";

interface WishlistState {
  items: WishlistItem[];
  itemCount: number;
  isLoading: boolean;
  fetchWishlist: () => Promise<void>;
  refreshWishlist: () => Promise<void>;
  setItemCount: (count: number) => void;
  reset: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set) => ({
      items: [],
      itemCount: 0,
      isLoading: false,
      fetchWishlist: async () => {
        set({ isLoading: true });
        try {
          const items = await getWishlist();
          set({ items, itemCount: items.length, isLoading: false });
        } catch {
          set({ items: [], itemCount: 0, isLoading: false });
        }
      },
      refreshWishlist: async () => {
        try {
          const items = await getWishlist();
          set({ items, itemCount: items.length });
        } catch {
          set({ items: [], itemCount: 0 });
        }
      },
      setItemCount: (count) => set({ itemCount: count }),
      reset: () => set({ items: [], itemCount: 0, isLoading: false }),
    }),
    {
      name: "wishlist-storage",
      partialize: (state) => ({ items: state.items, itemCount: state.itemCount }),
    },
  ),
);
