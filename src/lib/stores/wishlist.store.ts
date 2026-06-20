"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getWishlist } from "@/lib/api/wishlist";

interface WishlistState {
  itemCount: number;
  isLoading: boolean;
  fetchWishlist: () => Promise<void>;
  setItemCount: (count: number) => void;
  reset: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set) => ({
      itemCount: 0,
      isLoading: false,
      fetchWishlist: async () => {
        set({ isLoading: true });
        try {
          const items = await getWishlist();
          set({ itemCount: items.length, isLoading: false });
        } catch {
          set({ itemCount: 0, isLoading: false });
        }
      },
      setItemCount: (count) => set({ itemCount: count }),
      reset: () => set({ itemCount: 0, isLoading: false }),
    }),
    {
      name: "wishlist-storage",
      partialize: (state) => ({ itemCount: state.itemCount }),
    },
  ),
);
