"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/lib/stores/cart.store";

export function CartOrderSummary() {
  const subtotal = useCartStore((s) => s.subtotal);
  const discount = useCartStore((s) => s.discount);
  const total = useCartStore((s) => s.total);
  const coupon = useCartStore((s) => s.coupon);

  return (
    <div className="rounded-lg border p-4">
      <h3 className="mb-4 font-semibold">Order Summary</h3>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>

        {discount > 0 && coupon && (
          <div className="flex justify-between text-green-600">
            <span>
              Discount
              {coupon.discount_type === "percentage"
                ? ` (${coupon.discount_value}%)`
                : ""}
            </span>
            <span>-{formatPrice(discount)}</span>
          </div>
        )}

        <div className="flex justify-between">
          <span className="text-muted-foreground">Shipping</span>
          <span className="text-muted-foreground">Calculated at checkout</span>
        </div>

        <div className="border-t pt-2">
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      <Button className="mt-4 w-full" asChild>
        <Link href="/checkout">Proceed to Checkout</Link>
      </Button>
    </div>
  );
}


