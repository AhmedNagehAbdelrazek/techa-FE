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

**Feature**: Admin Dashboard
**Branch**: `013-admin-dashboard`
**Plan file**: `specs/013-admin-dashboard/plan.md`
**Spec file**: `specs/013-admin-dashboard/spec.md`

### Key Artifacts

- [spec.md](specs/013-admin-dashboard/spec.md) — Feature specification
- [plan.md](specs/013-admin-dashboard/plan.md) — Implementation plan
- [research.md](specs/013-admin-dashboard/research.md) — Tech inventory & findings
- [data-model.md](specs/013-admin-dashboard/data-model.md) — Types & API shapes
- [quickstart.md](specs/013-admin-dashboard/quickstart.md) — Setup guide
- [contracts/order-stats-api.md](specs/013-admin-dashboard/contracts/order-stats-api.md) — Stats API contract
- [contracts/orders-list-api.md](specs/013-admin-dashboard/contracts/orders-list-api.md) — Orders list API contract

### Implementation Order

1. Route restructure: `admin/(protected)/` for auth-guarded pages, `admin/login/` standalone
2. Create `src/lib/api/admin-token.ts` — localStorage key `admin_access_token` (separate from customer)
3. Create `src/lib/api/interceptors/admin-auth.interceptor.ts` — attaches admin Bearer token
4. Create `src/lib/api/AdminRequest.ts` — separate axios instance for admin APIs
5. Create `src/lib/stores/admin.store.ts` — Zustand store: `admin`, `isAuthenticated`, `setAdmin`, `logout`
6. Create `src/components/admin/AdminAuthInitializer.tsx` — fetches profile on mount, populates store
7. Create `src/lib/api/admin.ts` — API wrappers using `adminRequest`: `adminLogin`, `getAdminProfile`, `adminLogout`, `getOrderStats`, `getRecentOrders`
8. Create `src/app/admin/login/page.tsx` — standalone login page, saves token to admin store + localStorage + cookie
9. Create `src/components/admin/DashboardMetricCard.tsx` — Metric card with icon, value, change %, skeleton
10. Create `src/components/admin/DashboardDonutChart.tsx` — Donut chart via recharts PieChart with skeleton
11. Create `src/components/admin/DashboardRecentOrders.tsx` — Recent orders table with status badge, skeleton, error, empty
12. Create `src/app/admin/(protected)/page.tsx` — Dashboard page: period selector, orchestrates all sections, React Query
13. Update `AdminTopBar` — read from admin store, use store logout
14. Verify: build passes with `pnpm run build`

### Critical Patterns (enforced)

- **recharts**: `pnpm add recharts` before implementation (not in package.json)
- **No Card component**: Use `rounded-lg border bg-card p-6` inline (consistent with codebase, no shadcn Card exists)
- **Period in URL**: `?period=7d` via `useSearchParams` + `useRouter.replace` — not Zustand
- **Independent sections**: Each section has its own `useQuery` — failure in one does not block others
- **Skeleton pattern**: Each section component exports a corresponding `*Skeleton` (follows existing codebase convention)
- **Error/empty states**: Use existing `ErrorState` / `EmptyState` components from `src/components/ui/`
- **Admin API client**: `adminRequest` from `AdminRequest.ts` — separate axios instance with admin token (localStorage key `admin_access_token`). All admin API wrappers use this, never `request` from `Request.ts`.
- **Admin store**: `useAdminStore` caches admin profile globally. `AdminAuthInitializer` fetches on mount if store is empty.
- **Metric formatting**: Use `Intl.NumberFormat("en", { notation: "compact" })` for values > 9999
- **Donut chart colors**: Fixed palette per status (pending=amber, confirmed=blue, processing=purple, shipped=cyan, delivered=green, cancelled=red, refunded=gray)
- **No new types across projects**: Types defined inline or in data-model.md
- **Accessibility**: aria-labels, keyboard nav, RTL-compatible layout

### Completed

- **Phase 12** (Customer Account & Addresses): All 5 files implemented, build passes. `AccountTabs`, `AccountPageContent`, `ProfileForm` (avatar upload), `AccountAddressForm`, `AccountAddresses`. Bug fix: `setDefaultAddress` wrapper returns `Promise<void>` not `Address`.
- **Phases 7-11**: Customer Cart, Checkout, Order History, Wishlist, Notifications, and prior features.

<!-- SPECKIT END -->
