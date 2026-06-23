# Quickstart: Admin Categories, Brands & Tags

## Prerequisites

- Node.js 20+, pnpm 9+
- Backend running at the URL configured in `NEXT_PUBLIC_API_URL` or `NEXT_PUBLIC_BACKEND_URL`
- Admin account with granular permissions: `categories.read/create/update/delete`, `brands.read/create/update/delete`, `tags.read/create/update/delete`

## Getting Started

No new npm packages are needed. All dependencies are already in `package.json`.

## Key Files

### API Layer
- `src/lib/api/admin-taxonomy.ts` — API wrappers and inline types for categories, brands, and tags CRUD.

### Components
- `src/components/admin/CategoryTree.tsx` — Recursive tree view with expand/collapse, edit/deactivate buttons per node. Exports `CategoryTreeSkeleton`.
- `src/components/admin/CategoryFormDialog.tsx` — Create/edit Dialog for categories (name, slug, parent, image, sort_order, is_active). Exports `CategoryFormDialogSkeleton`.
- `src/components/admin/BrandsTable.tsx` — Paginated brands data table with logo thumbnail, name, slug, description, status. Exports `BrandsTableSkeleton`.
- `src/components/admin/BrandFormDialog.tsx` — Create/edit Dialog for brands (name, slug, logo URL, description, is_active). Exports `BrandFormDialogSkeleton`.
- `src/components/admin/TagsList.tsx` — Flat tags list with inline edit (input on click) and delete (AlertDialog). Exports `TagsListSkeleton`.

### Pages
- `src/app/admin/(protected)/categories/page.tsx` — Category management page (uses `CategoryTree` + `CategoryFormDialog`)
- `src/app/admin/(protected)/brands/page.tsx` — Brand management page (uses `BrandsTable` + `BrandFormDialog`)
- `src/app/admin/(protected)/tags/page.tsx` — Tag management page (uses `TagsList`)

## Patterns to Follow

- All API calls use `adminRequest` from `AdminRequest.ts`
- All data fetching uses TanStack React Query with `adminTaxonomyKeys`
- Permission check: `const permissions = useAdminStore((s) => s.admin?.permissions ?? EMPTY_PERMISSIONS); const canCreate = permissions["categories"]?.includes("create") ?? false;`
- Category form uses `react-hook-form` + `zod` (same pattern as Phase 14 product form)
- Each component exports `*Skeleton` for loading states
- Error/empty states use `ErrorState` / `EmptyState` from `src/components/ui/`
- Toast notifications use `toast()` from `sonner`
- Deactivation shows confirmation via AlertDialog
- Arabic-first RTL layout (already handled by root layout)
- Mobile-responsive at 375px width

## Build & Verify

```bash
pnpm run build
pnpm run lint
```
