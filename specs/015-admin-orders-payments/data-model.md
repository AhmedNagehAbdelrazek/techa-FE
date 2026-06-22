# Data Model: Admin Orders & Payment Review

## Types (TypeScript)

```typescript
// ─── Order ────────────────────────────────────────────

interface AdminOrder {
  id: string;
  order_number: string;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  subtotal: number;
  discount: number;
  shipping_charge: number;
  total: number;
  coupon: string | null;
  notes: string;
  shipping_address: ShippingAddress;
  items: AdminOrderItem[];
  status_history: OrderStatusHistoryEntry[];
  customer: CustomerBrief;
  payments: AdminPayment[];
  created_at: string;
  updated_at: string;
}

interface AdminOrderListItem {
  id: string;
  order_number: string;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  total: number;
  item_count: number;
  customer?: CustomerBrief | null;
  created_at: string;
}

interface AdminOrderListResponse {
  data: AdminOrderListItem[];
  meta: PaginationMeta;
}

// ─── Order Status ─────────────────────────────────────

type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

type PaymentMethod = "cash_on_delivery" | "instapay" | "vodafone_cash";

interface OrderStatusHistoryEntry {
  from_status: OrderStatus | null;
  to_status: OrderStatus;
  changed_by: string | null;
  changed_at: string;
}

// ─── Order Item ───────────────────────────────────────

interface AdminOrderItem {
  id: string;
  product_id: string;
  product_name: string;
  variant_id: string | null;
  variant_label: string | null;
  qty: number;
  unit_price: number;
  total_price: number;
}

// ─── Shipping Address ─────────────────────────────────

interface ShippingAddress {
  id: string;
  full_name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  zone_id: string;
}

// ─── Customer Brief ───────────────────────────────────

interface CustomerBrief {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
}

// ─── Payment ──────────────────────────────────────────

interface AdminPayment {
  id: string;
  order_id: string;
  payment_method: PaymentMethod;
  amount: number;
  status: string;
  proof_reference: string | null;
  proof_screenshot_url: string | null;
  created_at: string;
}

// ─── Pending Payment (from /api/admin/payments/pending) ──

interface PendingPayment {
  id: string;
  order_id: string;
  payment_method: PaymentMethod;
  amount: number;
  status: string;
  proof_reference: string;
  proof_screenshot_url: string;
  created_at: string;
  Order: {
    id: string;
    order_number: string;
    status: OrderStatus;
    payment_status: PaymentStatus;
  };
  User: {
    id: string;
    full_name: string;
    email: string;
  };
}

interface PendingPaymentListResponse {
  data: PendingPayment[];
  meta: PaginationMeta;
}

// ─── Payment Action Responses ─────────────────────────

interface ApprovePaymentResponse {
  payment: {
    id: string;
    status: string;
    paid_at: string;
    reviewed_by: string;
    reviewed_at: string;
  };
  order: {
    id: string;
    order_number: string;
    status: OrderStatus;
    payment_status: PaymentStatus;
  };
}

interface RejectPaymentResponse {
  payment: {
    id: string;
    status: string;
    reviewed_by: string;
    reviewed_at: string;
    rejection_note: string;
  };
  order: {
    id: string;
    order_number: string;
    status: OrderStatus;
    payment_status: PaymentStatus;
  };
}

// ─── Status Update ────────────────────────────────────

interface UpdateOrderStatusPayload {
  status: OrderStatus;
}

// ─── Common ───────────────────────────────────────────

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface AdminOrderListParams {
  page?: number;
  limit?: number;
  status?: string;
  payment_status?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
  sort?: string;
}

interface AdminPendingPaymentListParams {
  page?: number;
  limit?: number;
}
```

## UI State Types

```typescript
type SectionState<T> =
  | { status: "idle" | "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: Error };
```

## React Query Keys

```typescript
export const adminOrdersKeys = {
  all: ["admin", "orders"] as const,
  lists: () => [...adminOrdersKeys.all, "list"] as const,
  list: (params: AdminOrderListParams) =>
    [...adminOrdersKeys.lists(), params] as const,
  details: () => [...adminOrdersKeys.all, "detail"] as const,
  detail: (id: string) => [...adminOrdersKeys.details(), id] as const,
  payments: ["admin", "payments"] as const,
  stats: ["admin", "orders", "stats"] as const,
};
```

## Table Filter State (URL Params)

Filter state is stored in URL query params (not Zustand):

| Param | Type | Description |
|-------|------|-------------|
| `status` | string | Order status filter, e.g., `pending` |
| `payment_status` | string | Payment status filter, e.g., `paid` |
| `search` | string | Search by order number or customer email |
| `date_from` | string | Start date (ISO) |
| `date_to` | string | End date (ISO) |
| `sort` | string | Sort field and direction, e.g., `created_at:desc` |
| `page` | number | Page number (default 1) |
| `limit` | number | Page size (default 20) |
