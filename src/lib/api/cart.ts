import { request } from "./Request";
import type { Cart, AddItemRequest, ApplyCouponRequest } from "@/lib/types/cart";

export async function getCart(): Promise<Cart> {
  return request.get<Cart>("/api/cart");
}

export async function addItem(data: AddItemRequest): Promise<Cart> {
  return request.post<Cart>("/api/cart/items", data);
}

export async function updateItemQty(itemId: string, qty: number): Promise<Cart> {
  return request.put<Cart>(`/api/cart/items/${itemId}`, { qty });
}

export async function removeItem(itemId: string): Promise<Cart> {
  return request.delete<Cart>(`/api/cart/items/${itemId}`);
}

export async function applyCoupon(data: ApplyCouponRequest): Promise<Cart> {
  return request.post<Cart>("/api/cart/coupon", data);
}

export async function removeCoupon(): Promise<Cart> {
  return request.delete<Cart>("/api/cart/coupon");
}
