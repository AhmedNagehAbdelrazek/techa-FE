"use client";

import { useState, useCallback } from "react";
import { Loader2, ShoppingCart, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/stores/cart.store";
import { useTranslation } from "@/lib/i18n/client";

interface AddToCartButtonProps {
  productId: string;
  variantId: string;
  quantity: number;
  disabled: boolean;
  disableReason?: string;
}

export function AddToCartButton({ productId, variantId, quantity, disabled, disableReason }: AddToCartButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const { t } = useTranslation();

  const handleClick = useCallback(async () => {
    if (disabled || isLoading) return;
    setIsLoading(true);
    try {
      await addItem({ product_id: productId, variant_id: variantId, qty: quantity });
      setAdded(true);
      toast.success(t("Added to cart"));
      setTimeout(() => setAdded(false), 2000);
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? ((err as { response?: { data?: { message?: string } } }).response?.data?.message ?? "")
          : "";
      if (msg.toLowerCase().includes("stock") || msg.toLowerCase().includes("insufficient")) {
        toast.error(t("Sorry, this item just went out of stock"));
      } else {
        toast.error(msg || t("Failed to add to cart"));
      }
    } finally {
      setIsLoading(false);
    }
  }, [disabled, isLoading, productId, variantId, quantity, addItem]);

  const label = disableReason ?? (added ? t("Added!") : t("Add to Cart"));

  return (
    <Button
      type="button"
      size="lg"
      className="w-full"
      disabled={disabled || isLoading}
      onClick={handleClick}
      aria-busy={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : added ? (
        <Check className="h-4 w-4" />
      ) : (
        <ShoppingCart className="h-4 w-4" />
      )}
      {label}
    </Button>
  );
}
