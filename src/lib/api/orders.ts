import { request } from "./Request";
import type { Order, OrdersListResponse, OrdersQueryParams, PlaceOrderRequest } from "@/lib/types/order";

export async function placeOrder(data: PlaceOrderRequest): Promise<Order> {
  return request.post<Order>("/api/orders", data);
}

export async function getOrder(id: string): Promise<Order> {
  return request.get<Order>(`/api/orders/${id}`);
}

export async function getOrders(params?: OrdersQueryParams): Promise<OrdersListResponse> {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  const qs = query.toString();
  const endpoint = qs ? `/api/orders?${qs}` : "/api/orders";
  return request.get<OrdersListResponse>(endpoint);
}

export async function cancelOrder(id: string): Promise<Order> {
  return request.post<Order>(`/api/orders/${id}/cancel`);
}
