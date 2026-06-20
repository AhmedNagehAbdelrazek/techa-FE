"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import * as cartApi from "@/lib/api/cart";
import type { Cart, CartItem, CartCoupon, AddItemRequest } from "@/lib/types/cart";

interface CartStore {
  items: CartItem[];
  coupon: CartCoupon | null;
  subtotal: number;
  discount: number;
  total: number;
  version: number;
  isLoading: boolean;
  error: string | null;

  itemCount: number;

  fetchCart: () => Promise<void>;
  addItem: (data: AddItemRequest) => Promise<void>;
  updateItemQty: (itemId: string, qty: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => Promise<void>;
  reset: () => void;
}

function applyCart(state: CartStore, c: Cart): Partial<CartStore> {
  return {
    items: c.items,
    coupon: c.coupon,
    subtotal: c.subtotal,
    discount: c.discount,
    total: c.total,
    version: c.version,
    itemCount: c.items.length,
    isLoading: false,
    error: null,
  };
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,
      subtotal: 0,
      discount: 0,
      total: 0,
      version: 0,
      isLoading: false,
      error: null,
      itemCount: 0,

      fetchCart: async () => {
        set({ isLoading: true, error: null });
        try {
          const cart = await cartApi.getCart();
          set(applyCart(get(), cart));
        } catch (e) {
          set({ isLoading: false, error: e instanceof Error ? e.message : "Failed to load cart" });
        }
      },

      addItem: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const cart = await cartApi.addItem(data);
          set(applyCart(get(), cart));
        } catch (e) {
          set({ isLoading: false, error: e instanceof Error ? e.message : "Failed to add item" });
          throw e;
        }
      },

      updateItemQty: async (itemId, qty) => {
        const prev = get();
        const nextItems = prev.items.map((item) =>
          item.id === itemId ? { ...item, qty, total_price: qty * item.unit_price } : item,
        );
        set({ items: nextItems, itemCount: nextItems.length, error: null });
        try {
          const cart = await cartApi.updateItemQty(itemId, qty);
          set(applyCart(get(), cart));
        } catch (e) {
          set({ items: prev.items, itemCount: prev.items.length, error: e instanceof Error ? e.message : "Failed to update quantity" });
          throw e;
        }
      },

      removeItem: async (itemId) => {
        const prev = get();
        const nextItems = prev.items.filter((item) => item.id !== itemId);
        set({ items: nextItems, itemCount: nextItems.length, error: null });
        try {
          const cart = await cartApi.removeItem(itemId);
          set(applyCart(get(), cart));
        } catch (e) {
          set({ items: prev.items, itemCount: prev.items.length, error: e instanceof Error ? e.message : "Failed to remove item" });
          throw e;
        }
      },

      applyCoupon: async (code) => {
        set({ isLoading: true, error: null });
        try {
          const cart = await cartApi.applyCoupon({ code });
          set(applyCart(get(), cart));
        } catch (e) {
          set({ isLoading: false, error: e instanceof Error ? e.message : "Failed to apply coupon" });
          throw e;
        }
      },

      removeCoupon: async () => {
        set({ isLoading: true, error: null });
        try {
          const cart = await cartApi.removeCoupon();
          set(applyCart(get(), cart));
        } catch (e) {
          set({ isLoading: false, error: e instanceof Error ? e.message : "Failed to remove coupon" });
          throw e;
        }
      },

      reset: () =>
        set({
          items: [],
          coupon: null,
          subtotal: 0,
          discount: 0,
          total: 0,
          version: 0,
          isLoading: false,
          error: null,
          itemCount: 0,
        }),
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({
        items: state.items,
        coupon: state.coupon,
        subtotal: state.subtotal,
        discount: state.discount,
        total: state.total,
        version: state.version,
        itemCount: state.itemCount,
      }),
    },
  ),
);
