# Implementation Plan: Admin Panel — Products

**Branch**: `014-admin-products` | **Date**: 2026-06-21 | **Spec**: `specs/014-admin-products/spec.md`

## Summary

Implement a full admin product management UI (list, create, edit, deactivate) with search, filter, bulk actions, and a multi-tab product form (basic info, attributes, images, tags, variants). This phase creates 6 files: an API wrapper module, a paginated data table component, a multi-tab form component, and 3 pages within the existing `admin/(protected)` route group. Permission gating is applied via `useAdminStore` — `products.create/read/update/delete` control button visibility and page access.

## Technical Context

- **Framework**: Next.js 15 (App Router), TypeScript 5 strict
- **UI**: React 19, Tailwind CSS 4, shadcn/ui (New York style, radix icons)
- **Icons**: lucide-react
- **State**: Zustand (`useAdminStore` for admin + permissions), TanStack React Query 5 (server state)
- **Forms**: react-hook-form + zod + @hookform/resolvers (existing pattern in `src/components/forms/`)
- **API Client**: `adminRequest` from `src/lib/api/AdminRequest.ts` (separate axios instance, `admin_access_token` in localStorage)
- **Toast**: sonner (`toast()` from `"sonner"`)
- **Theme**: next-themes, dark mode via `.dark` class
- **Language**: Arabic-first (RTL, lang="ar", dir="rtl")
- **Lint**: `pnpm run lint` (next lint) + `pnpm run build` (next build)
- **Existing form components**: `src/components/forms/` — `Button`, `Input`, `Select`, `FormField` (used throughout codebase, NOT shadcn Form components)
- **Existing UI components**: `src/components/ui/` — `Badge`, `Skeleton`, `Button` (shadcn), `Avatar`, `AlertDialog`, `ErrorState`, `EmptyState`, `LoadingState`, `Separator`, `DropdownMenu`
- **Missing shadcn wrappers** (need to create): `Tabs` (`@radix-ui/react-tabs` installed), `Dialog` (`@radix-ui/react-dialog` installed), `Table` (hand-written), `Command`/`Popover` for combobox
- **Available radix packages**: `@radix-ui/react-tabs`, `@radix-ui/react-dialog`, `@radix-ui/react-select`, `@radix-ui/react-label`, `@radix-ui/react-toast`, `@radix-ui/react-tooltip`
- **Testing**: Vitest + @testing-library/react (not used in this phase — testing deferred)
- **Admin infrastructure** (Phase 13, existing):
  - `src/app/admin/(protected)/layout.tsx` — server cookie guard + AdminSidebar + AdminTopBar + Breadcrumbs + AdminAuthInitializer
  - `src/lib/stores/admin.store.ts` — `useAdminStore` with `admin: AdminUser`, `isAuthenticated`, `permissions: string[]`
  - `src/lib/api/admin.ts` — existing wrappers for login/profile/logout/stats
  - `src/lib/api/AdminRequest.ts` — axios instance with admin auth interceptor

## Constitution Check

| Gate | Check | Status |
|------|-------|--------|
| Pre-Flight Checklist | Applied to every new file | ✅ |
| Package additions | Several shadcn wrappers need manual creation (tabs, dialog, table, checkbox, textarea, label, command, popover, form) — not from `pnpm add`, these are thin wrappers around existing radix packages | ✅ Wrappers only |
| No new dependencies for core logic | All patterns exist: react-hook-form, zod, zustand, @tanstack/react-query, sonner | ✅ |
| Existing patterns followed | Uses `adminRequest`, `useAdminStore`, `ErrorState`/`EmptyState`, skeleton export pattern, React Query | ✅ Confirm |

## Project Structure

```
src/
├── lib/
│   └── api/
│       └── admin-products.ts               # NEW — API wrappers + inline types for products CRUD
├── components/
│   ├── ui/
│   │   ├── tabs.tsx                        # NEW — shadcn Tabs wrapper (@radix-ui/react-tabs)
│   │   ├── dialog.tsx                      # NEW — shadcn Dialog wrapper (@radix-ui/react-dialog)
│   │   ├── table.tsx                       # NEW — shadcn Table wrapper (native <table> styled)
│   │   ├── checkbox.tsx                    # NEW — shadcn Checkbox wrapper (@radix-ui/react-checkbox)
│   │   ├── textarea.tsx                    # NEW — shadcn Textarea wrapper (<textarea> styled)
│   │   ├── label.tsx                       # NEW — shadcn Label wrapper (@radix-ui/react-label)
│   │   ├── command.tsx                     # NEW — shadcn Command wrapper (for combobox)
│   │   ├── popover.tsx                     # NEW — shadcn Popover wrapper (@radix-ui/react-popover)
│   │   └── form.tsx                        # NEW — shadcn Form wrapper (react-hook-form + Label)
│   └── admin/
│       ├── ProductsTable.tsx               # NEW — paginated data table with filters, search, bulk actions
│       └── ProductForm.tsx                 # NEW — multi-tab (5 tabs) create/edit form
└── app/
    └── admin/
        └── (protected)/
            └── products/
                ├── page.tsx                # NEW — products list page
                ├── new/
                │   └── page.tsx            # NEW — create product page
                └── [id]/
                    └── edit/
                        └── page.tsx        # NEW — edit product page
```

## Implementation Order

### Phase 2 — Implementation (6 files + 8 shadcn wrappers + 1 API mod)

---

#### 1. `src/lib/api/admin-products.ts` — API wrappers + types

**File**: `src/lib/api/admin-products.ts`

Inline types:
- `ProductStatus = "active" | "inactive"`
- `ProductImage`: `{ id: string; url: string; alt_text?: string; is_primary: boolean; sort_order: number }`
- `ProductVariant`: `{ id: string; sku?: string; price: number; discount_percent: number; stock_qty: number; is_active: boolean; version: number; options: { option_name: string; option_value: string }[]; images: ProductImage[] }`
- `ProductAttribute`: `{ id?: string; section: "details" | "specs"; label: string; value: string; sort_order: number }`
- `ProductListItem`: flat shape for table (id, name, slug, category_name?, brand_name?, base_price, discount_percent, stock_qty?, is_active, thumbnail_url?)
- `ProductDetail`: full shape matching Postman (id, name, slug, category_id, brand_id, description, about_points, base_price, discount_percent, is_active, is_featured, version, attributes, images, variants, tags)
- `ProductListResponse`: `{ data: ProductListItem[]; meta: { current_page: number; last_page: number; per_page: number; total: number } }`
- `CategoryOption`: `{ id: string; name: string; parent_id: string | null }`
- `BrandOption`: `{ id: string; name: string }`
- `TagOption`: `{ id: string; name: string; slug: string }`

API wrappers (all use `adminRequest`):
- `getProducts(params: { search?: string; category_id?: string; brand_id?: string; is_active?: string; page?: number; limit?: number; sort?: string }): Promise<ProductListResponse>`
- `getProduct(id: string): Promise<ProductDetail>`
- `createProduct(data: CreateProductPayload): Promise<ProductDetail>`
- `updateProduct(id: string, data: UpdateProductPayload): Promise<ProductDetail>`
- `deleteProduct(id: string): Promise<void>` — soft-delete (deactivate)
- `bulkUpdateProducts(ids: string[], action: "activate" | "deactivate"): Promise<void>`
- `getCategoryOptions(): Promise<CategoryOption[]>`
- `getBrandOptions(): Promise<BrandOption[]>`
- `getTagOptions(): Promise<TagOption[]>`
- `uploadMedia(file: File): Promise<{ url: string }>` — POST /api/admin/media (multipart/form-data)

Payload types (`CreateProductPayload`, `UpdateProductPayload`) use the same shape with optional fields. `UpdateProductPayload` adds `_destroy: true` support for variant/attribute removal.

**Query key factory** (also in this file):
```ts
export const adminProductsKeys = {
  all: ["admin", "products"] as const,
  lists: () => [...adminProductsKeys.all, "list"] as const,
  list: (filters: Record<string, unknown>) => [...adminProductsKeys.lists(), filters] as const,
  details: () => [...adminProductsKeys.all, "detail"] as const,
  detail: (id: string) => [...adminProductsKeys.details(), id] as const,
  categories: ["admin", "categories"] as const,
  brands: ["admin", "brands"] as const,
  tags: ["admin", "tags"] as const,
};
```

---

#### 2. `src/components/ui/tabs.tsx` — shadcn Tabs wrapper

Uses `@radix-ui/react-tabs`. Standard shadcn Tabs pattern with `TabsRoot`, `TabsList`, `TabsTrigger`, `TabsContent`. Export default.

---

#### 3. `src/components/ui/dialog.tsx` — shadcn Dialog wrapper

Uses `@radix-ui/react-dialog`. Standard shadcn Dialog: `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription`, `DialogClose`.

---

#### 4. `src/components/ui/table.tsx` — shadcn Table wrapper

Native `<table>` with Tailwind classes. Exports: `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`, `TableCaption`. No radix dependency.

---

#### 5. `src/components/ui/checkbox.tsx` — shadcn Checkbox wrapper

Uses `@radix-ui/react-checkbox` (need `pnpm add @radix-ui/react-checkbox`). Standard shadcn Checkbox.

---

#### 6. `src/components/ui/textarea.tsx` — shadcn Textarea wrapper

Native `<textarea>` with Tailwind styling. Mirrors `Input.tsx` pattern.

---

#### 7. `src/components/ui/label.tsx` — shadcn Label wrapper

Uses `@radix-ui/react-label`. Standard shadcn Label with `peer-disabled` styling.

---

#### 8. `src/components/ui/command.tsx` — shadcn Command wrapper

Uses `cmdk` (need `pnpm add cmdk`). Standard shadcn Command pattern: `Command`, `CommandDialog`, `CommandInput`, `CommandList`, `CommandEmpty`, `CommandGroup`, `CommandItem`, `CommandSeparator`.

---

#### 9. `src/components/ui/popover.tsx` — shadcn Popover wrapper

Uses `@radix-ui/react-popover` (need `pnpm add @radix-ui/react-popover`). Standard shadcn Popover: `Popover`, `PopoverTrigger`, `PopoverContent`.

---

#### 10. `src/components/ui/form.tsx` — shadcn Form wrapper

Uses `react-hook-form` `useFormContext` + `@radix-ui/react-label`. Standard shadcn Form: `FormProvider`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormDescription`, `FormMessage`.

---

#### 11. `src/app/admin/(protected)/products/page.tsx` — Products list page

**File**: `src/app/admin/(protected)/products/page.tsx`

- `"use client"` — needs interactivity
- Wraps `<ProductsTable />` in `<Suspense>` (for `useSearchParams`)
- Page metadata: page title "Products" and "Add Product" button (gated by `products.create` permission)
- `useSearchParams` for reading filter/search state from URL
- `useRouter.replace` for setting filters in URL

Structure:
```tsx
export default function AdminProductsPage() {
  return (
    <Suspense fallback={<ProductsTableSkeleton />}>
      <ProductsPageContent />
    </Suspense>
  );
}
```

---

#### 12. `src/components/admin/ProductsTable.tsx` — Data table with filters, search, bulk actions, pagination

**File**: `src/components/admin/ProductsTable.tsx`

Sections (all in one file, each independent):

**State management**:
- `searchParams` from URL via `useSearchParams` — search, category_id, brand_id, is_active, page
- `router.replace` for URL sync (period-in-URL pattern from dashboard)
- Local state for selected row IDs (Set<string>)

**Data fetching** (each filter value change triggers `refetch` via query key change):
- `useQuery(adminProductsKeys.list(filters), () => getProducts(filters))`
- `useQuery(adminProductsKeys.categories, getCategoryOptions)` — preloads filter dropdowns
- `useQuery(adminProductsKeys.brands, getBrandOptions)` — preloads filter dropdowns

**Layout**:
```
┌─────────────────────────────────────────────────────────────┐
│  Title row: "Products (245)"                    [+ Add Product] │
├─────────────────────────────────────────────────────────────┤
│  Search input [text...]  Category ▼  Brand ▼  Status ▼     │
├─────────────────────────────────────────────────────────────┤
│  [Bulk action bar — shown when rows selected]               │
│  "2 selected"  [Activate]  [Deactivate]                     │
├─────────────────────────────────────────────────────────────┤
│  Table: ☐ | Image | Name | Category | Brand | Price | Stock │
│         ☐ | [img] | ...  | ...      | ...   | ...   | ...  │
│         ☐ | [img] | ...  | ...      | ...   | ...   | ...  │
├─────────────────────────────────────────────────────────────┤
│  Pagination: ◀ 1 2 3 ... 10 ▶   20 per page                │
└─────────────────────────────────────────────────────────────┘
```

**Filter bar**:
- Search: debounced input (300ms) using `useEffect` + `setTimeout`
- Category: `<Select>` populated from `getCategoryOptions`; value = `all|categ-id`
- Brand: `<Select>` populated from `getBrandOptions`; value = `all|brand-id`
- Status: `<Select>` with options: All | Active | Inactive; value = `all|true|false`

**Table columns**:
1. Checkbox (multi-select, gated by `products.update`)
2. Thumbnail — 40x40 rounded image, fallback to placeholder
3. Name — link to edit page (if `products.update`) or plain text
4. Category — category name from join
5. Brand — brand name from join
6. Price — formatted with discount strikethrough if `discount_percent > 0`
7. Stock — `sum of variant stock` or badge "N/A"
8. Status — Badge: green "Active" / gray "Inactive"
9. Actions — Edit button (if `products.update`), Deactivate button (if `products.delete`)

**Bulk action bar**:
- Shown when `selectedIds.size > 0` AND `products.update` permission
- "N selected" text + `[Activate]` + `[Deactivate]` buttons
- Uses `useMutation` for bulk status update, invalidates list query on success
- Toast on success/failure

**Pagination**:
- Page size: 20 (from spec)
- Page buttons with ellipsis
- `useMemo` for page range calculation
- Previous/Next buttons with disabled state

**States**:
- Loading: `<ProductsTableSkeleton>` with 5 skeleton rows
- Empty: `<EmptyState>` with "No products found" + "Clear Filters" button (when filters active)
- Error: `<ErrorState>` with retry button
- Each section (filter bar, table, pagination) is independently rendered

**Permission gating** (all from `useAdminStore`):
- `products.read` — table data visible (if missing, redirect to dashboard — but layout handles page-level)
- `products.create` — "Add Product" button visible
- `products.update` — Edit per-row button + bulk action bar
- `products.delete` — Deactivate per-row button

---

#### 13. `src/components/admin/ProductForm.tsx` — Multi-tab product form (create/edit)

**File**: `src/components/admin/ProductForm.tsx`

**Props**:
```ts
interface ProductFormProps {
  mode: "create" | "edit";
  productId?: string; // only in edit mode
  initialData?: ProductDetail; // pre-fetched
}
```

**Form state management**:
- `useForm` with `zodResolver` — top-level form for the entire product
- Zod schema validates: name (required, non-empty), base_price (required, positive), category_id (required), discount_percent (0-100), slug (optional but validated if present)
- `defaultValues` populated from `initialData` in edit mode, empty defaults in create mode
- `watch` for slug auto-generation: watch `name`, slugify on change only if slug hasn't been manually edited

**Tab structure** (5 tabs using `<Tabs>` from `src/components/ui/tabs.tsx`):

**Tab 1: Basic Info**
```
Fields:
- Name (required) — Input, triggers slug generation
- Slug — Input (auto-populated, manually editable)
- Description — Textarea
- Category (required) — Select with categories from query
- Brand — Select with brands from query (optional)
- Base Price (required) — Input type number
- Discount Percent — Input type number (0-100), default 0
- Is Featured — Checkbox
- Is Active — Checkbox, default true (create) / current (edit)
```

**Tab 2: About & Attributes**
```
Section: About Points
- Dynamic list of text inputs
- "Add Point" button (max 10)
- Each item: text input + remove button (×)
- Empty state: "No about points added yet"

Section: Details Attributes
- Dynamic list of key-value pairs
- "Add Detail" button (max 20)
- Each item: label input + value input + remove button (×)

Section: Specs Attributes
- Dynamic list of key-value pairs
- "Add Spec" button (max 20)
- Each item: label input + value input + remove button (×)
```
Uses `useFieldArray` from react-hook-form for all three dynamic lists.

**Tab 3: Images**
```
- Drag-and-drop upload area (simple: input[type=file] accept="image/*" multiple)
- Preview thumbnails grid (4 columns)
  - Each thumbnail: image preview, "Primary" badge (if primary), reorder buttons (↑↓), remove button (×)
  - Click: set as primary (radio behavior)
- Upload: calls `uploadMedia(file)` -> gets URL -> adds to form array
- Max images: no hard limit, but UI shows first 20 with scroll
- Error state per image (retry upload or remove)
```

**Tab 4: Tags**
```
- Multi-select combobox using Command + Popover
- Input: type to search existing tags
- Selected tags shown as badges below combobox
- "Create tag" option at bottom of dropdown if no match found
- Dropdown data from getTagOptions()
- Tag creation inline: input field + "Add" button
```

**Tab 5: Variants**
```
- List of existing variants (edit mode) or empty list (create mode)
- "Add Variant" button

Each variant card:
  - Option pairs: key (Input) + value (Input) + "Remove option" button
    - Default: one blank pair
  - SKU — Input (optional at create, required at edit if present)
  - Price — Input type number (defaults to base_price)
  - Discount Percent — Input type number (0-100)
  - Stock Qty — Input type number
  - Images — small upload area (same as Tab 3 but for variant)
  - Is Active — Checkbox (default true)
  - Remove variant button (with confirmation if it has images)
  - In edit mode: variant has `version` field (hidden input for optimistic locking)

Variant duplicate detection: before submit, check for duplicate option combinations. Show inline warning on the variant that duplicates another.
```

**Unsaved changes warning**:
- Track `isDirty` from react-hook-form
- Before navigating away (beforeunload + Next.js route change), show confirmation dialog
- Use `useEffect` for `beforeunload` event
- Use `React.useCallback` + router events for Next.js navigation guard

**Submit logic**:
- Create: `useMutation(createProduct)` -> invalidate list -> redirect to `/admin/products`
- Edit: `useMutation(updateProduct)` with `productId` -> invalidate list + detail -> redirect to `/admin/products`
- On error: toast with API error message; field-level errors mapped to form fields where possible
- Loading state: Submit button shows spinner, all fields disabled

**Variants with `_destroy` in edit mode**:
- Track removed variants in local state
- On submit, include `_destroy: true` in removed variant payloads
- API expects `{ ...variant, _destroy: true }` to deactivate

---

#### 14. `src/app/admin/(protected)/products/new/page.tsx` — Create product page

**File**: `src/app/admin/(protected)/products/new/page.tsx`

Simple page:
```tsx
"use client";
import { ProductForm } from "@/components/admin/ProductForm";

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Add Product</h1>
      <ProductForm mode="create" />
    </div>
  );
}
```

---

#### 15. `src/app/admin/(protected)/products/[id]/edit/page.tsx` — Edit product page

**File**: `src/app/admin/(protected)/products/[id]/edit/page.tsx`

```tsx
"use client";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getProduct } from "@/lib/api/admin-products";
import { adminProductsKeys } from "@/lib/api/admin-products";
import { ProductForm } from "@/components/admin/ProductForm";
import { ErrorState } from "@/components/ui/ErrorState";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: adminProductsKeys.detail(id),
    queryFn: () => getProduct(id),
    enabled: !!id,
  });

  if (isLoading) return <EditProductPageSkeleton />;
  if (isError) return <ErrorState title="Failed to load product" message={(error as Error)?.message} onRetry={() => refetch()} />;
  if (!data) return <ErrorState title="Product not found" />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Edit: {data.name}</h1>
      <ProductForm mode="edit" productId={id} initialData={data} />
    </div>
  );
}
```

### Phase 3 — Verification

1. **TypeScript check**: `pnpm run lint` must pass with zero errors
2. **Build**: `pnpm run build` must succeed with zero errors
3. **Manual verification**:
   - Navigate to `/admin/products` — table renders with data from API, skeletons show on load
   - Filter by category, brand, status — URL updates, data refetches
   - Search by name — debounced, filters correctly
   - Select rows, bulk deactivate — toast confirms, list refreshes
   - Click "Add Product" — form loads with empty tabs
   - Fill name, slug auto-populates; fill category, price, save — redirects to list with success toast
   - Click "Edit" on a product — form loads with pre-populated data
   - Edit a field, save — changes reflected in list
   - Click "Deactivate" on a product — confirm dialog, product marked inactive
   - Test unsaved changes warning — navigate away with dirty form, dialog appears
   - Test permission gating — verify buttons hidden when permissions absent
4. **Edge cases**:
   - Empty product list: `<EmptyState>` renders
   - API error during load: `<ErrorState>` with retry renders
   - API error during save: toast with error, form stays intact
   - Duplicate slug on save: API error shown as toast
   - Version conflict on variant edit: API error toast, instructs to reload
   - Image upload failure: per-image retry, other data preserved

## Architecture Decisions

### 1. Sections independence (same as dashboard pattern)
Each data-fetching section within `ProductsTable` owns its own `useQuery`. Failure of filter options (categories/brands load) does not block the product list from rendering. The table renders with an empty filter bar if options fail to load.

### 2. Tab-based form with single submit
All 5 tabs share a single `useForm` instance. This avoids multi-step wizard complexity and allows the user to fill tabs in any order. `useFieldArray` handles dynamic lists (about points, attributes, variants). On submit, only filled/valid tabs contribute to the payload.

### 3. Slug auto-generation with dirty tracking
`watch("name")` triggers slug generation only if the slug field hasn't been touched by the user. A `useRef<boolean>(false)` tracks `slugManuallyEdited`. Once the user edits slug manually, auto-generation stops.

### 4. Permission gating via zustand store
Permissions are read from `useAdminStore((s) => s.admin?.permissions ?? [])`. A helper `hasPermission(perm: string): boolean` checks membership. This is used inline in JSX (ternary for buttons, conditional rendering for sections). No redirect logic needed at page level beyond the existing layout guard.

### 5. Optimistic locking for variants
Each variant in edit mode carries a hidden `version` field from the API response. On submit, this version is sent back. If the API returns a 409 conflict, the form shows a toast: "This variant was modified by another admin. Please reload and try again." The form stays intact so no data is lost.

### 6. Validation approach
Minimal client-side validation per spec — only name (required, non-empty), base_price (required, positive number), category_id (required). All other validation deferred to backend. Zod schema enforces only these rules. Variant duplicate detection runs client-side as a separate check before submit (not in schema).

### 7. Image upload as separate step
Images are not sent as part of the product payload as raw files. Instead:
- User selects files via `<input type="file">`
- Each file is uploaded via `uploadMedia(file)` -> returns URL
- URL is stored in the form's images array
- On product save, image URLs (not files) are sent

This matches the Postman contract (`POST /api/admin/media` returns URL).

### 8. No new packages for core components
The following packages need `pnpm add`:
- `@radix-ui/react-checkbox` (not in package.json)
- `@radix-ui/react-popover` (not in package.json)
- `cmdk` (for Command component, not in package.json)

All other dependencies (`@radix-ui/react-tabs`, `@radix-ui/react-dialog`, etc.) are already in package.json.

### 9. Query key factory pattern
Following the dashboard pattern (inline string keys like `["admin", "stats", period]`), the products module uses a lightweight factory `adminProductsKeys` for consistency and type safety. List queries include filter params in the key so that changing any filter triggers a refetch.

### 10. Form component location
`ProductForm.tsx` lives in `src/components/admin/` alongside other admin components (`DashboardRecentOrders`, `AdminAuthInitializer`, etc.). It is NOT in a forms subdirectory because it is an admin-specific composed form, not a reusable input component.

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Missing radix packages (checkbox, popover) break build | Medium | High | Run `pnpm add` early in Phase 2; verify build after step 1 |
| Variant `_destroy` convention not matched by API | Low | Medium | Add a comment in `admin-products.ts` noting the convention; adjust if API uses `is_active: false` instead |
| Form bundle size too large (5 tabs, many subcomponents) | Low | Medium | All components in one file (`ProductForm.tsx`) to avoid bundle overhead; lazy-load by tab is overengineering for an admin page |
| `cmdk` package breaking change | Low | Low | Pin version in package.json; use stable API subset (CommandInput, CommandList, CommandItem, CommandEmpty) |
| Slug auto-generation conflicts with manually-edited slug after page re-render | Medium | Low | Use a ref (`slugManuallyEdited`) that is set once when user edits slug; useEffect for auto-gen only fires when this ref is false |
| Variant duplicate detection race condition | Low | Low | Check runs synchronously before submit; if API also rejects, show toast as fallback |
| New shadcn wrappers inconsistent with existing codebase patterns | Medium | Medium | Follow existing component conventions (use `cn()`, export as named function, forwardRef where applicable); review against `Button.tsx`/`Input.tsx` patterns |
