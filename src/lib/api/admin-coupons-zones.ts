import { adminRequest } from "./AdminRequest";

// ─── Coupons ──────────────────────────────────────────

export interface AdminCoupon {
  id: string;
  product_id: string | null;
  product: { id: string; name: string; slug: string } | null;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_amount: number;
  max_uses: number;
  used_count: number;
  expires_at: string;
  is_active: boolean;
}

export interface AdminCouponListResponse {
  data: AdminCoupon[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export function getAdminCoupons(params: {
  page?: number;
  limit?: number;
}): Promise<AdminCouponListResponse> {
  return adminRequest.get<AdminCouponListResponse>("/api/admin/coupons", { params });
}

export function createAdminCoupon(data: {
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  product_id?: string | null;
  min_order_amount?: number;
  max_uses?: number;
  expires_at: string;
  is_active?: boolean;
}): Promise<AdminCoupon> {
  return adminRequest.post<AdminCoupon>("/api/admin/coupons", data);
}

export function updateAdminCoupon(
  id: string,
  data: Partial<{
    code: string;
    discount_type: "percentage" | "fixed";
    discount_value: number;
    product_id: string | null;
    min_order_amount: number;
    max_uses: number;
    expires_at: string;
    is_active: boolean;
  }>,
): Promise<AdminCoupon> {
  return adminRequest.put<AdminCoupon>(`/api/admin/coupons/${id}`, data);
}

export function deactivateAdminCoupon(id: string): Promise<void> {
  return adminRequest.delete<void>(`/api/admin/coupons/${id}`);
}

// ─── Zones ────────────────────────────────────────────

export interface AdminZone {
  id: string;
  name: string;
  regions: string[];
  is_active: boolean;
  ShippingRates?: AdminShippingRate[];
}

export interface AdminZoneListResponse {
  zones: AdminZone[];
}

export function getAdminZones(): Promise<AdminZoneListResponse> {
  return adminRequest.get<AdminZoneListResponse>("/api/admin/delivery-zones");
}

export function getAdminZone(id: string): Promise<AdminZone> {
  return adminRequest.get<AdminZone>(`/api/admin/delivery-zones/${id}`);
}

export function createAdminZone(data: {
  name: string;
  regions: string[];
  is_active?: boolean;
}): Promise<AdminZone> {
  return adminRequest.post<AdminZone>("/api/admin/delivery-zones", data);
}

export function updateAdminZone(
  id: string,
  data: Partial<{ name: string; regions: string[]; is_active: boolean }>,
): Promise<AdminZone> {
  return adminRequest.put<AdminZone>(`/api/admin/delivery-zones/${id}`, data);
}

export function deactivateAdminZone(id: string): Promise<void> {
  return adminRequest.delete<void>(`/api/admin/delivery-zones/${id}`);
}

// ─── Shipping Rates ───────────────────────────────────

export interface AdminShippingRate {
  id: string;
  delivery_zone_id: string;
  charge: number;
  estimated_days_min: number;
  estimated_days_max: number;
  free_above_amount: number | null;
  min_order_amount: number;
  max_order_amount: number | null;
  is_active: boolean;
}

export function getAdminRates(zoneId: string): Promise<{ rates: AdminShippingRate[] }> {
  return adminRequest.get<{ rates: AdminShippingRate[] }>(
    `/api/admin/delivery-zones/${zoneId}/rates`,
  );
}

export function createAdminRate(
  zoneId: string,
  data: {
    charge: number;
    estimated_days_min: number;
    estimated_days_max: number;
    free_above_amount?: number | null;
    min_order_amount?: number;
    max_order_amount?: number | null;
  },
): Promise<AdminShippingRate> {
  return adminRequest.post<AdminShippingRate>(
    `/api/admin/delivery-zones/${zoneId}/rates`,
    data,
  );
}

export function updateAdminRate(
  id: string,
  data: Partial<{
    charge: number;
    estimated_days_min: number;
    estimated_days_max: number;
    free_above_amount: number | null;
    min_order_amount: number;
    max_order_amount: number | null;
    is_active: boolean;
  }>,
): Promise<AdminShippingRate> {
  return adminRequest.put<AdminShippingRate>(`/api/admin/rates/${id}`, data);
}

// ─── Query Keys ───────────────────────────────────────

export const adminCouponZoneKeys = {
  all: ["admin", "coupons-zones"] as const,
  coupons: () => [...adminCouponZoneKeys.all, "coupons"] as const,
  coupon: (id: string) => [...adminCouponZoneKeys.coupons(), id] as const,
  zones: () => [...adminCouponZoneKeys.all, "zones"] as const,
  zone: (id: string) => [...adminCouponZoneKeys.zones(), id] as const,
  rates: (zoneId: string) => [...adminCouponZoneKeys.zone(zoneId), "rates"] as const,
};
