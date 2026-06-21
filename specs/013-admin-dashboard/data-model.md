# Data Model: Admin Dashboard

## Types (TypeScript)

### Domain Types

```typescript
// Stats for a single metric (e.g. total_orders, total_revenue)
interface StatMetric {
  current: number;
  previous: number;
  change_pct: number;
}

// Status counts from by_status
interface OrdersByStatus {
  pending: number;
  confirmed: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  refunded: number;
}

// Full stats response from GET /api/admin/orders/stats
interface OrderStats {
  total_orders: StatMetric;
  total_revenue: StatMetric;
  new_customers: StatMetric;
  pending_payments: number;
  by_status: OrdersByStatus;
}

// Recent order row
interface RecentOrder {
  id: string;
  order_number: string;
  customer_name: string;
  total: number;
  status: OrderStatus;
  created_at: string;
}
```

### Period Type

```typescript
type Period = "7d" | "30d" | "90d" | "this_month" | "last_month";

const PERIODS: Period[] = ["7d", "30d", "90d", "this_month", "last_month"];

const PERIOD_LABELS: Record<Period, string> = {
  "7d": "7 أيام",
  "30d": "30 يوم",
  "90d": "90 يوم",
  "this_month": "هذا الشهر",
  "last_month": "الشهر الماضي",
};
```

### UI State Types

```typescript
type SectionState<T> =
  | { status: "idle" | "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: Error };
```

### Reused Types (Existing)

- `OrderStatus` from `@/lib/types/order` (or equivalent) — used for recent order status badge

## API Response Shapes

### `GET /api/admin/orders/stats?period=7d`

```json
{
  "total_orders": { "current": 150, "previous": 120, "change_pct": 25 },
  "total_revenue": { "current": 25000, "previous": 22000, "change_pct": 13.64 },
  "new_customers": { "current": 45, "previous": 35, "change_pct": 28.57 },
  "by_status": {
    "pending": 25,
    "confirmed": 30,
    "processing": 20,
    "shipped": 15,
    "delivered": 40,
    "cancelled": 15,
    "refunded": 5
  },
  "pending_payments": 10
}
```

### `GET /api/admin/orders?limit=5&sort=newest`

```json
{
  "data": [
    {
      "id": "uuid",
      "order_number": "ORD-001",
      "status": "pending",
      "total": 164.98,
      "item_count": 2,
      "created_at": "2026-06-01T10:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 5,
    "total": 1,
    "totalPages": 1
  }
}
```
