"use client";

import { useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/client";
import type { ProductVariant } from "@/lib/types/product";

interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedOptions: Record<string, string>;
  onSelectionChange: (options: Record<string, string>) => void;
}

function isColorValue(value: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value) || /^(red|blue|green|black|white|gray|grey|yellow|orange|purple|pink|brown|navy|teal|maroon|gold|silver)$/i.test(value);
}

export function VariantSelector({ variants, selectedOptions, onSelectionChange }: VariantSelectorProps) {
  const { t } = useTranslation();
  const activeVariants = useMemo(() => variants.filter((v) => v.is_active), [variants]);
  const optionGroups = useMemo(() => {
    const groups = new Map<string, Set<string>>();
    for (const v of activeVariants) {
      for (const opt of v.options) {
        if (!groups.has(opt.option_name)) {
          groups.set(opt.option_name, new Set());
        }
        groups.get(opt.option_name)!.add(opt.option_value);
      }
    }
    return groups;
  }, [activeVariants]);

  const matchingVariant = useMemo(() => {
    const selectedKeys = Object.keys(selectedOptions);
    if (selectedKeys.length === 0) return null;
    return activeVariants.find((v) =>
      selectedKeys.every(
        (key) => selectedOptions[key] === v.options.find((o) => o.option_name === key)?.option_value,
      ),
    ) ?? null;
  }, [activeVariants, selectedOptions]);

  const handleSelect = useCallback(
    (optionName: string, optionValue: string) => {
      const next = { ...selectedOptions };
      if (next[optionName] === optionValue) {
        delete next[optionName];
      } else {
        next[optionName] = optionValue;
      }
      onSelectionChange(next);
    },
    [selectedOptions, onSelectionChange],
  );

  const isOptionAvailable = useCallback(
    (optionName: string, optionValue: string): boolean => {
      return activeVariants.some((v) => {
        const hasThisOption = v.options.some((o) => o.option_name === optionName && o.option_value === optionValue);
        if (!hasThisOption) return false;
        return Object.entries(selectedOptions).every(([key, val]) => {
          if (key === optionName) return true;
          return v.options.some((o) => o.option_name === key && o.option_value === val);
        });
      });
    },
    [activeVariants, selectedOptions],
  );

  const isOptionOutOfStock = useCallback(
    (optionName: string, optionValue: string): boolean => {
      return !activeVariants.some((v) => {
        const hasThisOption = v.options.some((o) => o.option_name === optionName && o.option_value === optionValue);
        if (!hasThisOption) return false;
        const matchesAllSelected = Object.entries(selectedOptions).every(([key, val]) => {
          if (key === optionName) return true;
          return v.options.some((o) => o.option_name === key && o.option_value === val);
        });
        return matchesAllSelected && v.stock_qty > 0;
      });
    },
    [activeVariants, selectedOptions],
  );

  if (optionGroups.size === 0) return null;

  return (
    <div className="space-y-4" role="group" aria-label={t("Product variants")}>
      {Array.from(optionGroups.entries()).map(([groupName, values]) => {
        const isColorGroup = Array.from(values).every(isColorValue);
        return (
          <div key={groupName}>
            <p className="mb-2 text-sm font-medium capitalize">{groupName}</p>
            <div className="flex flex-wrap gap-2">
              {Array.from(values).map((value) => {
                const selected = selectedOptions[groupName] === value;
                const available = isOptionAvailable(groupName, value);
                const outOfStock = isOptionOutOfStock(groupName, value);

                if (isColorGroup) {
                  return (
                    <button
                      key={value}
                      type="button"
                      disabled={!available || outOfStock}
                      aria-label={outOfStock ? t("{{groupName}}: {{value}} (out of stock)", { groupName, value }) : t("{{groupName}}: {{value}}", { groupName, value })}
                      aria-pressed={selected}
                      className={cn(
                        "h-8 w-8 rounded-full border-2 transition-all",
                        selected ? "border-primary ring-1 ring-primary" : "border-border",
                        (!available || outOfStock) && "cursor-not-allowed opacity-40 line-through",
                      )}
                      style={{ backgroundColor: value }}
                      onClick={() => handleSelect(groupName, value)}
                    />
                  );
                }

                return (
                  <button
                    key={value}
                    type="button"
                    disabled={!available || outOfStock}
                    aria-label={outOfStock ? t("{{groupName}}: {{value}} (out of stock)", { groupName, value }) : t("{{groupName}}: {{value}}", { groupName, value })}
                    aria-pressed={selected}
                    className={cn(
                      "rounded-md border px-3 py-1.5 text-sm transition-all",
                      selected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-muted-foreground/40",
                      (!available || outOfStock) && "cursor-not-allowed opacity-40 line-through",
                    )}
                    onClick={() => handleSelect(groupName, value)}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
      <div aria-live="polite" className="sr-only">
        {matchingVariant
          ? `${t("Selected variant:")} ${matchingVariant.options.map((o) => `${o.option_name}: ${o.option_value}`).join(", ")}`
          : t("No variant fully selected")}
      </div>
    </div>
  );
}
