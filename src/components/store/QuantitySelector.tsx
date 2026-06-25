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
      <div className="flex items-center border border-border rounded">
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          disabled={disabled || atMin}
          onClick={() => onChange(value - 1)}
          aria-label={t("Decrease quantity")}
          className="rounded-none text-secondary hover:text-primary"
        >
          <Minus className="h-3 w-3" />
        </Button>
        <span
          className="flex h-8 w-12 items-center justify-center text-sm font-medium tabular-nums border-x border-border"
          aria-live="polite"
          aria-label={`${t("Quantity:")} ${value}`}
        >
          {value}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          disabled={disabled || atMax}
          onClick={() => onChange(value + 1)}
          aria-label={t("Increase quantity")}
          className="rounded-none text-secondary hover:text-primary"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
