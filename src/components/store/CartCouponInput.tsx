"use client";

import { useState, useCallback } from "react";
import { Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/lib/stores/cart.store";
import { useTranslation } from "@/lib/i18n/client";

export function CartCouponInput() {
  const [code, setCode] = useState("");
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const coupon = useCartStore((s) => s.coupon);
  const applyCoupon = useCartStore((s) => s.applyCoupon);
  const removeCoupon = useCartStore((s) => s.removeCoupon);

  const handleApply = useCallback(async () => {
    const trimmed = code.trim();
    if (!trimmed) return;
    setIsLoading(true);
    try {
      await applyCoupon(trimmed);
      setCode("");
      toast.success(t("Coupon applied!"));
    } catch {
      toast.error(t("Invalid or expired coupon code"));
    } finally {
      setIsLoading(false);
    }
  }, [code, applyCoupon, t]);

  const handleRemove = useCallback(async () => {
    try {
      await removeCoupon();
      toast.success(t("Coupon removed"));
    } catch {
      toast.error(t("Failed to remove coupon"));
    }
  }, [removeCoupon, t]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleApply();
      }
    },
    [handleApply],
  );

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{t("Coupon Code")}</p>
      {coupon ? (
        <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          <Check className="size-4 shrink-0" />
          <span className="flex-1">
            {coupon.code}
            {coupon.discount_type === "percentage"
              ? ` (${coupon.discount_value}% ${t("off")})`
              : ` (${formatPrice(coupon.discount_value)} ${t("off")})`}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-6"
            onClick={handleRemove}
            aria-label={t("Remove coupon")}
          >
            <X className="size-3" />
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("Enter coupon code")}
            aria-label={t("Coupon code")}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            disabled={!code.trim() || isLoading}
            onClick={handleApply}
          >
            {isLoading ? <Loader2 className="size-4 animate-spin" /> : t("Apply")}
          </Button>
        </div>
      )}
    </div>
  );
}


