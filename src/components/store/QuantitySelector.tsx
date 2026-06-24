"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/client";

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  max: number;
  disabled?: boolean;
}

export function QuantitySelector({ value, onChange, max, disabled = false }: QuantitySelectorProps) {
  const { t } = useTranslation();
  const cap = Math.min(10, max);
  const atMin = value <= 1;
  const atMax = value >= cap;

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">{t("Quantity:")}</span>
      <div className="flex items-center">
        <Button
          type="button"
          variant="outline"
          size="icon-xs"
          disabled={disabled || atMin}
          onClick={() => onChange(value - 1)}
          aria-label={t("Decrease quantity")}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <span
          className="flex h-8 w-10 items-center justify-center text-sm font-medium tabular-nums"
          aria-live="polite"
          aria-label={`${t("Quantity:")} ${value}`}
        >
          {value}
        </span>
        <Button
          type="button"
          variant="outline"
          size="icon-xs"
          disabled={disabled || atMax}
          onClick={() => onChange(value + 1)}
          aria-label={t("Increase quantity")}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
