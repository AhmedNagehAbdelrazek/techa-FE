"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { request } from "@/lib/api/Request";

interface CartState {
  itemCount: number;
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  setItemCount: (count: number) => void;
}

interface CartData {
  items?: unknown[];
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      itemCount: 0,
      isLoading: false,
      fetchCart: async () => {
        set({ isLoading: true });
        try {
          const data = await request.get<CartData>("/api/cart");
          const count = Array.isArray(data.items) ? data.items.length : 0;
          set({ itemCount: count, isLoading: false });
        } catch {
          set({ itemCount: 0, isLoading: false });
        }
      },
      setItemCount: (count) => set({ itemCount: count }),
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({ itemCount: state.itemCount }),
    },
  ),
);
