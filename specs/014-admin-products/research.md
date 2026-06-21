# Research: Admin Products — Phase 0

## Tech Inventory

| Item | Status | Notes |
|------|--------|-------|
| `recharts` in `package.json` | Exists | Installed for Phase 13 dashboard charts; available for donut/reuse |
| `react-hook-form` + `zod` | Exists | Used in customer account forms (Phase 12) |
| `@hookform/resolvers` | Exists | Used for zodResolver in existing forms |
| `zustand` | Exists | Used for admin store (profile, auth state) |
| `@tanstack/react-query` | Exists | Used for dashboard data fetching; will use for products list/form |
| Admin API client (`adminRequest`) | Exists | `AdminRequest.ts` — separate axios instance with admin Bearer token |
| Admin auth guard | Server-side | `admin/(protected)/layout.tsx` checks cookie, redirects to `/admin/login` |
| Admin store (`useAdminStore`) | Exists | Stores `admin` object with `permissions: string[]` |
| Product list types (customer-facing) | Exists | `src/lib/types/product.ts` — `ProductDetail`, `ProductListItem`, `ProductVariant`, `ProductImage`, `ProductAttributes` |
| Product API client (customer-facing) | Exists | `src/lib/api/products.ts` — `getProducts()`, `getProductBySlug()` |
| Brands API client (customer-facing) | Exists | `src/lib/api/brands.ts` — `getBrands()` |
| Categories API client (customer-facing) | Exists | `src/lib/api/categories.ts` — `getCategoryTree()`, `getCategoryBySlug()` |
| Tabs component | Exists | shadcn `Tabs` — `src/components/ui/tabs.tsx` |
| DataTable component | **Check** | Need to locate existing table pattern or use shadcn `Table` |
| Dialog component | Exists | shadcn `Dialog` — for deactivation confirmation |
| Toast component | Exists | `sonner` or shadcn `Toast` |
| Select component | Exists | shadcn `Select` — for category/brand filter dropdowns |
| Skeleton component | Exists | `src/components/ui/skeleton.tsx` |
| ErrorState component | Exists | `src/components/ui/ErrorState.tsx` |
| EmptyState component | Exists | `src/components/ui/EmptyState.tsx` |
| Badge component | Exists | `src/components/ui/badge.tsx` — CVA with status variants |
| Button component | Exists | `src/components/ui/button.tsx` — CVA with variants/sizes |
| Input / Textarea components | Exists | shadcn `Input`, `Textarea` |
| Form component | Exists | shadcn `Form` (react-hook-form wrapper) |
| Checkbox component | Exists | shadcn `Checkbox` — for bulk selection |
| Avatar component | Exists | shadcn `Avatar` — for thumbnail fallback |
| Upload API (customer-facing) | Exists | `src/lib/api/payments.ts` — `uploadFile()` sends multipart to `/api/upload` |
| Command / Popover components | Exists | shadcn — for tag multi-select combobox |
| Separator component | Exists | shadcn `Separator` |
| Tooltip component | Exists | shadcn `Tooltip` |
| Image component (Next.js) | Exists | `next/image` — for product thumbnails |

## Key Findings

### 1. Admin Product List Endpoint Pattern

**Decision**: Assume `GET /api/admin/products` follows the same paginated/filtered pattern as `GET /api/admin/orders`, returning a `{ data: [...], meta: { page, limit, total, totalPages } }` envelope.

**Rationale**: The admin orders endpoint (`GET /api/admin/orders?limit=5&sort=newest`) is the only admin list endpoint pattern established in Phase 13. Its response shape (`{ data, meta }`) mirrors the customer-facing product list (`src/lib/api/products.ts` returns `{ data, pagination }`). It is reasonable to assume the admin products endpoint follows the same convention with additional product-specific filter params.

**Alternatives considered**:
- A flat array response (no envelope) — rejected because pagination metadata would need a separate header or be absent, and the established pattern uses envelopes.
- Reusing the customer-facing `GET /api/products` — rejected because admin endpoints require auth, include inactive products, and accept admin-specific filters.

**Assumed query parameters**:

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `search` | `string` | No | — | Search by product name |
| `category_id` | `uuid` | No | — | Filter by category |
| `brand_id` | `uuid` | No | — | Filter by brand |
| `is_active` | `boolean` | No | — | Filter by active status |
| `page` | `number` | No | `1` | Page number |
| `limit` | `number` | No | `20` | Items per page |
| `sort` | `string` | No | `newest` | Sort order `newest`/`oldest`/`price_asc`/`price_desc`/`name_asc`/`name_desc` |

**Assumed response shape** (`GET /api/admin/products?page=1&limit=20&sort=newest`):

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Product Name",
      "slug": "product-name",
      "description": "...",
      "base_price": 99.99,
      "discount_percent": 10,
      "category": { "id": "uuid", "name": "Category", "slug": "category" },
      "brand": { "id": "uuid", "name": "Brand", "slug": "brand" },
      "primary_image": { "url": "https://...", "alt_text": null },
      "stock_qty": 50,
      "is_active": true,
      "is_featured": false,
      "rating_avg": 4.5,
      "rating_count": 120,
      "created_at": "2026-01-01T00:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

---

### 2. Category/Brand List Strategy

**Decision**: Fetch categories and brands on mount using `useQuery` with `staleTime: Infinity` and `gcTime: Infinity` (i.e., fetch once and cache indefinitely in React Query).

**Rationale**: Categories and brands are reference data that changes infrequently (managed by admins in separate admin screens). Fetching once and caching eliminates redundant network requests across the products list page (filter dropdowns) and the product form (category/brand selects). React Query's cache deduplicates so multiple components can call `useQuery` with the same key without causing multiple fetches.

**Alternatives considered**:
- Zustand store for categories/brands — rejected because React Query already handles caching, deduplication, and stale-while-revalidate with zero boilerplate. Zustand would require manually managing fetch-on-mount, loading states, and cache invalidation.
- Fetch on every mount — rejected because it would cause unnecessary network requests on page navigation within the admin panel.
- SSR categories into a script tag — rejected because these are client-side dropdowns; extra HTML payload would increase page size for marginal benefit.

**Implementation approach**:
- Use `useQuery` with key `["admin", "categories"]` calling `GET /api/admin/categories` and `["admin", "brands"]` calling `GET /api/admin/brands`.
- `staleTime: Infinity` + `gcTime: Infinity` ensures a single fetch per session.
- Expose via custom hooks `useAdminCategories()` and `useAdminBrands()` in `src/lib/api/admin.ts` or a dedicated query hooks file.

---

### 3. Image Upload Workflow

**Decision**: Use a two-step workflow — (1) user selects file → upload to `POST /api/admin/media` → receive URL, (2) include the URL in the product create/update payload. Images are sent as URLs, not raw files, in the product payload.

**Rationale**: This separates concerns — the media upload endpoint handles file validation, resizing, CDN distribution, etc. The product endpoint receives a simple URL string, keeping the product payload lightweight and avoiding multipart handling at the product resource level. This pattern is consistent with the existing customer upload flow (`src/lib/api/payments.ts` uploads a file to `/api/upload` and receives a URL).

**Alternatives considered**:
- Multipart upload directly to the product endpoint — rejected because it complicates the product resource endpoint and prevents reuse of uploaded images across products.
- Base64-encoded images in the JSON payload — rejected because it bloats payload size and is not a standard API practice.
- Client-side image upload directly to S3/cloud storage — rejected because it exposes storage credentials and requires complex signed-URL logic on the client.

**Implementation approach**:
- Create `src/lib/api/admin.ts` wrapper: `uploadProductImage(file: File): Promise<{ url: string }>` which posts multipart to `/api/admin/media`.
- On the client, use a file input or dropzone that triggers `uploadProductImage` per file on selection (or on "Upload" button click). Show a loading spinner per upload, then display the returned URL as a thumbnail with a remove button.
- The product form's Images tab collects an ordered array of `{ url: string; alt_text: string; is_primary: boolean; sort_order: number }` — all URLs are already resolved before form submission.
- Error handling: per-image retry, toast on failure, form remains fillable.

---

### 4. Variant Builder Approach

**Decision**: Variants are managed dynamically as an array of objects within the product form. Each variant has an `options` array (`option_name`/`option_value` pairs), plus `sku`, `price`, `discount_percent`, `stock_qty`, `images`, and `version`. On update, removed variants are marked with `_destroy: true`. The `version` field enables optimistic locking.

**Rationale**: Variants are tightly coupled to their parent product — managing them as a nested array within the product payload ensures atomicity (all variant changes succeed or fail together). The `_destroy` convention is a well-established Rails/API pattern for soft-deleting nested resources in a single request. The `version` field prevents lost updates when two admins edit the same product concurrently.

**Alternatives considered**:
- Separate CRUD endpoints for variants (`/api/admin/products/:id/variants`) — rejected because it introduces N+1 API calls for a product form with many variants, and cannot guarantee atomicity without a transaction-like mechanism on the client.
- DELETE endpoint for variant removal — rejected because it requires a separate API call per removed variant and complicates the save flow with multiple requests.
- UI grid-based variant generator (like a spreadsheet grid where each column is an option type and each row is a variant) — rejected as over-engineering; the key-value pair approach is simpler and is what the Postman collection references (`option_name`, `option_value`).

**Implementation approach**:
- Use `useFieldArray` from `react-hook-form` to manage the variants array dynamically.
- Each variant form row contains:
  - Option pairs (themselves a nested field array for `option_name`/`option_value`)
  - SKU (text input)
  - Price override (optional number)
  - Discount percent (optional number 0–100)
  - Stock quantity (number)
  - Variant images (upload per variant)
  - `_destroy: true` flag (hidden field, set when admin clicks remove)
  - `version` (hidden field, populated from API response on edit; omitted on create)
- On form submission, filter out variants with `_destroy: true` on create, or include them with the flag on update.
- On save conflict (HTTP 409), show a toast "Product was modified by another admin. Please reload and try again."

---

### 5. Permission Gating Strategy

**Decision**: Read permissions from `useAdminStore().admin.permissions` (a `string[]`). Check membership with a simple `Array.includes()` helper. UI elements are conditionally rendered; the product list page redirects if the admin lacks `products.read`.

**Rationale**: The admin profile endpoint (`GET /api/admin/auth/me`) already returns a `permissions` array stored in the Zustand admin store via `AdminAuthInitializer`. This is the single source of truth for permissions across all admin phases. No additional API call is needed — the store is populated on page load and persists for the session.

**Alternatives considered**:
- Server-side permission check via cookie or JWT claim — rejected because the current auth flow does not embed permissions in the JWT/cookie; permissions are fetched from `/api/admin/auth/me`.
- Dedicated permission-check API endpoint — rejected as unnecessary overhead; permissions are already available client-side from the admin store.
- Higher-order component wrapper (`withPermission("products.create")`) — rejected in favor of inline checks for simplicity; the number of gated elements is small enough that a wrapper adds more complexity than it removes.

**Implementation approach**:
- Create a utility helper `can(permission: string): boolean` that reads from `useAdminStore.getState().admin?.permissions` or directly calls the hook.
- Usage pattern:
  - **List page**: `useAdminStore().admin?.permissions` — if no `products.read` after store loads, `router.replace("/admin")` with a toast "Access denied".
  - **Add Product button**: `{can("products.create") && <Button>Add Product</Button>}`
  - **Edit button per row**: `{can("products.update") && <Button>Edit</Button>}`
  - **Deactivate button**: `{can("products.delete") && <Button>Deactivate</Button>}`
  - **Bulk actions bar**: `{can("products.update") && <BulkActionBar />}`
- The admin store is populated before any content renders because `AdminAuthInitializer` runs in the protected layout above the page content.

---

### 6. Form Architecture (Create vs Edit with Multi-Tab)

**Decision**: A single `ProductForm` component shared between create and edit modes. Mode is determined by whether a product ID is present. The form uses `react-hook-form` with `zod` validation schema. Tabs are rendered via shadcn `Tabs` component.

**Rationale**: Create and edit share the same fields, validation, and layout. A single form component avoids duplication and ensures the two modes stay in sync. The minimal client-side validation (name required, base_price positive, category required) is enforced by zod; the backend remains the source of truth for all other validation.

**Alternatives considered**:
- Separate `CreateProductForm` and `EditProductForm` — rejected because >90% of the form structure is identical, leading to code duplication.
- Wizard/stepper instead of tabs — rejected because tabs are faster to navigate, allow random-access to any section, and follow the shadcn convention already present in the codebase.
- Server component for the form — rejected because the form is heavily interactive (dynamic variant builder, image upload, attribute management) and requires client-side state.

**Implementation approach**:
- Route: `/admin/products/new` (create) and `/admin/products/[id]/edit` (edit).
- `ProductFormPage` reads `params.id` to determine mode, fetches product data for edit via `useQuery`, passes to `ProductForm` component.
- `ProductForm` uses controller pattern — each tab is a form section with its own `useFieldArray` where needed.
- Tabs: Basic Info, About & Attributes, Images, Tags, Variants.
- Unsaved changes detection via `react-hook-form`'s `formState.isDirty` combined with `beforeunload` event and `next/navigation`'s intercept.

---

### 7. Stock Quantity Aggregation

**Decision**: Display the sum of all active variant stock quantities as the product-level "Stock Qty" in the list table. If the product has no variants, display `0`.

**Rationale**: The admin products list endpoint is assumed to return a `stock_qty` field (sum of variant stock). If the endpoint does not return this field, the frontend fetches the product detail for each row (N+1) — which is unacceptable — or displays `—` and defers to the product edit page. The preferred approach is to confirm with the backend team that the list endpoint includes `stock_qty`.

**Alternatives considered**:
- Compute on the frontend from individual variant data — rejected because the list endpoint may not return variants (too much data per row).
- Omit stock quantity from the list table — rejected because FR-001 requires it.

**Fallback**: If `stock_qty` is absent from the list response, show a dash `—` with a tooltip "Open product to view stock" rather than making N additional API calls.

---

### 8. Slug Auto-Generation

**Decision**: Auto-generate the slug from the name field using `name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')` when the name field changes. The slug input remains manually editable and does not auto-overwrite once manually edited.

**Rationale**: Auto-generating the slug from the name improves UX by saving the admin a step. However, if the admin manually edits the slug, subsequent name changes should not overwrite it (a common frustration in CMS systems). A simple "edited" flag tracks whether the user has touched the slug field.

**Alternatives considered**:
- Slugify on blur only (not on every keystroke) — rejected because immediate feedback is more intuitive.
- Never auto-generate — rejected because it adds friction to product creation.
- Always auto-generate on name change — rejected because it discards manual edits.

**Implementation**: Use `watch("name")` in `react-hook-form` and `setValue("slug", slugifiedValue)` only if the slug field has not been manually touched (tracked via a separate `slugManuallyEdited` ref or by comparing the current slug to the slugified name).

---

### 9. SSG/ISR Considerations

**Decision**: All admin product pages use dynamic rendering (`dynamic = "force-dynamic"` or no export). No static generation or ISR.

**Rationale**: Admin product data changes frequently (price updates, stock changes, product creation), and is behind authentication. There is no SEO benefit to static generation. Every page load should reflect the latest server state. This is consistent with the Phase 13 dashboard approach.

**Alternatives considered**:
- ISR with revalidation — rejected because admin data requires latest-state always; stale data in admin tools leads to incorrect business decisions (e.g., selling out-of-stock items).
- Static generation with on-demand revalidation — rejected due to unnecessary complexity; admin pages are low-traffic and dynamic rendering has negligible performance impact.

---

### 10. Bulk Actions (Activate/Deactivate)

**Decision**: Implement bulk activate/deactivate by sending a `PATCH /api/admin/products/bulk` (or `POST /api/admin/products/bulk/activate`) with an array of product IDs. The checkbox selection uses a `useFieldArray` or simple `Set<string>` state for selected IDs.

**Rationale**: A dedicated bulk endpoint is more efficient than N individual PATCH requests. The pattern is standard for admin panels. The selected IDs set is transient (not persisted in URL or store) — it resets on page navigation.

**Alternatives considered**:
- N individual PATCH requests with Promise.all — rejected as wasteful; the backend already supports bulk operations (confirmed by the Postman collection reference in the spec).
- URL-based selection persistence — rejected because it clutters the URL and is not needed; bulk selection is a per-page-session action.

**Implementation approach**:
- Add a column of checkboxes in the table header (select-all) and per row.
- Track selected IDs in a `Set<string>` via `useState`.
- Show a floating bulk action bar when `selectedIds.size > 0`.
- On "Activate"/"Deactivate" click, call `PATCH /api/admin/products/bulk` with `{ ids: [...selectedIds], is_active: true/false }`.
- On success, invalidate `["admin", "products"]` query, clear selection, show success toast.
