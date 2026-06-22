"use client";

import { useMemo, useState, useCallback } from "react";
import { Separator } from "@/components/ui/separator";
import { ProductImages } from "./ProductImages";
import { ProductInfo } from "./ProductInfo";
import { StockStatus } from "./StockStatus";
import { QuantitySelector } from "./QuantitySelector";
import { VariantSelector } from "./VariantSelector";
import { AddToCartButton } from "./AddToCartButton";
import { WishlistButton } from "./WishlistButton";
import { CouponInput } from "./CouponInput";
import { ProductAttributes } from "./ProductAttributes";
import { ReviewList } from "./ReviewList";
import type { ProductDetail, ProductVariant } from "@/lib/types/product";
import type { CouponValidationResponse } from "@/lib/api/coupons";

interface ProductDetailClientProps {
  product: ProductDetail;
}

function computeMatchingVariant(variants: ProductVariant[], selectedOptions: Record<string, string>): ProductVariant | null {
  const keys = Object.keys(selectedOptions);
  if (keys.length === 0) {
    return variants.find((v) => v.is_active && v.options.length === 0) ?? null;
  }
  return variants.find((v) =>
    v.is_active &&
    keys.every((key) =>
      v.options.some((o) => o.option_name === key && o.option_value === selectedOptions[key]),
    ),
  ) ?? null;
}

function computeCurrentPrice(product: ProductDetail, variant: ProductVariant | null): number {
  if (variant) {
    const price = variant.price ?? product.base_price;
    const discount = variant.discount_percent ?? product.discount_percent;
    return discount > 0 ? price * (1 - discount / 100) : price;
  }
  return product.discount_percent > 0
    ? product.base_price * (1 - product.discount_percent / 100)
    : product.base_price;
}

function computeStockQty(product: ProductDetail, variant: ProductVariant | null): number {
  if (product.variants.length > 0) {
    if (!variant) return 0;
    return variant.stock_qty;
  }
  return 1;
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const defaultOptions = useMemo(() => {
    const first = product.variants.find((v) => v.is_active);
    if (!first) return {};
    return first.options.reduce<Record<string, string>>((acc, o) => {
      acc[o.option_name] = o.option_value;
      return acc;
    }, {});
  }, [product.variants]);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(defaultOptions);
  const [quantity, setQuantity] = useState(1);
  const [appliedCoupon, setAppliedCoupon] = useState<CouponValidationResponse | null>(null);

  const matchingVariant = useMemo(
    () => computeMatchingVariant(product.variants, selectedOptions),
    [product.variants, selectedOptions],
  );

  const currentPrice = useMemo(
    () => computeCurrentPrice(product, matchingVariant),
    [product, matchingVariant],
  );

  const stockQty = useMemo(
    () => computeStockQty(product, matchingVariant),
    [product, matchingVariant],
  );

  const maxQty = Math.max(0, stockQty);
  const safeQuantity = Math.min(quantity, Math.max(1, maxQty));

  const hasVariants = product.variants.length > 0;
  const hasFullSelection = hasVariants ? matchingVariant !== null : true;
  const isOutOfStock = stockQty <= 0;

  const addToCartDisabled = isOutOfStock || !hasFullSelection;
  const disableReason = !hasFullSelection && hasVariants ? "Please select options" : undefined;

  const handleVariantChange = useCallback(
    (options: Record<string, string>) => {
      setSelectedOptions(options);
      setQuantity(1);
      if (appliedCoupon) {
        const newVariant = computeMatchingVariant(product.variants, options);
        if (newVariant) {
          setAppliedCoupon(null);
        }
      }
    },
    [product.variants, appliedCoupon],
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        <ProductImages
          images={product.images}
          selectedVariantImages={matchingVariant?.images}
          productName={product.name}
        />
        <div className="flex flex-col gap-6">
          <ProductInfo
            name={product.name}
            brand={product.brand}
            ratingAvg={product.rating_avg}
            ratingCount={product.rating_count}
            basePrice={product.base_price}
            discountPercent={matchingVariant?.discount_percent ?? product.discount_percent}
            currentPrice={currentPrice}
            aboutPoints={product.about_points}
          />

          <StockStatus stockQty={stockQty} />

          {hasVariants && (
            <VariantSelector
              variants={product.variants}
              selectedOptions={selectedOptions}
              onSelectionChange={handleVariantChange}
            />
          )}

          <QuantitySelector
            value={safeQuantity}
            onChange={setQuantity}
            max={maxQty}
            disabled={isOutOfStock || !hasFullSelection}
          />

          <div className="flex items-start gap-2">
            <div className="flex-1">
              <AddToCartButton
                productId={product.id}
                variantId={matchingVariant?.id ?? null}
                quantity={safeQuantity}
                disabled={addToCartDisabled}
                disableReason={disableReason}
              />
            </div>
            <WishlistButton productId={product.id} />
          </div>

          <CouponInput
            productId={product.id}
            variantId={matchingVariant?.id}
            appliedCoupon={appliedCoupon}
            onCouponApplied={setAppliedCoupon}
          />
        </div>
      </div>

      {(product.attributes.details.length > 0 || product.attributes.specs.length > 0) && (
        <>
          <Separator className="my-10" />
          <ProductAttributes attributes={product.attributes} />
        </>
      )}

      <Separator className="my-10" />
      <section>
        <h2 className="mb-6 text-xl font-bold">Customer Reviews</h2>
        <ReviewList productId={product.id} initialReviews={product.reviews} />
      </section>
    </div>
  );
}
