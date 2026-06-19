"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useWishlistStore } from "@/lib/stores/wishlist.store";
import { addToWishlist, removeFromWishlist, getWishlist } from "@/lib/api/wishlist";
import type { WishlistItem } from "@/lib/api/wishlist";

interface WishlistButtonProps {
  productId: string;
  className?: string;
}

export function WishlistButton({ productId , className}: WishlistButtonProps) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const fetchWishlist = useWishlistStore((s) => s.fetchWishlist);
  const [wishlistItem, setWishlistItem] = useState<WishlistItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsInitialLoading(false);
      return;
    }
    getWishlist()
      .then((items) => {
        const found = items.find((item) => item.product_id === productId) ?? null;
        setWishlistItem(found);
      })
      .catch(() => setWishlistItem(null))
      .finally(() => setIsInitialLoading(false));
  }, [isAuthenticated, productId]);

  const handleToggle = useCallback(async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    setIsLoading(true);
    try {
      if (wishlistItem) {
        await removeFromWishlist(wishlistItem.id);
        setWishlistItem(null);
        toast.success("Removed from wishlist");
      } else {
        await addToWishlist(productId);
        const items = await getWishlist();
        const found = items.find((item) => item.product_id === productId) ?? null;
        setWishlistItem(found);
        toast.success("Added to wishlist");
      }
      fetchWishlist();
    } catch {
      toast.error("Failed to update wishlist");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, productId, wishlistItem, router, fetchWishlist]);

  if (isInitialLoading) {
    return (
      <Button type="button" variant="outline" size="icon" disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      disabled={isLoading}
      onClick={handleToggle}
      aria-label={wishlistItem ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={!!wishlistItem}
      className={className}
    >
      <Heart
        className={cn(
          "h-4 w-4 transition-colors",
          wishlistItem ? "fill-destructive text-destructive" : "",
        )}
      />
    </Button>
  );
}
