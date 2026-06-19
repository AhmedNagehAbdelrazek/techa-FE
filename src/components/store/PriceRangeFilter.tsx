"use client";

import { Input } from "@/components/ui/input";
import { useCallback, useRef } from "react";

interface PriceRangeFilterProps {
  minPrice: string;
  maxPrice: string;
  onMinChange: (value: string) => void;
  onMaxChange: (value: string) => void;
}

export function PriceRangeFilter({ minPrice, maxPrice, onMinChange, onMaxChange }: PriceRangeFilterProps) {
  const minRef = useRef<HTMLInputElement>(null);
  const maxRef = useRef<HTMLInputElement>(null);

  const handleMinBlur = useCallback(() => {
    const val = minRef.current?.value ?? "";
    if (val !== minPrice) onMinChange(val);
  }, [minPrice, onMinChange]);

  const handleMaxBlur = useCallback(() => {
    const val = maxRef.current?.value ?? "";
    if (val !== maxPrice) onMaxChange(val);
  }, [maxPrice, onMaxChange]);

  const handleMinKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      minRef.current?.blur();
    }
  };

  const handleMaxKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      maxRef.current?.blur();
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">Price Range</h3>
      <div className="flex items-center gap-2">
        <Input
          ref={minRef}
          type="number"
          placeholder="Min"
          defaultValue={minPrice}
          onBlur={handleMinBlur}
          onKeyDown={handleMinKeyDown}
          min={0}
          className="h-9"
        />
        <span className="text-muted-foreground">-</span>
        <Input
          ref={maxRef}
          type="number"
          placeholder="Max"
          defaultValue={maxPrice}
          onBlur={handleMaxBlur}
          onKeyDown={handleMaxKeyDown}
          min={0}
          className="h-9"
        />
      </div>
    </div>
  );
}
