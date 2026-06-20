import { request } from "./Request";
import type { Order, PlaceOrderRequest } from "@/lib/types/order";

interface OrderListResponse {
  data: Order[];
}

export async function placeOrder(data: PlaceOrderRequest): Promise<Order> {
  return request.post<Order>("/api/orders", data);
}

export async function getOrder(id: string): Promise<Order> {
  return request.get<Order>(`/api/orders/${id}`);
}

export async function getOrders(): Promise<Order[]> {
  const res = await request.get<OrderListResponse>("/api/orders");
  return res.data;
}

export async function cancelOrder(id: string): Promise<Order> {
  return request.post<Order>(`/api/orders/${id}/cancel`);
}
