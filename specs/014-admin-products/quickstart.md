# Quickstart: Admin Products

## Setup

```bash
git checkout 014-admin-products
```

No new npm packages needed — all dependencies (react-hook-form, zod, @tanstack/react-query, zustand, sonner, lucide-react, recharts, shadcn radix packages) already in `package.json`.

9 shadcn UI wrappers need manual creation (thin wrappers around existing radix packages):
`tabs.tsx`, `dialog.tsx`, `table.tsx`, `checkbox.tsx`, `textarea.tsx`, `label.tsx`, `command.tsx`, `popover.tsx`, `form.tsx`

## Implementation Order (15 steps per plan.md)

| # | Step | Files |
|---|------|-------|
| 1 | Create 9 shadcn UI wrappers | `src/components/ui/{tabs,dialog,table,checkbox,textarea,label,command,popover,form}.tsx` |
| 2 | Create `admin-products.ts` API wrappers | `src/lib/api/admin-products.ts` |
| 3 | Create `ProductsTable` component | `src/components/admin/ProductsTable.tsx` |
| 4 | Create `ProductFormBasicInfo` tab | `src/components/admin/ProductFormBasicInfo.tsx` |
| 5 | Create `ProductFormAttributes` tab | `src/components/admin/ProductFormAttributes.tsx` |
| 6 | Create `ProductFormImages` tab | `src/components/admin/ProductFormImages.tsx` |
| 7 | Create `ProductFormTags` tab | `src/components/admin/ProductFormTags.tsx` |
| 8 | Create `ProductFormVariants` tab | `src/components/admin/ProductFormVariants.tsx` |
| 9 | Create `ProductForm` container | `src/components/admin/ProductForm.tsx` |
| 10 | Create products list page | `src/app/admin/(protected)/products/page.tsx` |
| 11 | Create new product page | `src/app/admin/(protected)/products/new/page.tsx` |
| 12 | Create edit product page | `src/app/admin/(protected)/products/[id]/page.tsx` |
| 13 | Add sidebar link | Update admin sidebar navigation |
| 14 | Tree-shake / final review | Remove unused imports, verify build |
| 15 | Build verification | `pnpm run build` |

## Data Flow

```
pages (list/new/[id])              ← "use client", React Query, useAdminStore for permissions
  ↓ useQuery / useMutation
src/lib/api/admin-products.ts       ← adminRequest.get/post/put/delete
  ↓ fetch
GET    /api/admin/products?page=&search=&category_id=...
GET    /api/admin/products/:id
POST   /api/admin/products
PUT    /api/admin/products/:id
DELETE /api/admin/products/:id
GET    /api/admin/categories
GET    /api/admin/brands
GET    /api/admin/tags
POST   /api/upload (multipart)
```

## Key Decisions

- **Permission gating**: `products.read` → table access, `products.create` → Add button, `products.update` → Edit button, `products.delete` → Deactivate button
- **Form tabs**: 5 tabs via shadcn Tabs — Basic Info, Attributes, Images, Tags, Variants. Zustand for cross-tab dirty state? No — react-hook-form manages all fields globally across tabs
- **Images**: Upload one-by-one via `/api/upload`, inject returned URL into react-hook-form array. `useDropzone`? No — native `<input type="file">` to minimize dependencies
- **Variants**: `useFieldArray` from react-hook-form, `_destroy: true` for removal, `version` field per variant for optimistic locking
- **Categories/brands/tags**: Fetched once per session (`staleTime: Infinity`) via React Query
- **Slug**: Auto-generated from name (sluggify on blur) but editable
- **Table search**: Debounced (300ms) input, triggers `router.replace` with `?search=...`
- **Bulk actions**: Checkbox column, "Activate" / "Deactivate" buttons in toolbar when items selected

## Build Verification

```bash
pnpm run build
```
