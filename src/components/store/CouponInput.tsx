"use client";

import { useState, useCallback } from "react";
import { Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { validateCoupon, type CouponValidationResponse } from "@/lib/api/coupons";

interface CouponInputProps {
  productId: string;
  variantId?: string | null;
  appliedCoupon: CouponValidationResponse | null;
  onCouponApplied: (result: CouponValidationResponse | null) => void;
}

export function CouponInput({ productId, appliedCoupon, onCouponApplied }: CouponInputProps) {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleApply = useCallback(async () => {
    const trimmed = code.trim();
    if (!trimmed) return;
    setIsLoading(true);
    try {
      const result = await validateCoupon(trimmed, productId);
      if (result.valid) {
        onCouponApplied(result);
        toast.success("Coupon applied!");
      } else {
        onCouponApplied(result);
        toast.error(result.message ?? "Invalid coupon code");
      }
    } catch {
      toast.error("Failed to validate coupon");
    } finally {
      setIsLoading(false);
    }
  }, [code, productId, onCouponApplied]);

  const handleRemove = useCallback(() => {
    onCouponApplied(null);
    setCode("");
  }, [onCouponApplied]);

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
      <p className="text-sm font-medium">Coupon Code</p>
      {appliedCoupon?.valid ? (
        <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          <Check className="h-4 w-4 shrink-0" />
          <span className="flex-1">
            {appliedCoupon.discount_type === "percentage"
              ? `${appliedCoupon.discount_amount}% off`
              : `${appliedCoupon.discount_amount} off`}
          </span>
          <Button type="button" variant="ghost" size="icon-xs" onClick={handleRemove} aria-label="Remove coupon">
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter coupon code"
            aria-label="Coupon code"
            className="flex-1"
          />
          <Button type="button" variant="outline" disabled={!code.trim() || isLoading} onClick={handleApply}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
          </Button>
        </div>
      )}
      {appliedCoupon && !appliedCoupon.valid && appliedCoupon.message && (
        <p className="text-xs text-destructive">{appliedCoupon.message}</p>
      )}
    </div>
  );
}
