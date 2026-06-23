# Data Model: Admin Coupons & Delivery Zones

## Types (TypeScript)

```typescript
// ─── Coupon ─────────────────────────────────────────────

interface AdminCoupon {
  id: string;
  product_id: string | null;
  product: { id: string; name: string; slug: string } | null;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_amount: number;
  max_uses: number;
  used_count: number;
  expires_at: string; // ISO 8601
  is_active: boolean;
}

interface AdminCouponListResponse {
  data: AdminCoupon[];
  meta: PaginationMeta;
}

interface AdminCouponFormData {
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  product_id: string | null;
  min_order_amount: number;
  max_uses: number;
  expires_at: string; // ISO 8601
  is_active: boolean;
}

// ─── Delivery Zone ──────────────────────────────────────

interface AdminZone {
  id: string;
  name: string;
  regions: string[];
  is_active: boolean;
  ShippingRates?: AdminShippingRate[];
}

interface AdminZoneListResponse {
  zones: AdminZone[];
}

interface AdminZoneFormData {
  name: string;
  regions: string[];
  is_active: boolean;
}

// ─── Shipping Rate ──────────────────────────────────────

interface AdminShippingRate {
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

interface AdminRatesListResponse {
  rates: AdminShippingRate[];
}

interface AdminRateFormData {
  charge: number;
  estimated_days_min: number;
  estimated_days_max: number;
  free_above_amount: number | null;
  min_order_amount: number;
  max_order_amount: number | null;
}

// ─── Shared ────────────────────────────────────────────

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
```

## State Transitions

### Coupon
- `is_active: true` → admin deactivates → `is_active: false` (soft delete)
- `is_active: false` → admin can reactivate via edit Dialog → `is_active: true`
- Coupon also becomes implicitly expired when `expires_at` passes (badge changes to "Expired" but `is_active` remains true)

### Delivery Zone
- `is_active: true` → admin deactivates → `is_active: false` (soft delete, cascade-deactivates all rates)
- `is_active: false` → admin can reactivate via edit Dialog → `is_active: true` (rates remain inactive, must be reactivated individually)

### Shipping Rate
- `is_active: true` → admin sets `is_active: false` via PUT edit → `is_active: false`
- `is_active: false` → admin can reactivate via edit Dialog → `is_active: true`
- Note: No separate delete endpoint — rates are deactivated by setting `is_active: false`

## React Query Keys

```typescript
export const adminCouponZoneKeys = {
  all: ["admin", "coupons-zones"] as const,
  coupons: () => [...adminCouponZoneKeys.all, "coupons"] as const,
  coupon: (id: string) => [...adminCouponZoneKeys.coupons(), id] as const,
  zones: () => [...adminCouponZoneKeys.all, "zones"] as const,
  zone: (id: string) => [...adminCouponZoneKeys.zones(), id] as const,
  rates: (zoneId: string) => [...adminCouponZoneKeys.zone(zoneId), "rates"] as const,
};
```

## Validation Rules (Zod)

### Coupon Form
```typescript
const couponSchema = z.object({
  code: z.string().min(1, "Code is required").max(50),
  discount_type: z.enum(["percentage", "fixed"]),
  discount_value: z.coerce.number().min(0.01, "Value must be positive"),
  product_id: z.string().nullable(),
  min_order_amount: z.coerce.number().min(0).default(0),
  max_uses: z.coerce.number().int().min(1, "Must allow at least 1 use"),
  expires_at: z.string().min(1, "Expiry date is required"),
  is_active: z.boolean().default(true),
});
```

### Zone Form
```typescript
const zoneSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  regions: z.array(z.string().min(1)).min(1, "At least one region is required"),
  is_active: z.boolean().default(true),
});
```

### Rate Form
```typescript
const rateSchema = z.object({
  charge: z.coerce.number().min(0, "Charge must be non-negative"),
  estimated_days_min: z.coerce.number().int().min(1),
  estimated_days_max: z.coerce.number().int().min(1),
  free_above_amount: z.coerce.number().nullable(),
  min_order_amount: z.coerce.number().min(0).default(0),
  max_order_amount: z.coerce.number().nullable(),
});
```

## API Endpoint Summary

| Resource | Method | Endpoint | Request Body | Response |
|----------|--------|----------|-------------|----------|
| Coupons | GET | `/api/admin/coupons?page=&limit=` | — | `AdminCouponListResponse` |
| Coupons | POST | `/api/admin/coupons` | `AdminCouponFormData` | `AdminCoupon` |
| Coupons | PUT | `/api/admin/coupons/:id` | Partial `AdminCouponFormData` | `AdminCoupon` |
| Coupons | DELETE | `/api/admin/coupons/:id` | — | `{ message }` |
| Zones | GET | `/api/admin/delivery-zones` | — | `AdminZoneListResponse` |
| Zones | GET | `/api/admin/delivery-zones/:id` | — | `AdminZone` (with rates) |
| Zones | POST | `/api/admin/delivery-zones` | `AdminZoneFormData` | `AdminZone` |
| Zones | PUT | `/api/admin/delivery-zones/:id` | Partial `AdminZoneFormData` | `AdminZone` |
| Zones | DELETE | `/api/admin/delivery-zones/:id` | — | `{ message }` |
| Rates | GET | `/api/admin/delivery-zones/:id/rates` | — | `AdminRatesListResponse` |
| Rates | POST | `/api/admin/delivery-zones/:id/rates` | `AdminRateFormData` | `AdminShippingRate` |
| Rates | PUT | `/api/admin/rates/:id` | Partial `AdminRateFormData` | `AdminShippingRate` |
