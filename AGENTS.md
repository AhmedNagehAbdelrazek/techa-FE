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

**Feature**: Admin Categories, Brands & Tags
**Branch**: `016-admin-categories-brands-tags`
**Plan file**: `specs/016-admin-categories-brands-tags/plan.md`
**Spec file**: `specs/016-admin-categories-brands-tags/spec.md`

### Key Artifacts

- [spec.md](specs/016-admin-categories-brands-tags/spec.md) — Feature specification
- [plan.md](specs/016-admin-categories-brands-tags/plan.md) — Implementation plan
- [research.md](specs/016-admin-categories-brands-tags/research.md) — Tech inventory & findings
- [data-model.md](specs/016-admin-categories-brands-tags/data-model.md) — Types & API shapes
- [quickstart.md](specs/016-admin-categories-brands-tags/quickstart.md) — Setup guide
- [contracts/categories-api.md](specs/016-admin-categories-brands-tags/contracts/categories-api.md) — Categories API contract
- [contracts/brands-api.md](specs/016-admin-categories-brands-tags/contracts/brands-api.md) — Brands API contract
- [contracts/tags-api.md](specs/016-admin-categories-brands-tags/contracts/tags-api.md) — Tags API contract

### Implementation Order

1. Create `src/lib/api/admin-taxonomy.ts` — API wrappers and types for categories (list, create, update, deactivate), brands (list, create, update, deactivate), tags (list, create, update, delete)
2. Create `src/components/admin/CategoryTree.tsx` — recursive tree view with expand/collapse, edit/deactivate per node
3. Create `src/components/admin/CategoryFormDialog.tsx` — create/edit category form in Dialog (name, slug, parent, image, sort_order, is_active)
4. Create `src/components/admin/BrandsTable.tsx` — paginated data table with logo, name, slug, description, status
5. Create `src/components/admin/BrandFormDialog.tsx` — create/edit brand form in Dialog (name, slug, logo, description, is_active)
6. Create `src/components/admin/TagsList.tsx` — flat list with inline edit and delete via AlertDialog
7. Create `src/app/admin/(protected)/categories/page.tsx` — category management page
8. Create `src/app/admin/(protected)/brands/page.tsx` — brand management page
9. Create `src/app/admin/(protected)/tags/page.tsx` — tag management page
10. Add sidebar links to Categories, Brands, Tags in admin navigation
11. Tree-shake / final review
12. Build verification: `pnpm run build`

### Critical Patterns (enforced)

- **No new npm packages**: All dependencies already in package.json. No new shadcn wrappers needed.
- **Permission gating**: `useAdminStore` with `EMPTY_PERMISSIONS` — granular `read`/`create`/`update`/`delete` per resource (`categories.*`, `brands.*`, `tags.*`)
- **React Query keys**: `adminTaxonomyKeys` pattern matching `adminProductsKeys`/`adminOrdersKeys`
- **Skeleton exports**: Each component exports `*Skeleton` (existing convention)
- **Error/empty states**: Reuse `ErrorState` / `EmptyState` from `src/components/ui/`
- **Admin API client**: `adminRequest` from `AdminRequest.ts` for all admin API calls
- **Form validation**: react-hook-form + zod for category and brand forms (same pattern as Phase 14)
- **Category tree**: Recursive component, expand/collapse via local useState
- **Tags edit**: Inline input on click, save on Enter/blur
- **Deactivation**: AlertDialog confirmation; 409 conflict shown via toast
- **Arabic-first RTL**: Already handled by root layout

### Completed

- **Phase 15** (Admin Orders & Payment Review): Orders table with sort/filters, order detail with status timeline/update modal, payment approve/reject, pending payments queue, dashboard metric card, sidebar link. All files implemented, build passes.
- **Phase 14** (Admin Products): Full product CRUD with multi-tab form, paginated table, bulk actions, permission gating. Build passes.
- **Phase 13** (Admin Dashboard): Dashboard with metric cards, donut chart, recent orders table, period selector. Build passes.
- **Phase 12** (Customer Account & Addresses): All files implemented, build passes.
- **Phases 7-11**: Customer Cart, Checkout, Order History, Wishlist, Notifications, and prior features.

<!-- SPECKIT END -->
