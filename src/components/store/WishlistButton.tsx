"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/client";
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
import { addToWishlist, removeFromWishlist } from "@/lib/api/wishlist";
import React, { useId } from "react";

interface WishlistButtonProps {
  productId: string;
  className?: string;
}

export function WishlistButton({ productId, className }: WishlistButtonProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const wishlistItem = useWishlistStore(
    (s) => s.items.find((item) => item.product_id === productId) ?? null,
  );
  const isStoreLoading = useWishlistStore((s) => s.isLoading);
  const refreshWishlist = useWishlistStore((s) => s.refreshWishlist);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleAdd = useCallback(async () => {
    setIsLoading(true);
    try {
      await addToWishlist(productId);
      toast.success(t("Added to wishlist"));
      refreshWishlist();
    } catch {
      toast.error(t("Failed to update wishlist"));
    } finally {
      setIsLoading(false);
    }
  }, [productId, refreshWishlist, t]);

  const handleRemove = useCallback(async () => {
    if (!wishlistItem) return;
    setIsLoading(true);
    setConfirmOpen(false);
    try {
      await removeFromWishlist(wishlistItem.id);
      toast.success(t("Removed from wishlist"));
      refreshWishlist();
    } catch {
      toast.error(t("Failed to update wishlist"));
    } finally {
      setIsLoading(false);
    }
  }, [wishlistItem, refreshWishlist, t]);

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

  if (isStoreLoading) {
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
        variant="noBackground"
        size="icon"
        disabled={isLoading}
        onClick={handleClick}
        aria-label={wishlistItem ? t("Remove from wishlist") : t("Add to wishlist")}
        aria-pressed={!!wishlistItem}
        className={className}
      >
        <Heart
          className={cn(
            "h-4 w-4 mix-blend-difference transition-colors",
            wishlistItem ? "fill-destructive text-destructive stroke-amber-50 stroke-1" : "",
          )}
        />
      </Button>
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("Remove from wishlist?")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("This item will be removed from your wishlist.")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("Cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemove} disabled={isLoading}>
              {t("Remove")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
