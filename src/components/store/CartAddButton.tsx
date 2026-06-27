"use client";

import { useState, useCallback } from "react";
import { Loader2, ShoppingCart, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/stores/cart.store";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useAuthDialogStore } from "@/lib/stores/auth-dialog.store";

interface CartAddButtonProps {
  productId: string;
  variantId: string;
  qty: number;
  disabled?: boolean;
  disableReason?: string;
}

export function CartAddButton({ productId, variantId, qty, disabled, disableReason }: CartAddButtonProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const openAuthDialog = useAuthDialogStore((s) => s.open);
  const addItem = useCartStore((s) => s.addItem);
  const [isLoading, setIsLoading] = useState(false);
  const [added, setAdded] = useState(false);

  const handleClick = useCallback(async () => {
    if (!isAuthenticated) {
      openAuthDialog();
      return;
    }
    if (disabled || isLoading) return;
    setIsLoading(true);
    try {
      await addItem({ product_id: productId, variant_id: variantId, qty });
      setAdded(true);
      toast.success("Added to cart");
      setTimeout(() => setAdded(false), 2000);
    } catch {
      toast.error("Failed to add to cart");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, disabled, isLoading, addItem, openAuthDialog, productId, variantId, qty]);

  const label = disableReason ?? (added ? "Added!" : "Add to Cart");

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
        <Loader2 className="size-4 animate-spin" />
      ) : added ? (
        <Check className="size-4" />
      ) : (
        <ShoppingCart className="size-4" />
      )}
      {label}
    </Button>
  );
}
