"use client";

import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/client";

interface StockStatusProps {
  stockQty: number;
}

export function StockStatus({ stockQty }: StockStatusProps) {
  const { t } = useTranslation();
  if (stockQty <= 0) {
    return (
      <span className="text-sm font-medium text-destructive">{t("Out of Stock")}</span>
    );
  }
  if (stockQty <= 3) {
    return (
      <span className="text-sm font-medium text-amber-600">
        {t("Only {{count}} left in stock", { count: stockQty })}
      </span>
    );
  }
  return (
      <span className={cn("text-sm font-medium text-green-600")}>
        {t("In Stock")}
      </span>
  );
}
