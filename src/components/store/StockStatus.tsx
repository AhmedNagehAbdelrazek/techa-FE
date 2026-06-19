"use client";

import { cn } from "@/lib/utils";

interface StockStatusProps {
  stockQty: number;
}

export function StockStatus({ stockQty }: StockStatusProps) {
  if (stockQty <= 0) {
    return (
      <span className="text-sm font-medium text-destructive">Out of Stock</span>
    );
  }
  if (stockQty <= 3) {
    return (
      <span className="text-sm font-medium text-amber-600">
        Only {stockQty} left in stock
      </span>
    );
  }
  return (
    <span className={cn("text-sm font-medium text-green-600")}>
      In Stock
    </span>
  );
}
