"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useCartStore } from "@/lib/stores/cart.store";
import { CheckoutAddressStep } from "@/components/store/CheckoutAddressStep";
import { CheckoutReviewStep } from "@/components/store/CheckoutReviewStep";
import type { Address, ShippingRateResponse, PaymentMethodsResponse, PaymentMethod } from "@/lib/types/order";

interface CheckoutState {
  step: 1 | 2;
  addresses: Address[];
  selectedAddressId: string | null;
  isAddingNewAddress: boolean;
  shippingRate: ShippingRateResponse | null;
  shippingRateLoading: boolean;
  shippingRateError: string | null;
  paymentMethod: PaymentMethod | null;
  paymentMethods: PaymentMethodsResponse | null;
  notes: string;
  isPlacingOrder: boolean;
}

export default function CheckoutPage() {
  useEffect(() => { document.title = "إتمام الطلب — TechA"; }, []);
  const router = useRouter();
  const cartItems = useCartStore((s) => s.items);

  const cartLoading = useCartStore((s) => s.isLoading);

  const [state, setState] = useState<CheckoutState>({
    step: 1,
    addresses: [],
    selectedAddressId: null,
    isAddingNewAddress: false,
    shippingRate: null,
    shippingRateLoading: false,
    shippingRateError: null,
    paymentMethod: null,
    paymentMethods: null,
    notes: "",
    isPlacingOrder: false,
  });

  useEffect(() => {
    if (!cartLoading && cartItems.length === 0) {
      router.replace("/cart");
    }
  }, [cartLoading, cartItems, router]);

  const update = useCallback((patch: Partial<CheckoutState>) => {
    setState((prev) => ({ ...prev, ...patch }));
  }, []);

  if (cartLoading) {
    return (
      <ProtectedRoute>
        <div className="mx-auto max-w-3xl px-4 py-8">
          <div className="space-y-4">
            <div className="h-8 w-48 animate-pulse rounded bg-muted" />
            <div className="h-64 animate-pulse rounded-lg bg-muted" />
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (cartItems.length === 0) {
    return null;
  }

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Checkout</h1>
          <div className="mt-4 flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                state.step === 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              1
            </div>
            <div className="h-px flex-1 bg-border" />
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                state.step === 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              2
            </div>
          </div>
        </div>

        {state.step === 1 && (
          <CheckoutAddressStep
            addresses={state.addresses}
            selectedAddressId={state.selectedAddressId}
            isAddingNewAddress={state.isAddingNewAddress}
            onUpdate={update}
            onContinue={() => update({ step: 2 })}
          />
        )}

        {state.step === 2 && (
          <CheckoutReviewStep
            selectedAddressId={state.selectedAddressId}
            shippingRate={state.shippingRate}
            shippingRateLoading={state.shippingRateLoading}
            shippingRateError={state.shippingRateError}
            paymentMethod={state.paymentMethod}
            paymentMethods={state.paymentMethods}
            notes={state.notes}
            isPlacingOrder={state.isPlacingOrder}
            onUpdate={update}
            onBack={() => update({ step: 1 })}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
