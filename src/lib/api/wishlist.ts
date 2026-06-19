import { request } from "./Request";

export interface WishlistItem {
  id: string;
  product_id: string;
  variant_id: string | null;
}

export async function getWishlist(): Promise<WishlistItem[]> {
  const data = await request.get<unknown[] | { data?: unknown[] }>("/api/wishlist");
  return Array.isArray(data) ? (data as WishlistItem[]) : ((data as { data?: WishlistItem[] }).data ?? []);
}

export async function addToWishlist(productId: string, variantId?: string | null): Promise<void> {
  await request.post("/api/wishlist", { product_id: productId, variant_id: variantId ?? null });
}

export async function removeFromWishlist(wishlistId: string): Promise<void> {
  await request.delete(`/api/wishlist/${wishlistId}`);
}
