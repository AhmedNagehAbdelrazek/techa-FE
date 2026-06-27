"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { cn, formatPrice } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ShoppingCart, Star } from "lucide-react";
import { getProductBySlug } from "@/lib/api/products";
import type { ProductListItem } from "@/lib/types/product";
import type { ProductVariant } from "@/lib/types/product";
import { WishlistButton } from "./WishlistButton";
import { QuantitySelector } from "./QuantitySelector";
import { VariantSelector } from "./VariantSelector";
import { AddToCartButton } from "./AddToCartButton";
import { ProductInfo } from "./ProductInfo";
import { StockStatus } from "./StockStatus";
import { ProductAttributes } from "./ProductAttributes";

interface ProductCardProps {
  product: ProductListItem;
  currencySymbol?: string;
}

// ponytail: inline matching — same logic as ProductDetailClient, no shared helper
function matchingVariant(variants: ProductVariant[], options: Record<string, string>): ProductVariant | null {
  const keys = Object.keys(options);
  if (keys.length === 0) return variants.find((v) => v.is_active && v.options.length === 0) ?? null;
  return variants.find((v) => v.is_active && keys.every((k) => v.options.some((o) => o.option_name === k && o.option_value === options[k]))) ?? null;
}

function RatingStars({ average, count }: { average: number; count: number }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex" aria-label={`${average} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= Math.floor(average);
          const half = !filled && star - 0.5 <= average;
          return (
            <Star
              key={star}
              className={cn(
                "h-3.5 w-3.5",
                filled
                  ? "fill-primary text-primary"
                  : half
                    ? "fill-primary text-primary"
                    : "fill-none text-muted-foreground/30",
              )}
            />
          );
        })}
      </div>
      {count > 0 && <span className="text-secondary text-xs">({count})</span>}
    </div>
  );
}

export function ProductCard({ product }: ProductCardProps) {
  const isOutOfStock = product.stock_qty <= 0;
  const hasDiscount = product.discount_percent > 0;
  const discountedPrice = hasDiscount
    ? product.price * (1 - product.discount_percent / 100)
    : product.price;

  const [open, setOpen] = useState(false);

  const { data: detail } = useQuery({
    queryKey: ["product", product.slug],
    queryFn: () => getProductBySlug(product.slug),
    enabled: open,
  });

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [qty, setQty] = useState(1);

  const variants = detail?.variants ?? [];
  const defaultOptions = useMemo(() => {
    const first = variants.find((v) => v.is_active);
    if (!first) return {};
    return first.options.reduce<Record<string, string>>((acc, o) => {
      acc[o.option_name] = o.option_value;
      return acc;
    }, {});
    // ponytail: reset only on sheet open, not every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      setSelectedOptions(defaultOptions);
      setQty(1);
    }
  };

  const variant = useMemo(() => matchingVariant(variants, selectedOptions), [variants, selectedOptions]);
  const stockQty = variants.length > 0 ? (variant?.stock_qty ?? 0) : product.stock_qty;
  const currentPrice = variant
    ? (variant.price ?? product.price) * (1 - (variant.discount_percent ?? product.discount_percent) / 100)
    : discountedPrice;
  const maxQty = Math.max(0, stockQty);
  const safeQty = maxQty > 0 ? Math.min(qty, maxQty) : 0;

  return (
    <>
      <div className="group bg-card relative isolate flex flex-col overflow-hidden rounded-lg border border-surface-variant/50 transition-shadow duration-200 hover:shadow-sm">
        <div className="relative aspect-square bg-muted overflow-hidden">
          {product.primary_image ? (
            <Image
              src={product.primary_image.url}
              alt={product.primary_image.alt_text ?? product.name}
              fill
              className={cn("object-cover transition-transform duration-300 group-hover:scale-105", isOutOfStock && "opacity-50")}
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-muted-foreground text-sm">No image</span>
            </div>
          )}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {hasDiscount && !isOutOfStock && (
              <span className="bg-destructive/10 text-destructive font-semibold text-[10px] px-1.5 py-0.5 rounded leading-none">
                -{product.discount_percent}%
              </span>
            )}
            {product.rating_avg >= 4.5 && !isOutOfStock && (
              <span className="bg-primary text-primary-foreground font-semibold text-[10px] px-1.5 py-0.5 rounded leading-none">
                Best Seller
              </span>
            )}
            {isOutOfStock && (
              <span className="bg-muted-foreground text-primary-foreground text-[10px] px-1.5 py-0.5 rounded leading-none">
                Out of Stock
              </span>
            )}
          </div>
          <WishlistButton
            productId={product.id}
            className="absolute top-2 right-2 p-1.5 text-secondary hover:text-primary bg-background/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity border-0 shadow-none"
          />
        </div>
        <div className="flex flex-1 flex-col gap-1.5 p-3">
          {product.brand && <p className="text-secondary text-xs">{product.brand.name}</p>}
          <Link href={`/product/${product.slug}`}>
            <h3 className="line-clamp-2 text-sm font-semibold leading-snug hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>
          <RatingStars average={product.rating_avg} count={product.rating_count} />
          <div className="mt-auto flex items-end justify-between pt-1">
            <div>
              {isOutOfStock ? (
                <span className="text-secondary text-xs">Out of Stock</span>
              ) : (
                <>
                  <span className="text-lg font-bold leading-tight">{formatPrice(discountedPrice)}</span>
                  {hasDiscount && (
                    <span className="text-secondary text-xs line-through block">
                      {formatPrice(product.price)}
                    </span>
                  )}
                </>
              )}
            </div>
            <button
              aria-label="Add to Cart"
              onClick={() => handleOpenChange(true)}
              className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity active:scale-95 shrink-0"
            >
              <ShoppingCart className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent side="right" className="w-full max-w-sm flex flex-col gap-1">
          <SheetHeader>
            <SheetTitle>{detail?.name ?? product.name}</SheetTitle>
          </SheetHeader>
          {!detail ? (
            <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">Loading…</div>
          ) : (
            <div className="flex-1 flex flex-col gap-4 overflow-y-auto p-1">
              {detail.images[0] && (
                <div className="relative aspect-square w-full max-h-64 bg-muted rounded-lg overflow-hidden shrink-0">
                  <Image src={detail.images[0].url} alt={detail.images[0].alt_text ?? detail.name} fill className="object-cover" />
                </div>
              )}
              <ProductInfo
                name={detail.name}
                brand={detail.brand}
                ratingAvg={detail.rating_avg}
                ratingCount={detail.rating_count}
                price={variant?.price ?? detail.price}
                discountPercent={variant?.discount_percent ?? detail.discount_percent}
                currentPrice={currentPrice}
                aboutPoints={detail.about_points}
              />
              <StockStatus stockQty={stockQty} />
              {variants.length > 0 && (
                <VariantSelector
                  variants={variants}
                  selectedOptions={selectedOptions}
                  onSelectionChange={setSelectedOptions}
                />
              )}
              <QuantitySelector value={safeQty} onChange={setQty} max={maxQty || 99} />
              {(detail.attributes.details.length > 0 || detail.attributes.specs.length > 0) && (
                <ProductAttributes attributes={detail.attributes} />
              )}
            </div>
          )}
          <div className="p-4 border-t">
            <AddToCartButton
              productId={detail?.id ?? product.id}
              variantId={variant?.id ?? ""}
              quantity={safeQty}
              disabled={!detail || stockQty <= 0}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-surface-variant/50">
      <Skeleton className="aspect-square w-full bg-muted" />
      <div className="space-y-2 p-3">
        <Skeleton className="h-3 w-1/3 rounded" />
        <Skeleton className="h-4 w-5/6 rounded" />
        <Skeleton className="h-3 w-1/4 rounded" />
        <Skeleton className="h-5 w-1/3 rounded" />
      </div>
    </div>
  );
}
