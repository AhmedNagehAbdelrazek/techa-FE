"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { request } from "@/lib/api/Request";

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
          const data = await request.get<unknown[] | { data?: unknown[] }>(
            "/api/wishlist",
          );
          const items = Array.isArray(data)
            ? data
            : (data as { data?: unknown[] }).data ?? [];
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
