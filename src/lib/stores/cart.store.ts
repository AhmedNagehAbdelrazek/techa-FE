"use client";

import { create } from "zustand";

interface CartState {
  itemCount: number;
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  setItemCount: (count: number) => void;
}

export const useCartStore = create<CartState>((set) => ({
  itemCount: 0,
  isLoading: false,
  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch("/api/cart");
      if (!res.ok) {
        set({ itemCount: 0, isLoading: false });
        return;
      }
      const data = await res.json();
      const count = Array.isArray(data.items) ? data.items.length : 0;
      set({ itemCount: count, isLoading: false });
    } catch {
      set({ itemCount: 0, isLoading: false });
    }
  },
  setItemCount: (count) => set({ itemCount: count }),
}));
