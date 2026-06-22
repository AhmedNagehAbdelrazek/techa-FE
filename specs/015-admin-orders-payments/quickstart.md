# Quickstart: Admin Orders & Payment Review

## Prerequisites

- Node.js 20+, pnpm 9+
- Backend running at the URL configured in `NEXT_PUBLIC_API_URL` or `NEXT_PUBLIC_BACKEND_URL`
- Admin account with `orders.read` and `orders.update` permissions

## Getting Started

No new npm packages are needed. All dependencies are already in `package.json`.

## Key Files

### API Layer
- `src/lib/api/admin-orders.ts` — API wrappers for orders and payments CRUD. Types inline.

### Components
- `src/components/admin/OrdersTable.tsx` — Paginated, sortable orders data table with status/payment status/date range filters and search. Exports `OrdersTableSkeleton`.
- `src/components/admin/OrderDetail.tsx` — Order detail container rendering customer card, items table, timeline, payment card, and address card. Exports `OrderDetailSkeleton`.
- `src/components/admin/OrderStatusUpdateModal.tsx` — Modal for updating order status. Shows current status + radio options for valid forward transitions. Exports `OrderStatusUpdateModalSkeleton`.
- `src/components/admin/PaymentInfoCard.tsx` — Payment info with approve/reject buttons for Instapay/Vodafone Cash. Exports `PaymentInfoCardSkeleton`.
- `src/components/admin/PaymentsTable.tsx` — Pending payments queue table with screenshot preview, approve, reject. Exports `PaymentsTableSkeleton`.

### Pages
- `src/app/admin/(protected)/orders/page.tsx` — Orders list page (uses `OrdersTable`)
- `src/app/admin/(protected)/orders/[id]/page.tsx` — Order detail page (uses `OrderDetail` + `OrderStatusUpdateModal` + `PaymentInfoCard`)
- `src/app/admin/(protected)/payments/page.tsx` — Pending payments queue (uses `PaymentsTable`)

### Dashboard Update
- `src/app/admin/(protected)/page.tsx` — Add `DashboardMetricCard` for "Payments Awaiting Review" linking to `/admin/payments`

## Patterns to Follow

- All API calls use `adminRequest` from `AdminRequest.ts`
- All data fetching uses TanStack React Query with `adminOrdersKeys` query keys
- Permission check: `const permissions = useAdminStore((s) => s.admin?.permissions ?? EMPTY_PERMISSIONS); const canUpdate = permissions["orders"]?.includes("update") ?? false;`
- Search/filter state lives in URL query params via `useSearchParams` + `useRouter.replace` (debounced 300ms)
- Each component exports `*Skeleton` for loading states
- Error/empty states use `ErrorState` / `EmptyState` from `src/components/ui/`
- Toast notifications use `toast()` from `sonner`
- Order status badges: pending=yellow, confirmed=blue, processing=indigo, shipped=cyan, delivered=green, cancelled=red, refunded=orange
- Payment status badges: pending=yellow, paid=green, failed=red, refunded=orange
- Arabic-first RTL layout (already handled by root layout)
- Mobile-responsive at 375px width

## Build & Verify

```bash
pnpm run build
pnpm run lint
```
