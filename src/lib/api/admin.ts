import { adminRequest } from "./AdminRequest";

interface AdminLoginPayload {
  email: string;
  password: string;
}

interface AdminLoginResponse {
  token: string;
  admin: {
    id: string;
    name: string;
    email: string;
    role: string;
    permissions: string[];
  };
}

export function adminLogin(data: AdminLoginPayload): Promise<AdminLoginResponse> {
  return adminRequest.post<AdminLoginResponse>("/api/admin/auth/login", data);
}

export function getAdminProfile(): Promise<AdminLoginResponse["admin"] & { is_active: boolean; created_at: string }> {
  return adminRequest.get("/api/admin/auth/me");
}

export function adminLogout(): Promise<void> {
  return adminRequest.post("/api/admin/auth/logout");
}

export interface StatMetric {
  current: number;
  previous: number;
  change_pct: number;
}

export interface OrdersByStatus {
  pending: number;
  confirmed: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  refunded: number;
}

export interface OrderStats {
  total_orders: StatMetric;
  total_revenue: StatMetric;
  new_customers: StatMetric;
  by_status: OrdersByStatus;
  pending_payments: number;
}

export interface RecentOrder {
  id: string;
  order_number: string;
  customer_name?: string;
  status: string;
  total: number;
  created_at: string;
}

interface RecentOrdersResponse {
  data: RecentOrder[];
}

export function getOrderStats(period: string): Promise<OrderStats> {
  return adminRequest.get<OrderStats>("/api/admin/orders/stats", {
    params: { period },
  });
}

export function getRecentOrders(): Promise<RecentOrder[]> {
  return adminRequest
    .get<RecentOrdersResponse>("/api/admin/orders", {
      params: { limit: 5, sort: "newest" },
    })
    .then((res) => res.data);
}
