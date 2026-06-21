# Implementation Plan: Admin Dashboard

**Branch**: `013-admin-dashboard` | **Date**: 2026-06-21 | **Spec**: `specs/013-admin-dashboard/spec.md`

## Summary

Create the admin dashboard landing page (`/admin`) with four metric cards (Total Orders, Total Revenue, New Customers, Pending Orders), a donut chart showing order distribution by status, and a recent orders table. Add a period selector (`7d`, `30d`, `90d`, `this_month`, `last_month`) that re-fetches stats. Each section loads independently with skeletons, error states with retry, and empty states.

## Technical Context

| Property | Value |
|----------|-------|
| **Framework** | Next.js 15 (App Router), TypeScript 5 strict |
| **UI** | React 19, Tailwind CSS 4, shadcn/ui primitives |
| **Charts** | recharts (`pnpm add recharts` — not yet installed) |
| **Server State** | TanStack React Query 5 |
| **API Client** | `src/lib/api/Request.ts` (class-based axios) |
| **API Endpoints** | `GET /api/admin/orders/stats?period=X` + `GET /api/admin/orders?limit=5&sort=newest` |
| **Existing Components** | Admin layout + AdminSidebar + AdminTopBar + Breadcrumbs all exist; no admin pages exist yet |
| **Guard** | Server-side cookie check in `(admin)/layout.tsx` |

## Constitution Check

| Gate | Check | Status |
|------|-------|--------|
| Pre-Flight Checklist | Applied to every new file | ✅ |
| Package additions | `recharts` (not in `package.json`) — charting is a complex domain problem, not core business logic | ✅ Pass |
| Existing patterns | Follow skeleton pattern, React Query, request client, inline card styling | ✅ Confirm |

**Note**: `recharts` is the only new dependency. It's justified because implementing a donut chart from SVG primitives would exceed 20 lines and is not core business logic.

## Project Structure

```
specs/013-admin-dashboard/
├── plan.md                    # This file
├── research.md                # Phase 0: tech inventory & findings
├── data-model.md              # Phase 1: TypeScript types & API shapes
├── quickstart.md              # Phase 1: setup & file list
├── contracts/
│   ├── order-stats-api.md     # Phase 1: GET /api/admin/orders/stats
│   └── orders-list-api.md     # Phase 1: GET /api/admin/orders
└── checklists/
    └── requirements.md        # Quality checklist

src/
├── app/(admin)/
│   └── page.tsx               # Dashboard page (NEW)
├── components/admin/
│   ├── DashboardMetricCard.tsx  # Metric card (NEW)
│   ├── DashboardDonutChart.tsx  # Donut chart (NEW)
│   └── DashboardRecentOrders.tsx # Recent orders table (NEW)
└── lib/api/
    └── admin.ts               # Admin API wrappers (NEW)
```

## Implementation Order

### Phase 2 — Implementation (5 tasks)

1. **`src/lib/api/admin.ts`** — API wrappers for stats + recent orders
2. **`src/components/admin/DashboardMetricCard.tsx`** — Reusable metric card with icon, value, change %, skeleton
3. **`src/components/admin/DashboardDonutChart.tsx`** — Donut chart via recharts with skeleton
4. **`src/components/admin/DashboardRecentOrders.tsx`** — Recent orders table with status badge, skeleton, error, empty states
5. **`src/app/(admin)/page.tsx`** — Dashboard page: period selector, orchestrates all sections, uses React Query

### Phase 3 — Verification

- `pnpm run build` passes
- Manual: navigate to `/admin`, verify metrics/donut/table render with data
- No Phase 12 (account/addresses) features broken

## Architecture Decisions

### Section Independence

Each section (metrics, donut, table) is a separate client component with its own `useQuery`. Failures are scoped — a broken chart doesn't block the metrics or table.

### Period in URL

Period is stored in the URL (`?period=7d`) via `useSearchParams` + `useRouter.replace`. This enables browser back/forward and bookmarking without server-side handling (the page is a client component).

### Metric Card Design

```
┌─────────────────────┐
│ [icon]  Label      │
│   42,500    ▲ 25%  │
│            (125K)  │
└─────────────────────┘
```

- Icon from `lucide-react`
- Value formatted with `Intl.NumberFormat` (`compact` for >9999)
- Change % with green/red coloring and arrow indicator
- Previous period value shown smaller below
- Pending Orders card is a `<Link>` to `/admin/orders?status=pending`

### Donut Chart Design

- Uses `recharts` `PieChart` + `Pie` + `Cell` + legend
- Colors: fixed palette for each status (pending=amber, confirmed=blue, processing=purple, shipped=cyan, delivered=green, cancelled=red, refunded=gray)
- Zero-value statuses omitted from chart (recharts skips data points with value 0)
- Centered label shows total order count
- Skeleton placeholder while loading

### Recent Orders Table

```
┌──────┬────────┬────────┬────────┬────────┬──────┐
│ Order│ Status │ Total  │ Date   │        │ View │
├──────┼────────┼────────┼────────┼────────┼──────┤
│ORD-00│ Pending│ $164.98│ 01/06  │[Badge] │[Btn] │
└──────┴────────┴────────┴────────┴────────┴──────┘
```

- Order number, status (badge), total, date, "View" button
- Empty state: "No orders yet"
- Status badge uses existing `Badge` component
- Date formatted with `date.toLocaleDateString("ar-EG")`

### API Wrapper Design

```typescript
// src/lib/api/admin.ts
import { request } from "./Request";
import type { OrderStats, RecentOrder } from "@/specs/013-admin-dashboard/data-model"; // or inline

export function getOrderStats(period: string): Promise<OrderStats> {
  return request
    .get<{ data: OrderStats }>("/api/admin/orders/stats", { params: { period } })
    .then((res) => res.data);
}

export function getRecentOrders(): Promise<RecentOrder[]> {
  return request
    .get<{ data: RecentOrder[] }>("/api/admin/orders", {
      params: { limit: 5, sort: "newest" },
    })
    .then((res) => res.data.data);
}
```

**Note**: The stats response from Postman has stats at top level (not wrapped in `data`), but the order list is wrapped in `{ data: [...] }`. Wrappers must match actual API shape.

### React Query Keys

```typescript
const adminKeys = {
  stats: (period: string) => ["admin", "stats", period] as const,
  recentOrders: ["admin", "recent-orders"] as const,
};
```

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Stats API doesn't include `customer_name` in list response | Table falls back to showing order number + total + status + date without customer name column |
| Backend `previous`/`change_pct` fields missing from stats | Metric cards show only current value if previous is null; no % change shown |
| Period selector adds complexity to URL state | Use `useSearchParams` + `replace` — no server components needed |
