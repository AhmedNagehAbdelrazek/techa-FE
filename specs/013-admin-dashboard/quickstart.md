# Quickstart: Admin Dashboard

## Setup

```bash
git checkout 013-admin-dashboard
pnpm add recharts
```

## Files to Create

| # | File | Purpose |
|---|------|---------|
| 1 | `src/lib/api/admin.ts` | API wrappers: `getOrderStats(period)`, `getRecentOrders()` |
| 2 | `src/components/admin/DashboardMetricCard.tsx` | Metric card with icon, value, change %, loading skeleton |
| 3 | `src/components/admin/DashboardDonutChart.tsx` | Donut chart using recharts PieChart |
| 4 | `src/components/admin/DashboardRecentOrders.tsx` | Recent orders table with status badge |
| 5 | `src/app/(admin)/page.tsx` | Dashboard page — orchestrates all sections + period selector |

## Data Flow

```
src/app/(admin)/page.tsx              ← "use client", useSearchParams for ?period=
  ↓ React Query (useQuery)
src/lib/api/admin.ts                  ← request.get<...>(...)
  ↓ fetch
GET /api/admin/orders/stats?period=X
GET /api/admin/orders?limit=5&sort=newest
```

## Key Decisions

- **Period in URL**: `?period=7d` via `useSearchParams` + `useRouter` (replace — no history stack pollution)
- **Independent sections**: Each section (metrics, chart, table) is its own client component with its own `useQuery`, so a failure in one doesn't block others
- **Skeleton pattern**: Follow existing codebase style — `Skeleton` component for loading, paired skeleton exports for each section
- **Metric card format**: Numbers > 9999 abbreviated (e.g., 12.5K, 1.2M) via `Intl.NumberFormat` with compact notation
- **No shadcn Card**: Use `rounded-lg border bg-card p-6` inline pattern (consistent with codebase)
- **No Card metric component per se**: Each metric card has icon, label, formatted value, % change with arrow indicator

## Build Verification

```bash
pnpm run build
```
