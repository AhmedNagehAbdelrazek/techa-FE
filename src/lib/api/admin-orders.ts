import { adminRequest } from "./AdminRequest";

// ─── Types ─────────────────────────────────────────────

export interface AdminOrderListItem {
  id: string;
  order_number: string;
  status: string;
  payment_method: string;
  payment_status: string;
  total: number;
  item_count: number;
  customer?: { id: string; full_name: string; email: string } | null;
  created_at: string;
}

export interface AdminOrderListResponse {
  data: AdminOrderListItem[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export interface AdminOrderDetail {
  id: string;
  order_number: string;
  status: string;
  payment_method: string;
  payment_status: string;
  subtotal: number;
  discount: number;
  shipping_charge: number;
  total: number;
  coupon: string | null;
  notes: string;
  shipping_address: {
    id: string;
    full_name: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
    zone_id: string;
  };
  items: Array<{
    id: string;
    product_id: string;
    product_name: string;
    variant_id: string | null;
    variant_label: string | null;
    qty: number;
    unit_price: number;
    total_price: number;
  }>;
  status_history: Array<{
    from_status: string | null;
    to_status: string;
    changed_by: string | null;
    changed_at: string;
  }>;
  customer: { id: string; full_name: string; email: string; phone: string };
  payments: Array<{
    id: string;
    payment_method: string;
    amount: number;
    status: string;
    proof_reference: string | null;
    proof_screenshot_url: string | null;
    created_at: string;
  }>;
  created_at: string;
  updated_at: string;
}

export interface PendingPayment {
  id: string;
  order_id: string;
  payment_method: string;
  amount: number;
  status: string;
  proof_reference: string;
  proof_screenshot_url: string;
  created_at: string;
  Order: {
    id: string;
    order_number: string;
    status: string;
    payment_status: string;
    User: { id: string; name: string; email: string };
  };
}

export interface PendingPaymentListResponse {
  data: PendingPayment[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export interface AdminOrderListParams {
  page?: number;
  limit?: number;
  status?: string;
  payment_status?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
  sort?: string;
}

// ─── Query Keys ─────────────────────────────────────────

export const adminOrdersKeys = {
  all: ["admin", "orders"] as const,
  lists: () => [...adminOrdersKeys.all, "list"] as const,
  list: (params: AdminOrderListParams) => [...adminOrdersKeys.lists(), params] as const,
  details: () => [...adminOrdersKeys.all, "detail"] as const,
  detail: (id: string) => [...adminOrdersKeys.details(), id] as const,
  payments: ["admin", "payments"] as const,
};

// ─── Orders API ─────────────────────────────────────────

export function getOrders(params: AdminOrderListParams = {}): Promise<AdminOrderListResponse> {
  const clearParams = Object.fromEntries(
    Object.entries(params).map(([k, v]) => [k, v === "" ? undefined : v]),
  );
  return adminRequest.get<AdminOrderListResponse>("/api/admin/orders", { params: clearParams });
}

export function getOrderDetail(id: string): Promise<AdminOrderDetail> {
  return adminRequest.get<AdminOrderDetail>(`/api/admin/orders/${id}`);
}

export function updateOrderStatus(id: string, status: string): Promise<AdminOrderDetail> {
  return adminRequest.put<AdminOrderDetail>(`/api/admin/orders/${id}/status`, { status });
}

// ─── Payments API ───────────────────────────────────────

export function getPendingPayments(page = 1, limit = 20): Promise<PendingPaymentListResponse> {
  return adminRequest.get<PendingPaymentListResponse>("/api/admin/payments/pending", {
    params: { page, limit },
  });
}

export function approvePayment(id: string): Promise<void> {
  return adminRequest.put<void>(`/api/admin/payments/${id}/approve`);
}

export function rejectPayment(id: string, rejection_note: string): Promise<void> {
  return adminRequest.put<void>(`/api/admin/payments/${id}/reject`, { rejection_note });
}
