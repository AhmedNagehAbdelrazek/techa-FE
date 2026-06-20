import { request } from "./Request";
import type { Order, PlaceOrderRequest } from "@/lib/types/order";

export async function placeOrder(data: PlaceOrderRequest): Promise<Order> {
  return request.post<Order>("/api/orders", data);
}

export async function getOrder(id: string): Promise<Order> {
  return request.get<Order>(`/api/orders/${id}`);
}

export async function getOrders(): Promise<Order[]> {
  return request.get<Order[]>("/api/orders");
}

export async function cancelOrder(id: string): Promise<Order> {
  return request.post<Order>(`/api/orders/${id}/cancel`);
}
