"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
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
  const [confirmOpen, setConfirmOpen] = useState(false);

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

  const handleAdd = useCallback(async () => {
    setIsLoading(true);
    try {
      await addToWishlist(productId);
      const items = await getWishlist();
      const found = items.find((item) => item.product_id === productId) ?? null;
      setWishlistItem(found);
      toast.success("Added to wishlist");
      fetchWishlist();
    } catch {
      toast.error("Failed to update wishlist");
    } finally {
      setIsLoading(false);
    }
  }, [productId, fetchWishlist]);

  const handleRemove = useCallback(async () => {
    if (!wishlistItem) return;
    setIsLoading(true);
    setConfirmOpen(false);
    try {
      await removeFromWishlist(wishlistItem.id);
      setWishlistItem(null);
      toast.success("Removed from wishlist");
      fetchWishlist();
    } catch {
      toast.error("Failed to update wishlist");
    } finally {
      setIsLoading(false);
    }
  }, [wishlistItem, fetchWishlist]);

  const handleClick = useCallback(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (wishlistItem) {
      setConfirmOpen(true);
    } else {
      handleAdd();
    }
  }, [isAuthenticated, wishlistItem, router, handleAdd]);

  if (isInitialLoading) {
    return (
      <Button type="button" variant="outline" size="icon" disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="icon"
        disabled={isLoading}
        onClick={handleClick}
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
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from wishlist?</AlertDialogTitle>
            <AlertDialogDescription>
              This item will be removed from your wishlist.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemove} disabled={isLoading}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
