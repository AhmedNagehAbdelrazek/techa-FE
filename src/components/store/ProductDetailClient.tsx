"use client";

import { useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ProductImages } from "./ProductImages";
import { ProductInfo } from "./ProductInfo";
import { StockStatus } from "./StockStatus";
import { QuantitySelector } from "./QuantitySelector";
import { VariantSelector } from "./VariantSelector";
import { AddToCartButton } from "./AddToCartButton";
import { ProductAttributes } from "./ProductAttributes";
import { ReviewList } from "./ReviewList";
import { useCartStore } from "@/lib/stores/cart.store";
import type { ProductDetail, ProductVariant } from "@/lib/types/product";
import { Truck, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

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
    const price = variant.price ?? product.price;
    const discount = variant.discount_percent ?? product.discount_percent;
    return discount > 0 ? price * (1 - discount / 100) : price;
  }
  return product.discount_percent > 0
    ? product.price * (1 - product.discount_percent / 100)
    : product.price;
}

function computePrice (product: ProductDetail, variant: ProductVariant | null): number {
  if (variant) {
    return variant.price ?? product.price;
  }
  return product.price;
}

function computeStockQty(product: ProductDetail, variant: ProductVariant | null): number {
  if (product.variants.length > 0) {
    if (!variant) return 0;
    return variant.stock_qty ?? 0;
  }
  return 0;
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

  const matchingVariant = useMemo(
    () => computeMatchingVariant(product.variants, selectedOptions),
    [product.variants, selectedOptions],
  );

  const currentPrice = useMemo(
    () => computeCurrentPrice(product, matchingVariant),
    [product, matchingVariant],
  );

  const price = useMemo(() => {
    return computePrice(product, matchingVariant);
  }, [product, matchingVariant]);

  const stockQty = useMemo(
    () => computeStockQty(product, matchingVariant),
    [product, matchingVariant],
  );

  const maxQty = Math.max(0, stockQty);
  const safeQuantity = maxQty > 0 ? Math.min(quantity, maxQty) : 0;

  const hasVariants = product.variants.length > 0;
  const hasFullSelection = hasVariants ? matchingVariant !== null : true;
  const isOutOfStock = stockQty <= 0;

  const addToCartDisabled = isOutOfStock || !hasFullSelection;
  const disableReason = !hasFullSelection && hasVariants ? "Please select options" : undefined;

  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const [buying, setBuying] = useState(false);

  const handleBuyNow = useCallback(async () => {
    if (addToCartDisabled || buying) return;
    setBuying(true);
    try {
      await addItem({ product_id: product.id, variant_id: matchingVariant?.id ?? "", qty: safeQuantity });
      router.push("/cart");
    } catch {
      toast.error("Failed to add to cart");
      setBuying(false);
    }
  }, [addToCartDisabled, buying, addItem, product.id, matchingVariant, safeQuantity, router]);

  const handleVariantChange = useCallback(
    (options: Record<string, string>) => {
      setSelectedOptions(options);
      setQuantity(1);
    },
    [],
  );

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        <div className="lg:col-span-7">
          <ProductImages
            images={product.images}
            selectedVariantImages={matchingVariant?.images}
            productName={product.name}
          />
        </div>
        <div className="lg:col-span-5 flex flex-col gap-5">
          <ProductInfo
            name={product.name}
            brand={product.brand}
            ratingAvg={product.rating_avg}
            ratingCount={product.rating_count}
            price={price}
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

          <div className="flex flex-col gap-3">
            <AddToCartButton
              productId={product.id}
              variantId={matchingVariant?.id ?? ""}
              quantity={safeQuantity}
              disabled={addToCartDisabled}
              disableReason={disableReason}
            />
            <button
              onClick={handleBuyNow}
              disabled={addToCartDisabled || buying}
              className="w-full border border-foreground text-foreground bg-card hover:bg-muted text-sm font-semibold py-3 px-5 rounded transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-lg">⚡</span>
              {buying ? "Adding…" : "Buy Now"}
            </button>
          </div>

          <div className="flex items-center gap-4 border-t border-border pt-4 text-sm text-secondary">
            <span className="flex items-center gap-1.5">
              <Truck className="h-4 w-4" /> Free Delivery
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4" /> 1 Year Warranty
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {(product.attributes.details.length > 0 || product.attributes.specs.length > 0) && (
          <div className="bg-card border border-border rounded-lg p-5">
            <h2 className="text-xl font-semibold mb-4">Detailed Specifications</h2>
            <ProductAttributes attributes={product.attributes} />
          </div>
        )}
        <div className="bg-card border border-border rounded-lg p-5">
          <h2 className="text-xl font-semibold mb-4">Customer Reviews</h2>
          <ReviewList productId={product.id} initialReviews={product.reviews} />
        </div>
      </div>
    </div>
  );
}
