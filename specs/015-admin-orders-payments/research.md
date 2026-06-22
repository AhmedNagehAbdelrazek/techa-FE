# Research: Admin Panel — Orders & Payment Review

## Tech Stack Decisions

### API Client Pattern
- **Decision**: Use `adminRequest` from `src/lib/api/AdminRequest.ts`
- **Rationale**: Same pattern as Phases 13/14 — separate axios instance with admin auth interceptor (`admin_access_token` from localStorage). All admin API calls go through this.
- **Alternatives**: Using `Request.ts` (customer client) — rejected because admin auth uses a different token storage mechanism.

### State Management
- **Decision**: TanStack React Query v5 for server state; no Zustand for orders/payments state
- **Rationale**: All order/payment data is server-state fetched from API. React Query handles caching, invalidation, and refetching. Zustand not needed — search/filter state lives in URL params (same pattern as Phase 14 products table).
- **Alternatives**: Zustand store for filters — rejected because URL-based filters are shareable and refresh-safe.

### Permission Gating
- **Decision**: `useAdminStore` with `EMPTY_PERMISSIONS` hoisted pattern (same as Phase 14)
- **Rationale**: `orders.read` gates page access; `orders.update` gates status update button and payment approve/reject. The `EMPTY_PERMISSIONS` hoist prevents the `getServerSnapshot` infinite loop bug (fixed in Phase 14).
- **Alternatives**: Inline `?? {}` — rejected due to `getServerSnapshot` infinite loop bug.

### Form Validation
- **Decision**: No react-hook-form/zod needed — status update and approve/reject are simple actions (one field), not complex forms
- **Rationale**: Status update modal uses a simple radio group and confirm button. Rejection uses a textarea. Plain `useState` + useEffect for client-side validation is sufficient.
- **Alternatives**: react-hook-form — over-engineered for single-field forms.

### Table Sorting
- **Decision**: Server-side sorting via `?sort=field:dir` query param; column header click toggles ASC/DESC
- **Rationale**: Client-side sorting doesn't work with server-side pagination (you'd only sort the current page). Server-side sort requires backend support.
- **Note**: Sortable columns: date (`created_at`), total, order number. Default sort: `created_at:desc`.

### Date Range Filter
- **Decision**: Native HTML `<input type="date">` inputs, passed as `?date_from=&date_to=` query params
- **Rationale**: No date picker library needed; simple date inputs work for all modern browsers. Backend must support these params.
- **Note**: Postman collection does not document `date_from`/`date_to` — may need backend confirmation.

## Existing Code Patterns

### React Query Keys (from admin-products.ts)
```typescript
export const adminOrdersKeys = {
  all: ["admin", "orders"] as const,
  lists: () => [...adminOrdersKeys.all, "list"] as const,
  list: (params: AdminOrderListParams) => [...adminOrdersKeys.lists(), params] as const,
  details: () => [...adminOrdersKeys.all, "detail"] as const,
  detail: (id: string) => [...adminOrdersKeys.details(), id] as const,
  payments: ["admin", "payments"] as const,
  stats: ["admin", "orders", "stats"] as const,
};
```

### Skeleton Export Pattern
Each component exports `*Skeleton` for loading states. Skeletons are separate named exports (not inline conditionals inside the component). They use shadcn `<Skeleton />` with `h-`, `w-`, and `rounded` classes.

### Permission Check Pattern (EMPTY_PERMISSIONS)
```typescript
const EMPTY_PERMISSIONS: Record<string, string[]> = {};
const permissions = useAdminStore((s) => s.admin?.permissions ?? EMPTY_PERMISSIONS);
const canUpdate = permissions["orders"]?.includes("update") ?? false;
```

### Dashboard Metric Card Pattern
- Component: `DashboardMetricCard` with `href` prop to wrap in `<Link>`
- Dashboard grid: `grid gap-4 sm:grid-cols-2 lg:grid-cols-4`
- Add pending payments card: `<DashboardMetricCard label="Payments Awaiting Review" value={stats?.pending_payments ?? 0} icon={Banknote} href="/admin/payments" loading={statsLoading} Highlighted={true} />`

## Backend Dependencies

The following backend query params may not be documented in Postman but are needed:
- `?date_from=` and `?date_to=` for order date range filter
- `?search=` for order search (by order number or customer email)
- `?sort=field:dir` for column sorting

The `customer` field must be added to the list orders response.

## No New NPM Packages

All required dependencies are already in `package.json`:
- `lucide-react` — icons
- `sonner` — toasts
- `@tanstack/react-query` — server state
- `zustand` — `useAdminStore` (already exists)
- `react-hook-form` + `zod` + `@hookform/resolvers` — available but not needed for this phase
- shadcn/ui components: Table, Dialog, AlertDialog, Badge, Button, Input, Select, Textarea (all already present)
