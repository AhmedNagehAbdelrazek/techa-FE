# Research: Admin Dashboard — Phase 0

## Tech Inventory

| Item | Status | Notes |
|------|--------|-------|
| `recharts` in `package.json` | **MISSING** | Must `pnpm add recharts` |
| Admin layout | Exists | `src/app/(admin)/layout.tsx` — server component, cookie-based auth guard |
| AdminSidebar | Exists | `src/components/layout/AdminSidebar.tsx` — 11 nav links, active route highlight |
| AdminTopBar | Exists | `src/components/layout/AdminTopBar.tsx` — fetches `/api/admin/auth/me` |
| Breadcrumbs | Exists | `src/components/layout/Breadcrumbs.tsx` — URL segment parser |
| Admin pages | **NONE** | No `page.tsx` in `(admin)` — dashboard is the first |
| Card component | **NONE** | No shadcn `Card`; patterns use `rounded-lg border bg-card` inline |
| Skeleton component | Exists | `src/components/ui/skeleton.tsx` — `animate-pulse rounded-md bg-accent` |
| ErrorState component | Exists | `src/components/ui/ErrorState.tsx` — `title`, `message`, `onRetry` |
| LoadingState component | Exists | `src/components/ui/LoadingState.tsx` — `spinner`/`skeleton` variants |
| EmptyState component | Exists | `src/components/ui/EmptyState.tsx` — `title`, `description`, `action` |
| Badge component | Exists | `src/components/ui/badge.tsx` — CVA with status variants |
| Button component | Exists | `src/components/ui/button.tsx` — CVA with variants/sizes |
| Request client | Exists | `src/lib/api/Request.ts` — class-based axios, auto-unwraps `.data` |
| Admin auth guard | Server-side | `(admin)/layout.tsx` checks cookie, redirects to `/admin/login` |
| API wrapper for admin orders | **NONE** | Need `src/lib/api/admin.ts` |
| Stats endpoint | Confirmed | `GET /api/admin/orders/stats?period=7d` — updated with `current`/`previous`/`change_pct` |
| Orders list endpoint | Confirmed | `GET /api/admin/orders?limit=5&sort=newest` |

## Key Findings

1. **`recharts` must be installed**: Not present in `package.json`. Required for donut chart.
2. **No shadcn `Card`**: Metric cards use inline `rounded-lg border bg-card` pattern — consistent with existing codebase.
3. **Admin API wrappers don't exist**: Need `src/lib/api/admin.ts` with `getOrderStats()` and `getRecentOrders()`.
4. **Stats response shape** (from Postman + user confirmation): `{ total_orders, total_revenue, new_customers, by_status: { pending, confirmed, processing, shipped, delivered, cancelled, refunded }, pending_payments }` — each numeric field has `current`, `previous`, `change_pct` after backend update.
5. **Admin layout imports work**: AdminSidebar, AdminTopBar, Breadcrumbs all exist. Dashboard page simply adds content.
6. **Donut chart uses `recharts` `PieChart` + `Pie`**: Standard pattern, `cell` for segments.
7. **Period selector**: Tab buttons (not dropdown) for `7d`, `30d`, `90d`, `this_month`, `last_month` — stored in URL query param `?period=7d`.
