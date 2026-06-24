"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { getWishlistDetail, removeFromWishlist } from "@/lib/api/wishlist";
import { addItem } from "@/lib/api/cart";
import { useWishlistStore } from "@/lib/stores/wishlist.store";
import { useCartStore } from "@/lib/stores/cart.store";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import Link from "next/link";
import { WishlistCard, WishlistCardSkeleton } from "./WishlistCard";
import { useTranslation } from "@/lib/i18n/client";
import type { WishlistItemWithProduct } from "@/lib/types/wishlist";

export function WishlistPageClient() {
  const [items, setItems] = useState<WishlistItemWithProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());
  const [addingIds, setAddingIds] = useState<Set<string>>(new Set());
  const fetchWishlist = useWishlistStore((s) => s.fetchWishlist);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const { t } = useTranslation();

  const loadWishlist = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getWishlistDetail();
      setItems(data);
    } catch {
      setError(t("Failed to load wishlist"));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  const handleRemove = useCallback(
    async (wishlistId: string) => {
      setRemovingIds((prev) => new Set(prev).add(wishlistId));
      const previousItems = items;
      setItems((prev) => prev.filter((item) => item.id !== wishlistId));
      try {
        await removeFromWishlist(wishlistId);
        toast.success(t("Removed from wishlist"));
        fetchWishlist();
      } catch {
        setItems(previousItems);
        toast.error(t("Failed to remove from wishlist"));
      } finally {
        setRemovingIds((prev) => {
          const next = new Set(prev);
          next.delete(wishlistId);
          return next;
        });
      }
    },
    [items, fetchWishlist, t],
  );

  const handleAddToCart = useCallback(
    async (wishlistId: string) => {
      const item = items.find((i) => i.id === wishlistId);
      if (!item) return;
      setAddingIds((prev) => new Set(prev).add(wishlistId));
      try {
        await addItem({
          product_id: item.product_id,
          variant_id: item.variant_id!,
          qty: 1,
        });
        toast.success(t("Added to cart"));
        fetchCart();
        fetchWishlist();
      } catch {
        toast.error(t("Failed to add to cart"));
      } finally {
        setAddingIds((prev) => {
          const next = new Set(prev);
          next.delete(wishlistId);
          return next;
        });
      }
    },
    [items, fetchCart, fetchWishlist, t],
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <WishlistCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return <ErrorState title={t("Unable to load wishlist")} message={error} onRetry={loadWishlist} />;
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title={t("Your wishlist is empty")}
        description={t("Save items you love by tapping the heart icon on any product.")}
        action={
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            {t("Start Shopping")}
          </Link>
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => (
        <WishlistCard
          key={item.id}
          item={item}
          onRemove={handleRemove}
          onAddToCart={handleAddToCart}
          isRemoving={removingIds.has(item.id)}
          isAddingToCart={addingIds.has(item.id)}
        />
      ))}
    </div>
  );
}
