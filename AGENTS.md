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

**Feature**: Admin Orders & Payment Review
**Branch**: `015-admin-orders-payments`
**Plan file**: `specs/015-admin-orders-payments/plan.md`
**Spec file**: `specs/015-admin-orders-payments/spec.md`

### Key Artifacts

- [spec.md](specs/015-admin-orders-payments/spec.md) — Feature specification
- [plan.md](specs/015-admin-orders-payments/plan.md) — Implementation plan
- [research.md](specs/015-admin-orders-payments/research.md) — Tech inventory & findings
- [data-model.md](specs/015-admin-orders-payments/data-model.md) — Types & API shapes
- [quickstart.md](specs/015-admin-orders-payments/quickstart.md) — Setup guide
- [contracts/orders-api.md](specs/015-admin-orders-payments/contracts/orders-api.md) — Orders API contract
- [contracts/payments-api.md](specs/015-admin-orders-payments/contracts/payments-api.md) — Payments API contract

### Implementation Order

1. Create `src/lib/api/admin-orders.ts` — API wrappers for orders list, detail, status update; payments list, approve, reject
2. Create `src/components/admin/OrdersTable.tsx` — paginated, sortable data table with status/payment status/date range filters, search by order number or email
3. Create `src/components/admin/OrderDetail.tsx` — order detail container (customer card, items table, status timeline, payment card, shipping address card)
4. Create `src/components/admin/OrderStatusUpdateModal.tsx` — modal with current status, radio options for forward transitions
5. Create `src/components/admin/PaymentInfoCard.tsx` — payment info with screenshot preview, approve/reject buttons (gated by `orders.update`)
6. Create `src/components/admin/PaymentsTable.tsx` — pending payments queue table with screenshot Dialog, approve AlertDialog, reject Dialog with reason
7. Create `src/app/admin/(protected)/orders/page.tsx` — orders list page
8. Create `src/app/admin/(protected)/orders/[id]/page.tsx` — order detail page
9. Create `src/app/admin/(protected)/payments/page.tsx` — pending payments page
10. Update dashboard — add "Payments Awaiting Review" metric card linking to `/admin/payments`
11. Add sidebar link to orders in admin navigation
12. Tree-shake / final review
13. Build verification: `pnpm run build`

### Critical Patterns (enforced)

- **No new npm packages**: All dependencies already in package.json. No new shadcn wrappers needed.
- **Permission gating**: `useAdminStore` — `orders.read` for page access, `orders.update` for status update button and payment approve/reject
- **Search/filter state in URL**: Debounced 300ms, `?search=`/`?status=`/`?payment_status=` via `useRouter.replace`
- **Sortable columns**: Server-side sort via `?sort=field:dir`, click column header to toggle ASC/DESC
- **React Query keys**: `adminOrdersKeys` pattern matching `adminProductsKeys`
- **Skeleton exports**: Each component exports `*Skeleton` (existing convention)
- **Error/empty states**: Reuse `ErrorState` / `EmptyState` from `src/components/ui/`
- **Admin API client**: `adminRequest` from `AdminRequest.ts` for all admin API calls
- **Status badges**: Follow Phase 9 color convention (pending=yellow, confirmed=blue, etc.)
- **Forward-only lifecycle**: Status modal only shows `pending→confirmed→processing→shipped→delivered`
- **Dashboard metric card**: `DashboardMetricCard` with `href="/admin/payments"` for pending payments
- **Arabic-first RTL**: Already handled by root layout

### Completed

- **Phase 14** (Admin Products): Full product CRUD with multi-tab form (basic info, attributes, images, tags, variants), paginated table with search/filters/bulk actions, permission gating. All files implemented, build passes.
- **Phase 13** (Admin Dashboard): Dashboard with metric cards, donut chart, recent orders table, period selector, admin infrastructure. Build passes.
- **Phase 12** (Customer Account & Addresses): All files implemented, build passes.
- **Phases 7-11**: Customer Cart, Checkout, Order History, Wishlist, Notifications, and prior features.

<!-- SPECKIT END -->
