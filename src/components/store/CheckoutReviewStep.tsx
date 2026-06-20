"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useCartStore } from "@/lib/stores/cart.store";
import { getShippingRate } from "@/lib/api/shipping";
import { getPaymentMethods } from "@/lib/api/payments";
import { placeOrder } from "@/lib/api/orders";
import { formatPrice } from "@/lib/utils";
import type { ShippingRateResponse, PaymentMethodsResponse, PaymentMethod } from "@/lib/types/order";

interface CheckoutReviewStepProps {
  selectedAddressId: string | null;
  shippingRate: ShippingRateResponse | null;
  shippingRateLoading: boolean;
  shippingRateError: string | null;
  paymentMethod: PaymentMethod | null;
  paymentMethods: PaymentMethodsResponse | null;
  notes: string;
  isPlacingOrder: boolean;
  onUpdate: (patch: Record<string, unknown>) => void;
  onBack: () => void;
}

export function CheckoutReviewStep({
  selectedAddressId,
  shippingRate,
  shippingRateLoading,
  shippingRateError,
  paymentMethod,
  paymentMethods,
  notes,
  isPlacingOrder,
  onUpdate,
  onBack,
}: CheckoutReviewStepProps) {
  const cartItems = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal);
  const discount = useCartStore((s) => s.discount);
  const total = useCartStore((s) => s.total);
  const coupon = useCartStore((s) => s.coupon);
  const resetCart = useCartStore((s) => s.reset);

  const [pmLoading, setPmLoading] = useState(false);

  useEffect(() => {
    if (selectedAddressId) {
      onUpdate({ shippingRateLoading: true, shippingRateError: null });
      getShippingRate(selectedAddressId, total)
        .then((rate) => onUpdate({ shippingRate: rate, shippingRateLoading: false }))
        .catch(() => {
          onUpdate({
            shippingRateLoading: false,
            shippingRateError: "Failed to load shipping rate. Please try again.",
          });
        });
    }
  }, [selectedAddressId, total, onUpdate]);

  useEffect(() => {
    if (!paymentMethods) {
      setPmLoading(true);
      getPaymentMethods()
        .then((methods) => {
          console.log(methods);
          onUpdate({ paymentMethods: methods });
          if (methods.cash_on_delivery.enabled) {
            onUpdate({ paymentMethod: "cash_on_delivery" });
          }
        })
        .catch(() => {
          toast.error("Failed to load payment methods");
        })
        .finally(() => setPmLoading(false));
    }
  }, [paymentMethods, onUpdate]);

  async function handlePlaceOrder() {
    if (!selectedAddressId) return;
    if (!paymentMethod) {
      toast.error("Please select a payment method");
      return;
    }

    onUpdate({ isPlacingOrder: true });
    try {
      const order = await placeOrder({
        address_id: selectedAddressId,
        payment_method: paymentMethod,
        notes: notes || undefined,
      });
      window.location.href = `/orders/${order.id}/confirmation`;
      setTimeout(() => resetCart(), 0);
    } catch {
      toast.error("Failed to place order. Please try again.");
      onUpdate({ isPlacingOrder: false });
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Review Order</h2>

      {/* Cart Items */}
      <div className="rounded-lg border p-4">
        <h3 className="mb-3 text-sm font-medium">Items</h3>
        <div className="space-y-3">
          {cartItems.map((item) => (
            <div key={item.id} className="flex items-start gap-3">
              <div className="flex-1">
                <p className="text-sm font-medium">{item.product_name}</p>
                {item.variant_label && (
                  <p className="text-xs text-muted-foreground">{item.variant_label}</p>
                )}
                <p className="text-xs text-muted-foreground">Qty: {item.qty}</p>
              </div>
              <p className="text-sm font-medium">{formatPrice(item.total_price)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Shipping Rate */}
      <div className="rounded-lg border p-4">
        <h3 className="mb-3 text-sm font-medium">Shipping</h3>
        {shippingRateLoading ? (
          <Skeleton className="h-12 w-full" />
        ) : shippingRateError ? (
          <p className="text-sm text-destructive">{shippingRateError}</p>
        ) : shippingRate ? (
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Zone</span>
              <span>{shippingRate.zone_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Charge</span>
              {shippingRate.is_free ? (
                <Badge variant="secondary">Free</Badge>
              ) : (
                <span>{formatPrice(shippingRate.charge)}</span>
              )}
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estimated Delivery</span>
              <span>
                {shippingRate.estimated_days_min}–{shippingRate.estimated_days_max} days
              </span>
            </div>
          </div>
        ) : null}
      </div>

      {/* Payment Method */}
      <div className="rounded-lg border p-4">
        <h3 className="mb-3 text-sm font-medium">Payment Method</h3>
        {pmLoading ? (
          <Skeleton className="h-12 w-full" />
        ) : paymentMethods ? (
          <div className="space-y-2">
            {paymentMethods.cash_on_delivery.enabled && (
              <label className="flex cursor-pointer items-center gap-3 rounded-md border p-3 has-[[data-state=checked]]:border-primary">
                <input
                  type="radio"
                  name="payment_method"
                  value="cash_on_delivery"
                  checked={paymentMethod === "cash_on_delivery"}
                  onChange={() => onUpdate({ paymentMethod: "cash_on_delivery" as PaymentMethod })}
                  className="size-4 accent-primary"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">Cash on Delivery</p>
                  <p className="text-xs text-muted-foreground">Pay when you receive</p>
                </div>
              </label>
            )}
            {paymentMethods.instapay.enabled && (
              <label className="flex cursor-pointer items-center gap-3 rounded-md border p-3 has-[[data-state=checked]]:border-primary">
                <input
                  type="radio"
                  name="payment_method"
                  value="instapay"
                  checked={paymentMethod === "instapay"}
                  onChange={() => onUpdate({ paymentMethod: "instapay" as PaymentMethod })}
                  className="size-4 accent-primary"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">Instapay</p>
                  <p className="text-xs text-muted-foreground">Instant bank transfer</p>
                </div>
              </label>
            )}
            {paymentMethods.vodafone_cash.enabled && (
              <label className="flex cursor-pointer items-center gap-3 rounded-md border p-3 has-[[data-state=checked]]:border-primary">
                <input
                  type="radio"
                  name="payment_method"
                  value="vodafone_cash"
                  checked={paymentMethod === "vodafone_cash"}
                  onChange={() => onUpdate({ paymentMethod: "vodafone_cash" as PaymentMethod })}
                  className="size-4 accent-primary"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">Vodafone Cash</p>
                  <p className="text-xs text-muted-foreground">Mobile wallet transfer</p>
                </div>
              </label>
            )}
          </div>
        ) : null}

        {paymentMethod === "instapay" && paymentMethods?.instapay.handle && (
          <div className="mt-3 rounded-md border border-primary/20 bg-primary/5 p-3">
            <p className="text-xs font-medium text-muted-foreground">Send payment to</p>
            <p className="mt-1 text-lg font-bold text-primary">{paymentMethods.instapay.handle}</p>
          </div>
        )}

        {paymentMethod === "vodafone_cash" && paymentMethods?.vodafone_cash.number && (
          <div className="mt-3 rounded-md border border-primary/20 bg-primary/5 p-3">
            <p className="text-xs font-medium text-muted-foreground">Send payment to</p>
            <p className="mt-1 text-lg font-bold text-primary" dir="ltr">{paymentMethods.vodafone_cash.number}</p>
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="rounded-lg border p-4">
        <label className="text-sm font-medium">Order Notes (optional)</label>
        <textarea
          className="mt-2 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          rows={3}
          placeholder="Any special delivery instructions"
          value={notes}
          onChange={(e) => onUpdate({ notes: e.target.value })}
        />
      </div>

      {/* Summary */}
      <div className="rounded-lg border p-4">
        <h3 className="mb-3 text-sm font-medium">Order Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount{coupon ? ` (${coupon.code})` : ""}</span>
              <span>-{formatPrice(discount)}</span>
            </div>
          )}
          {shippingRate && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>{shippingRate.is_free ? "Free" : formatPrice(shippingRate.charge)}</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>
              {formatPrice(
                total + (shippingRate && !shippingRate.is_free ? shippingRate.charge : 0),
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          className="flex-1"
          onClick={handlePlaceOrder}
          disabled={isPlacingOrder || !paymentMethod || !!shippingRateError}
        >
          {isPlacingOrder ? "Placing Order..." : "Place Order"}
        </Button>
      </div>
    </div>
  );
}
