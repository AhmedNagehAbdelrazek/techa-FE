# Quickstart: Admin Coupons & Delivery Zones

## Prerequisites

- Node.js 20+, pnpm 9+
- Backend running at the URL configured in `NEXT_PUBLIC_API_URL` or `NEXT_PUBLIC_BACKEND_URL`
- Admin account with granular permissions: `coupons.read/create/update/delete`, `zones.read/create/update/delete`

## Getting Started

No new npm packages are needed. All dependencies are already in `package.json`.

## Key Files

### API Layer
- `src/lib/api/admin-coupons-zones.ts` — API wrappers and inline types for coupons, delivery zones, and shipping rates CRUD.

### Components
- `src/components/admin/CouponsTable.tsx` — Paginated coupons data table with code, product, type, value, usage, expiry, status columns. Exports `CouponsTableSkeleton`.
- `src/components/admin/CouponFormDialog.tsx` — Create/edit Dialog for coupons (code, product combobox, discount_type, discount_value, min_order_amount, max_uses, expires_at, is_active). Exports `CouponFormDialogSkeleton`.
- `src/components/admin/ZonesTable.tsx` — Delivery zones table with expandable rows for rates. Exports `ZonesTableSkeleton`.
- `src/components/admin/ZoneFormDialog.tsx` — Create/edit Dialog for zones (name, regions multi-tag chip input, is_active). Exports `ZoneFormDialogSkeleton`.
- `src/components/admin/RateFormDialog.tsx` — Create/edit Dialog for shipping rates (charge, estimated_days_min/max, free_above_amount, min/max order amounts). Exports `RateFormDialogSkeleton`.

### Pages
- `src/app/admin/(protected)/coupons/page.tsx` — Coupon management page (uses `CouponsTable` + `CouponFormDialog`)
- `src/app/admin/(protected)/delivery-zones/page.tsx` — Delivery zone management page (uses `ZonesTable` + `ZoneFormDialog` + `RateFormDialog`)

## Patterns to Follow

- All API calls use `adminRequest` from `AdminRequest.ts`
- All data fetching uses TanStack React Query with `adminCouponZoneKeys`
- Permission check: `const permissions = useAdminStore((s) => s.admin?.permissions ?? EMPTY_PERMISSIONS); const canCreate = permissions["coupons"]?.includes("create") ?? false;`
- Coupon/zone forms use `react-hook-form` + `zod` (same pattern as Phase 14 product form and Phase 16 taxonomy forms)
- Each component exports `*Skeleton` for loading states
- Error/empty states use `ErrorState` / `EmptyState` from `src/components/ui/`
- Toast notifications use `toast()` from `sonner`
- Deactivation shows confirmation via AlertDialog
- Zone deactivation AlertDialog includes warning about rates being deactivated
- Product combobox in coupon form uses debounced search with React Query
- Coupon status badge: Inactive (gray) > Expired (red) > Active (green) precedence
- Arabic-first RTL layout (already handled by root layout)
- Mobile-responsive at 375px width

## Build & Verify

```bash
pnpm run build
pnpm run lint
```
