"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getProducts, getOnSaleProducts } from "@/lib/api/products";
import { getBrands } from "@/lib/api/brands";
import { getCategoryTree } from "@/lib/api/categories";
import type { Category } from "@/lib/types/category";
import { ProductCard, ProductCardSkeleton } from "@/components/store/ProductCard";
import { Pagination } from "@/components/store/Pagination";
import { SortDropdown } from "@/components/store/SortDropdown";
import { BrandFilter } from "@/components/store/BrandFilter";
import { PriceRangeFilter } from "@/components/store/PriceRangeFilter";
import { RatingFilter } from "@/components/store/RatingFilter";
import { FilterSidebar } from "@/components/store/FilterSidebar";
import { FilterSheet } from "@/components/store/FilterSheet";
import { FilterChips } from "@/components/store/FilterChips";
import { CategoryFilter } from "@/components/store/CategoryFilter";
import type { Chip } from "@/components/store/FilterChips";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { Search } from "lucide-react";

interface ProductGridProps {
  categorySlug?: string;
  searchQuery?: string;
  onSale?: boolean;
}

export function ProductGrid({ categorySlug, searchQuery, onSale }: ProductGridProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const currentPage = Number(searchParams.get("page")) || 1;
  const currentSort = searchParams.get("sort") || "newest";
  const brandsStr = searchParams.get("brand") ?? "";
  const selectedBrands = useMemo(() => brandsStr ? brandsStr.split(",").filter(Boolean) : [], [brandsStr]);
  const minPrice = searchParams.get("min_price") || "";
  const maxPrice = searchParams.get("max_price") || "";
  const selectedRating = Number(searchParams.get("min_rating")) || 0;
  const inStock = searchParams.get("in_stock") === "true";
  const categoriesStr = searchParams.get("category") ?? "";
  const selectedCategories = useMemo(() => categoriesStr ? categoriesStr.split(",").filter(Boolean) : [], [categoriesStr]);

  const queryParams = useMemo(() => {
    const params: Record<string, string | number | boolean> = {
      page: currentPage,
      sort: currentSort,
    };
    if (selectedCategories.length > 0) params.category = selectedCategories.join(",");
    else if (categorySlug) params.category = categorySlug;
    if (searchQuery) params.search = searchQuery;
    if (selectedBrands.length > 0) params.brand = selectedBrands.join(",");
    if (minPrice) params.min_price = Number(minPrice);
    if (maxPrice) params.max_price = Number(maxPrice);
    if (selectedRating > 0) params.min_rating = selectedRating;
    if (inStock) params.in_stock = true;
    return params;
  }, [currentPage, currentSort, categorySlug, searchQuery, selectedCategories, selectedBrands, minPrice, maxPrice, selectedRating, inStock]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: [onSale ? "on-sale-products" : "products", queryParams],
    queryFn: () => onSale ? getOnSaleProducts(queryParams) : getProducts(queryParams),
    placeholderData: keepPreviousData,
  });

  const { data: brands = [] } = useQuery({
    queryKey: ["brands"],
    queryFn: getBrands,
    staleTime: 5 * 60 * 1000,
  });

  const { data: categoryTree = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategoryTree,
    staleTime: 5 * 60 * 1000,
  });

//   flat DFS yield — one function, no extra file
const flattenTree = useCallback(function flatten(node: Category[], depth: number): { id: string; name: string; depth: number }[] {
  const out: { id: string; name: string; depth: number }[] = [];
  for (const cat of node) {
    out.push({ id: cat.id, name: cat.name, depth });
    if (cat.children.length) out.push(...flatten(cat.children, depth + 1));
  }
  return out;
}, []);

const flatCategories = useMemo(() => flattenTree(categoryTree, 0), [categoryTree, flattenTree]);

const categoryMap = useMemo(() => {
  const map = new Map<string, string>();
  for (const cat of flatCategories) map.set(cat.id, cat.name);
  return map;
}, [flatCategories]);

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
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [searchParams, router, pathname],
  );

  const chips = useMemo(() => {
    const result: Chip[] = [];
    for (const catId of selectedCategories) {
      const name = categoryMap.get(catId);
      if (name) result.push({ key: `cat-${catId}`, label: name });
    }
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
  }, [selectedCategories, categoryMap, selectedBrands, brandMap, minPrice, maxPrice, selectedRating, inStock]);

  const handleRemoveChip = useCallback(
    (key: string) => {
      if (key.startsWith("cat-")) {
        const catId = key.replace("cat-", "");
        updateURL("category", selectedCategories.filter((id) => id !== catId));
      } else if (key.startsWith("brand-")) {
        const brandId = key.replace("brand-", "");
        updateURL(
          "brand",
          selectedBrands.filter((id) => id !== brandId),
        );
      } else if (key === "price") {
        //   single atomic URL update instead of two separate replace calls
        const params = new URLSearchParams(searchParams.toString());
        params.delete("min_price");
        params.delete("max_price");
        params.delete("page");
        const qs = params.toString();
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      } else if (key === "rating") {
        updateURL("min_rating", 0);
      } else if (key === "in_stock") {
        updateURL("in_stock", false);
      }
    },
    [updateURL, selectedCategories, selectedBrands, searchParams, pathname, router],
  );

  const handleClearAll = useCallback(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    router.replace(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`, {
      scroll: false,
    });
  }, [router, pathname, searchQuery]);

  const handleCategoryToggle = useCallback(
    (catId: string) => {
      const next = selectedCategories.includes(catId)
        ? selectedCategories.filter((id) => id !== catId)
        : [...selectedCategories, catId];
      updateURL("category", next);
    },
    [selectedCategories, updateURL],
  );

  const handleBrandToggle = useCallback(
    (brandId: string) => {
      const next = selectedBrands.includes(brandId)
        ? selectedBrands.filter((id) => id !== brandId)
        : [...selectedBrands, brandId];
      updateURL("brand", next);
    },
    [selectedBrands, updateURL],
  );

  const [searchInput, setSearchInput] = useState(searchQuery ?? "");

  useEffect(() => {
    setSearchInput(searchQuery ?? "");
  }, [searchQuery]);

  useEffect(() => {
    if (searchQuery === undefined) return;
    const timer = setTimeout(() => {
      if (searchInput !== searchQuery) {
        updateURL("search", searchInput);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput, searchQuery, updateURL]);

  if (isError) {
    return <ErrorState title="Failed to load products" message={(error as Error)?.message} />;
  }

  const products = data?.data ?? [];
  const pagination = data?.pagination;

  const activeFilterCount = chips.length;

  const filterContent = (
    <>
      {searchQuery !== undefined && (
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-8"
          />
        </div>
      )}
      <CategoryFilter
        categories={flatCategories}
        selectedCategories={selectedCategories}
        onCategoryToggle={handleCategoryToggle}
      />
      <Separator />
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
            onRatingChange={(v) => updateURL("min_rating", v)}
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
        ) : products.length === 0 ? (
          //   empty state only replaces grid content, filters stay visible
          <div className="mt-4">
            <EmptyState title="No products found" description="Try adjusting your filters" />
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
                  totalPages={pagination.totalPages}
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
