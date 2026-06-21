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

**Feature**: Admin Products
**Branch**: `014-admin-products`
**Plan file**: `specs/014-admin-products/plan.md`
**Spec file**: `specs/014-admin-products/spec.md`

### Key Artifacts

- [spec.md](specs/014-admin-products/spec.md) — Feature specification
- [plan.md](specs/014-admin-products/plan.md) — Implementation plan (15 steps)
- [research.md](specs/014-admin-products/research.md) — Tech inventory & findings
- [data-model.md](specs/014-admin-products/data-model.md) — Types & API shapes
- [quickstart.md](specs/014-admin-products/quickstart.md) — Setup guide
- [contracts/products-list-api.md](specs/014-admin-products/contracts/products-list-api.md) — Products list API
- [contracts/products-detail-api.md](specs/014-admin-products/contracts/products-detail-api.md) — Product detail API
- [contracts/products-create-api.md](specs/014-admin-products/contracts/products-create-api.md) — Create product API
- [contracts/products-update-api.md](specs/014-admin-products/contracts/products-update-api.md) — Update product API
- [contracts/products-delete-api.md](specs/014-admin-products/contracts/products-delete-api.md) — Delete product API
- [contracts/categories-brands-tags-api.md](specs/014-admin-products/contracts/categories-brands-tags-api.md) — Reference data APIs
- [contracts/media-upload-api.md](specs/014-admin-products/contracts/media-upload-api.md) — Image upload API

### Implementation Order

1. Create 9 shadcn UI wrappers: `tabs`, `dialog`, `table`, `checkbox`, `textarea`, `label`, `command`, `popover`, `form`
2. Create `src/lib/api/admin-products.ts` — API wrappers for products CRUD, categories, brands, tags, upload
3. Create `src/components/admin/ProductsTable.tsx` — paginated data table with search, filters, bulk actions
4. Create `ProductFormBasicInfo.tsx` — name, slug, price, discount, description, about points
5. Create `ProductFormAttributes.tsx` — dynamic attributes list (details/specs sections)
6. Create `ProductFormImages.tsx` — image upload gallery with sort order, primary toggle
7. Create `ProductFormTags.tsx` — tag multi-select combobox
8. Create `ProductFormVariants.tsx` — variant builder with useFieldArray, SKU, price, stock, options, _destroy
9. Create `ProductForm.tsx` — tab container with form state, validation schema, submit handler
10. Create `src/app/admin/(protected)/products/page.tsx` — products list page
11. Create `src/app/admin/(protected)/products/new/page.tsx` — new product page
12. Create `src/app/admin/(protected)/products/[id]/page.tsx` — edit product page
13. Add sidebar link to products in admin navigation
14. Tree-shake / final review
15. Build verification: `pnpm run build`

### Critical Patterns (enforced)

- **No new npm packages**: All dependencies (react-hook-form, zod, @tanstack/react-query, zustand, sonner, lucide-react) already in package.json
- **9 shadcn UI wrappers to create manually**: thin wrappers around existing @radix-ui packages (no `pnpm add shadcn` needed)
- **Permission gating**: `useAdminStore` permissions — `products.create/read/update/delete` control button visibility
- **Form via react-hook-form + zod**: No Zustand for form state. `useFieldArray` for variants and attributes.
- **Images**: Upload via `POST /api/upload` (multipart), store returned URL, pass in product payload
- **Variants**: `_destroy: true` for removal, `version` per variant for optimistic locking
- **Categories/brands/tags**: Fetched once per session (`staleTime: Infinity`)
- **Slug**: Auto-generated from name on blur, editable
- **Table search**: Debounced 300ms, `?search=` in URL via `useRouter.replace`
- **Bulk actions**: Checkbox column + toolbar buttons for activate/deactivate
- **Error/empty states**: Reuse `ErrorState` / `EmptyState` from `src/components/ui/`
- **Skeleton exports**: Each section component exports `*Skeleton` (existing convention)
- **Admin API client**: `adminRequest` from `AdminRequest.ts` for all admin API calls

### Completed

- **Phase 13** (Admin Dashboard): Dashboard with metric cards, donut chart, recent orders table, period selector, admin auth infrastructure (store, initializer, login page, sidebar, topbar, breadcrumbs, cookie guard). All files implemented, build passes.
- **Phase 12** (Customer Account & Addresses): All 5 files implemented, build passes. `AccountTabs`, `AccountPageContent`, `ProfileForm` (avatar upload), `AccountAddressForm`, `AccountAddresses`. Bug fix: `setDefaultAddress` wrapper returns `Promise<void>` not `Address`.
- **Phases 7-11**: Customer Cart, Checkout, Order History, Wishlist, Notifications, and prior features.

<!-- SPECKIT END -->
