"use client";

import type { Brand } from "@/lib/types/brand";

interface BrandFilterProps {
  brands: Brand[];
  selectedBrands: string[];
  onBrandToggle: (brandId: string) => void;
}

export function BrandFilter({ brands, selectedBrands, onBrandToggle }: BrandFilterProps) {
  if (brands.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">Brand</h3>
      <div className="space-y-2">
        {brands.map((brand) => {
          const isChecked = selectedBrands.includes(brand.id);
          return (
            <label
              key={brand.id}
              className="flex cursor-pointer items-center gap-2 text-sm"
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => onBrandToggle(brand.id)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span>{brand.name}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
