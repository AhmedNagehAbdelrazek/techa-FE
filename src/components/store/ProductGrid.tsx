"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { getProducts } from "@/lib/api/products";
import { getBrands } from "@/lib/api/brands";
import { ProductCard, ProductCardSkeleton } from "@/components/store/ProductCard";
import { Pagination } from "@/components/store/Pagination";
import { SortDropdown } from "@/components/store/SortDropdown";
import { BrandFilter } from "@/components/store/BrandFilter";
import { PriceRangeFilter } from "@/components/store/PriceRangeFilter";
import { RatingFilter } from "@/components/store/RatingFilter";
import { FilterSidebar } from "@/components/store/FilterSidebar";
import { FilterSheet } from "@/components/store/FilterSheet";
import { FilterChips } from "@/components/store/FilterChips";
import type { Chip } from "@/components/store/FilterChips";
import { Separator } from "@/components/ui/separator";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";

interface ProductGridProps {
  categorySlug?: string;
  searchQuery?: string;
}

export function ProductGrid({ categorySlug, searchQuery }: ProductGridProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const currentPage = Number(searchParams.get("page")) || 1;
  const currentSort = searchParams.get("sort") || "newest";
  const brandsStr = searchParams.get("brand_id") ?? "";
  const selectedBrands = useMemo(() => brandsStr ? brandsStr.split(",").filter(Boolean) : [], [brandsStr]);
  const minPrice = searchParams.get("min_price") || "";
  const maxPrice = searchParams.get("max_price") || "";
  const selectedRating = Number(searchParams.get("min_rating")) || 0;
  const inStock = searchParams.get("in_stock") === "true";

  const queryParams = useMemo(() => {
    const params: Record<string, string | number | boolean> = {
      page: currentPage,
      sort: currentSort,
    };
    if (categorySlug) params.category = categorySlug;
    if (searchQuery) params.search = searchQuery;
    if (selectedBrands.length > 0) params.brand_id = selectedBrands.join(",");
    if (minPrice) params.min_price = Number(minPrice);
    if (maxPrice) params.max_price = Number(maxPrice);
    if (selectedRating > 0) params.min_rating = selectedRating;
    if (inStock) params.in_stock = true;
    return params;
  }, [currentPage, currentSort, categorySlug, searchQuery, selectedBrands, minPrice, maxPrice, selectedRating, inStock]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["products", queryParams],
    queryFn: () => getProducts(queryParams),
    placeholderData: keepPreviousData,
  });

  const { data: brands = [] } = useQuery({
    queryKey: ["brands"],
    queryFn: getBrands,
    staleTime: 5 * 60 * 1000,
  });

  const brandMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const b of brands) map.set(b.id, b.name);
    return map;
  }, [brands]);

  const updateURL = useCallback(
    (key: string, value: string | number | boolean | string[]) => {
      const params = new URLSearchParams(searchParams.toString());
      if (
        value === "" ||
        value === 0 ||
        value === false ||
        (Array.isArray(value) && value.length === 0)
      ) {
        params.delete(key);
      } else if (Array.isArray(value)) {
        params.set(key, value.join(","));
      } else {
        params.set(key, String(value));
      }
      if (key !== "page") params.delete("page");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname],
  );

  const chips = useMemo(() => {
    const result: Chip[] = [];
    for (const brandId of selectedBrands) {
      const name = brandMap.get(brandId);
      if (name) result.push({ key: `brand-${brandId}`, label: name });
    }
    if (minPrice || maxPrice) {
      const label = [minPrice && `EGP ${minPrice}`, maxPrice && `EGP ${maxPrice}`]
        .filter(Boolean)
        .join(" - ");
      result.push({ key: "price", label: `Price: ${label}` });
    }
    if (selectedRating > 0) {
      result.push({ key: "rating", label: `${selectedRating} stars & up` });
    }
    if (inStock) {
      result.push({ key: "in_stock", label: "In Stock" });
    }
    return result;
  }, [selectedBrands, brandMap, minPrice, maxPrice, selectedRating, inStock]);

  const handleRemoveChip = useCallback(
    (key: string) => {
      if (key.startsWith("brand-")) {
        const brandId = key.replace("brand-", "");
        updateURL(
          "brand_id",
          selectedBrands.filter((id) => id !== brandId),
        );
      } else if (key === "price") {
        updateURL("min_price", "");
        updateURL("max_price", "");
      } else if (key === "rating") {
        updateURL("rating", 0);
      } else if (key === "in_stock") {
        updateURL("in_stock", false);
      }
    },
    [updateURL, selectedBrands],
  );

  const handleClearAll = useCallback(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    router.replace(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`, {
      scroll: false,
    });
  }, [router, pathname, searchQuery]);

  const handleBrandToggle = useCallback(
    (brandId: string) => {
      const next = selectedBrands.includes(brandId)
        ? selectedBrands.filter((id) => id !== brandId)
        : [...selectedBrands, brandId];
      updateURL("brand_id", next);
    },
    [selectedBrands, updateURL],
  );

  if (isError) {
    return <ErrorState title="Failed to load products" message={(error as Error)?.message} />;
  }

  const products = data?.data ?? [];
  const pagination = data?.pagination;

  if (!isLoading && products.length === 0) {
    return <EmptyState title="No products found" description="Try adjusting your filters" />;
  }

  const activeFilterCount = chips.length;

  const filterContent = (
    <>
      <BrandFilter
        brands={brands}
        selectedBrands={selectedBrands}
        onBrandToggle={handleBrandToggle}
      />
      <Separator />
      <PriceRangeFilter
        minPrice={minPrice}
        maxPrice={maxPrice}
        onMinChange={(v) => updateURL("min_price", v)}
        onMaxChange={(v) => updateURL("max_price", v)}
      />
      <Separator />
      <RatingFilter
        selectedRating={selectedRating}
        onRatingChange={(v) => updateURL("rating", v)}
      />
    </>
  );

  return (
    <div className="flex gap-8">
      <FilterSidebar className="hidden lg:block">
        {filterContent}
      </FilterSidebar>
      <div className="min-w-0 flex-1">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <FilterSheet activeFilterCount={activeFilterCount}>
              {filterContent}
            </FilterSheet>
            <SortDropdown currentSort={currentSort} onSortChange={(v) => updateURL("sort", v)} />
          </div>
          {pagination && !isLoading && (
            <p className="text-sm text-muted-foreground">
              {pagination.total} product{pagination.total !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        <FilterChips chips={chips} onRemove={handleRemoveChip} onClearAll={handleClearAll} />
        {isLoading ? (
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            {pagination && (
              <div className="mt-8">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.pages}
                  onPageChange={(page) => updateURL("page", page)}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export function ProductGridSkeleton() {
  return (
    <div className="flex gap-8">
      <div className="hidden w-64 shrink-0 lg:block">
        <div className="space-y-4">
          <div className="h-5 w-16 rounded bg-muted" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-4 rounded bg-muted" />
            ))}
          </div>
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
