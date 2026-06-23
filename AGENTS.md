<!-- SPECKIT START -->

## Pre-Flight Checklist (MANDATORY — run before EVERY code decision)

Before writing any code, answering any task, or making any decision — run this checklist in order. Stop at the first rule that applies and act on it. Do not continue down the list.

```
1. Does this need to exist?       → If no clear requirement drives it, skip it entirely. (YAGNI)
2. Does the stdlib do it?         → Use it. No import needed.
3. Is it a native platform API?   → Use it. (Node built-ins, browser APIs, Next.js built-ins)
4. Is it an installed dependency? → Use it. Check package.json first.
5. Can it be written in one line? → Write one line.
6. Only then: write the minimum code that makes it work. Nothing more.
```

This checklist is not optional and is not a suggestion. It runs before every function, every file, every component, every utility. If you catch yourself about to write something without having run this checklist first, stop and run it now.

### What this looks like in practice

| Situation | Wrong | Right |
|---|---|---|
| Need to capitalize a string | Install `lodash` | `str[0].toUpperCase() + str.slice(1)` |
| Need to generate a UUID | Write a UUID function | `crypto.randomUUID()` (Node 14.17+) |
| Need to check if array is empty | `_.isEmpty(arr)` | `arr.length === 0` |
| Need to deep clone an object | Write a recursive clone | `structuredClone(obj)` (Node 17+) |
| Need to parse a URL | Install `url-parse` | `new URL(str)` |
| Need to format a date | Install `moment` | `new Intl.DateTimeFormat(...)` or `date.toLocaleDateString()` |
| Need to sleep/delay | Write a sleep utility | `await new Promise(r => setTimeout(r, ms))` |
| Need to flatten an array one level | Write a reduce | `arr.flat()` |
| Need to get unique values | Write a filter loop | `[...new Set(arr)]` |
| Need to read an env variable | Abstract it into a helper | `process.env.VAR_NAME` |

### The only valid reasons to add a new dependency

- The task is genuinely complex and the library solves a hard, well-defined problem (e.g. parsing multipart form data, JWT signing, bcrypt hashing)
- The library is already in `package.json` — it costs nothing to use it
- Writing it from scratch would take more than 20 lines and is not core business logic

If none of these apply, do not add the dependency. Ask first.

## Current Plan

**Feature**: Admin Coupons & Delivery Zones
**Branch**: `017-admin-coupons-delivery-zones`
**Plan file**: `specs/017-admin-coupons-delivery-zones/plan.md`
**Spec file**: `specs/017-admin-coupons-delivery-zones/spec.md`

### Key Artifacts

- [spec.md](specs/017-admin-coupons-delivery-zones/spec.md) — Feature specification
- [plan.md](specs/017-admin-coupons-delivery-zones/plan.md) — Implementation plan
- [research.md](specs/017-admin-coupons-delivery-zones/research.md) — Tech inventory & findings
- [data-model.md](specs/017-admin-coupons-delivery-zones/data-model.md) — Types & API shapes
- [quickstart.md](specs/017-admin-coupons-delivery-zones/quickstart.md) — Setup guide
- [contracts/coupons-api.md](specs/017-admin-coupons-delivery-zones/contracts/coupons-api.md) — Coupons API contract
- [contracts/delivery-zones-api.md](specs/017-admin-coupons-delivery-zones/contracts/delivery-zones-api.md) — Delivery Zones API contract

### Implementation Order

1. Create `src/lib/api/admin-coupons-zones.ts` — API wrappers and types for coupons (list, create, update, deactivate), zones (list, create, update, deactivate), rates (list, create, update)
2. Create `src/components/admin/CouponsTable.tsx` — paginated data table with code, product, type, value, usage, expiry, status
3. Create `src/components/admin/CouponFormDialog.tsx` — create/edit coupon form in Dialog with searchable product combobox
4. Create `src/components/admin/ZonesTable.tsx` — zones table with expandable rows for shipping rates
5. Create `src/components/admin/ZoneFormDialog.tsx` — create/edit zone form in Dialog (name, regions multi-tag chip, is_active)
6. Create `src/components/admin/RateFormDialog.tsx` — create/edit shipping rate form in Dialog
7. Create `src/app/admin/(protected)/coupons/page.tsx` — coupon management page
8. Create `src/app/admin/(protected)/delivery-zones/page.tsx` — delivery zone management page
9. Verify sidebar links (Delivery Zones already exists; add Coupons if missing)
10. Tree-shake / final review
11. Build verification: `pnpm run build`

### Critical Patterns (enforced)

- **No new npm packages**: All dependencies already in package.json. No new shadcn wrappers needed.
- **Permission gating**: `useAdminStore` with `EMPTY_PERMISSIONS` — granular `read`/`create`/`update`/`delete` per resource (`coupons.*`, `zones.*`)
- **React Query keys**: `adminCouponZoneKeys` pattern matching `adminProductsKeys`/`adminOrdersKeys`
- **Skeleton exports**: Each component exports `*Skeleton` (existing convention)
- **Error/empty states**: Reuse `ErrorState` / `EmptyState` from `src/components/ui/`
- **Admin API client**: `adminRequest` from `AdminRequest.ts` for all admin API calls
- **Form validation**: react-hook-form + zod for coupon and zone forms (same pattern as Phase 14)
- **Coupon status badge**: Three-way — Inactive > Expired > Active precedence
- **Zone expandable rows**: Local useState toggle per row, rates fetched on expand
- **Product combobox**: Debounced search via React Query with `keepPreviousData`
- **Regions input**: Multi-tag chip input with removable badges
- **Deactivation**: AlertDialog confirmation; warning for zone deactivation about rates
- **Arabic-first RTL**: Already handled by root layout

### Completed

- **Phase 16** (Admin Categories, Brands & Tags): Category tree with expand/collapse, brands paginated table, tags inline edit/delete, permission gating, all three admin pages. Build passes.
- **Phase 15** (Admin Orders & Payment Review): Orders table with sort/filters, order detail with status timeline/update modal, payment approve/reject, pending payments queue, dashboard metric card, sidebar link. All files implemented, build passes.
- **Phase 14** (Admin Products): Full product CRUD with multi-tab form, paginated table, bulk actions, permission gating. Build passes.
- **Phase 13** (Admin Dashboard): Dashboard with metric cards, donut chart, recent orders table, period selector. Build passes.
- **Phase 12** (Customer Account & Addresses): All files implemented, build passes.
- **Phases 7-11**: Customer Cart, Checkout, Order History, Wishlist, Notifications, and prior features.

<!-- SPECKIT END -->
