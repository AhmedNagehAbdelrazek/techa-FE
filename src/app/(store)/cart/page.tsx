"use client";

import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useCartStore } from "@/lib/stores/cart.store";
import { CartItemRow } from "@/components/store/CartItemRow";
import { CartOrderSummary } from "@/components/store/CartOrderSummary";
import { CartEmptyState } from "@/components/store/CartEmptyState";
import { CartCouponInput } from "@/components/store/CartCouponInput";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const isLoading = useCartStore((s) => s.isLoading);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const updateItemQty = useCartStore((s) => s.updateItemQty);
  const removeItem = useCartStore((s) => s.removeItem);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  if (isLoading && items.length === 0) {
    return <CartPageSkeleton />;
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <CartEmptyState />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Shopping Cart</h1>
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          {items.map((item) => (
            <CartItemRow
              key={item.id}
              item={item}
              onUpdateQty={updateItemQty}
              onRemove={removeItem}
            />
          ))}
        </div>
        <div className="lg:sticky lg:top-24 lg:self-start space-y-4">
          <CartCouponInput />
          <CartOrderSummary />
        </div>
      </div>
    </div>
  );
}

function CartPageSkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Skeleton className="mb-6 h-8 w-48" />
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-4 border-b pb-4">
              <Skeleton className="size-20 shrink-0 rounded-md" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/4" />
                <Skeleton className="mt-2 h-8 w-28" />
              </div>
            </div>
          ))}
        </div>
        <div>
          <Skeleton className="h-48 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
