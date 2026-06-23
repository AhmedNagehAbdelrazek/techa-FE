# Research: Admin Panel — Coupons & Delivery Zones

## Tech Stack Decisions

### API Client Pattern
- **Decision**: Use `adminRequest` from `src/lib/api/AdminRequest.ts`
- **Rationale**: Same pattern as Phases 13/14/15/16 — separate axios instance with admin auth interceptor (`admin_access_token` from localStorage).
- **Alternatives**: Using `Request.ts` (customer client) — rejected because admin auth uses a different token storage mechanism.

### State Management
- **Decision**: TanStack React Query v5 for server state; no Zustand for coupon/zone state
- **Rationale**: All coupon/zone/rate data is server-state fetched from API. React Query handles caching, invalidation, and refetching. Zustand not needed.
- **Alternatives**: Zustand store for zone/rate state — rejected because React Query caching is sufficient.

### Permission Gating
- **Decision**: `useAdminStore` with `EMPTY_PERMISSIONS` hoisted pattern (same as Phases 14-16)
- **Rationale**: Granular permissions: `coupons.read` gates page access, `coupons.create` gates add button, `coupons.update` gates edit, `coupons.delete` gates deactivate. Same pattern for `zones.*`. Clarified during `/speckit.clarify`.
- **Alternatives**: Combined `coupons.write` — rejected because inconsistent with existing granular pattern.

### Form Validation
- **Decision**: Use `react-hook-form` with `zod` for coupon and zone forms
- **Rationale**: Coupon form has multiple interdependent fields (code, discount_type/value, product_id). Zone form has name + regions array. react-hook-form + zod is already installed and used in Phases 14 and 16.
- **Alternatives**: Plain `useState` — rejected because form fields have validation requirements and conditional logic (e.g., discount_type changes discount_value label).

### Product Combobox Pattern
- **Decision**: Use shadcn `Command` + `Popover` (Combobox pattern) fetching from `/api/admin/products?search=`
- **Rationale**: The spec requires a searchable product selector. shadcn's Command + Popover pattern is already available in the codebase and provides search-as-you-type with a dropdown list.
- **Note**: Fetch uses React Query with a debounced search query. Use `useQuery` with `enabled: !!searchTerm` and `keepPreviousData` for smooth UX.

### Coupon Status Badge Logic
- **Decision**: Three-way badge: `is_active` false → "Inactive" (gray); `is_active` true + `expires_at` past → "Expired" (red); `is_active` true + `expires_at` future/null → "Active" (green). Inactive takes precedence over Expired.
- **Rationale**: Clarified during `/speckit.clarify`. Precedence: Inactive > Expired > Active.
- **Alternatives**: Expired takes precedence — rejected per clarification.

### Zone Expandable Row Pattern
- **Decision**: Use `<Table><TableBody>` with a collapsible row per zone. Clicking a zone row toggles an extra row beneath it containing the rates list. Use local `useState` for expanded state per zone.
- **Rationale**: Lightweight pattern — no need for a separate page or Dialog for viewing rates. Matches the spec requirement "expandable row".
- **Alternatives**: Separate page per zone — rejected as over-engineering for simple rate management.

### Regions Multi-Tag Input
- **Decision**: Use a custom chip/tag input component built with shadcn primitives (Badge + Input). Each region is an individual removable chip. Uses local state to manage tags before form submission.
- **Rationale**: Clarified during `/speckit.clarify`. Multi-tag chip input is more user-friendly for discrete city/region names.
- **Alternatives**: Plain comma-separated text input — rejected per clarification.

### Rate Form Pattern
- **Decision**: Rates are managed via a separate Dialog (`RateFormDialog`) opened from within the expanded zone row. Create and Edit share the same Dialog via `initialData` prop.
- **Rationale**: Same pattern as CategoryFormDialog and BrandFormDialog from Phase 16 — single form component for both create and edit.

## Existing Code Patterns

### React Query Keys Pattern (from admin-products.ts, admin-orders.ts, admin-taxonomy.ts)
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

### Skeleton Export Pattern
Each component exports `*Skeleton` for loading states. Skeletons are separate named exports using shadcn `<Skeleton />`.

### Permission Check Pattern (EMPTY_PERMISSIONS)
```typescript
const EMPTY_PERMISSIONS: Record<string, string[]> = {};
const permissions = useAdminStore((s) => s.admin?.permissions ?? EMPTY_PERMISSIONS);
const canCreate = permissions["coupons"]?.includes("create") ?? false;
const canUpdate = permissions["coupons"]?.includes("update") ?? false;
const canDelete = permissions["coupons"]?.includes("delete") ?? false;
```

### Dialog CRUD Pattern (from Phase 16)
```typescript
// Dialog + form pattern:
// - Dialog opens on "Add" / "Edit" button click
// - Form inside Dialog uses react-hook-form + zod
// - On submit, calls create or update mutation
// - On success, invalidates list query, closes Dialog, shows toast
// - On error, shows toast with error message
```

### Empty State Pattern
```typescript
<EmptyState
  title="No coupons yet"
  description="Create your first coupon to offer discounts."
  action={canCreate ? <Button onClick={openAddDialog}>Add Coupon</Button> : undefined}
/>
```

### Error State Pattern
```typescript
<ErrorState
  title="Failed to load coupons"
  message={(error as Error)?.message}
  onRetry={() => refetch()}
/>
```

### Product Search Endpoint Pattern
From `src/lib/api/admin-products.ts`: the admin products list endpoint accepts `search` as a query parameter:
```typescript
interface AdminProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  // ...
}
```
Return shape: `{ data: Product[], meta: PaginationMeta }`

## No New NPM Packages

All required dependencies are already in `package.json`:
- `lucide-react` — icons (ChevronDown, ChevronRight, Plus, Edit2, Trash2, Search, MapPin, etc.)
- `sonner` — toasts
- `@tanstack/react-query` — server state
- `zustand` — `useAdminStore` (already exists)
- `react-hook-form` + `zod` + `@hookform/resolvers` — form validation
- shadcn/ui components: Table, Dialog, AlertDialog, Badge, Button, Input, Select, Label, Command, Popover (for Combobox), Calendar (for DatePicker), all already present
