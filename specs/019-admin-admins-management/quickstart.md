# Quickstart: Admin Admins & Roles Management

## Prerequisites

- Node.js 20+, pnpm 9+
- Backend running at the URL configured in `NEXT_PUBLIC_API_URL` or `NEXT_PUBLIC_BACKEND_URL`
- Admin account with `admins` permission:
  - `admins.read` — access `/admin/admins` and `/admin/roles` pages
  - `admins.create` — create admin accounts and roles
  - `admins.update` — edit admin accounts and roles
  - `admins.delete` — deactivate admin accounts and roles

## Getting Started

No new npm packages are needed. All dependencies are already in `package.json`.

## Key Files

### API Layer
- `src/lib/api/admin-admins-roles.ts` — API wrappers and inline types for admins CRUD (list, create, update, deactivate, reactivate) and roles CRUD (list, create, update, deactivate).

### Components
- `src/components/admin/AdminAdminsTable.tsx` — Admins data table with name, email, role label, status badge, created date. Exports `AdminAdminsTableSkeleton`.
- `src/components/admin/AdminFormDialog.tsx` — Create/edit Dialog for admins (name, email, password, role dropdown). Role options fetched from `GET /api/admin/roles`. Exports `AdminFormDialogSkeleton`.
- `src/components/admin/AdminRolesTable.tsx` — Roles table with name, permission count, assigned admin count. Edit and Delete buttons per row. Exports `AdminRolesTableSkeleton`.
- `src/components/admin/RoleFormDialog.tsx` — Create/edit Dialog for roles (name, grouped permission checkboxes). Exports `RoleFormDialogSkeleton`.

### Pages
- `src/app/admin/(protected)/admins/page.tsx` — Admin accounts management page (uses `AdminAdminsTable` + `AdminFormDialog`)
- `src/app/admin/(protected)/roles/page.tsx` — Roles management page (uses `AdminRolesTable` + `RoleFormDialog`)

### Layout Changes
- `src/components/layout/AdminSidebar.tsx` — Add Roles link with `Shield` icon (Admins link already exists)
- `src/components/layout/Breadcrumbs.tsx` — Add `roles: "Roles"` segment label

## Patterns to Follow

- All API calls use `adminRequest` from `AdminRequest.ts`
- Data fetching uses TanStack React Query with `adminAdminsRolesKeys`
- Permission check: `permissions["admins"]?.includes("read") ?? false`
- Each component exports `*Skeleton` for loading states
- Error/empty states use `ErrorState` / `EmptyState` from `src/components/ui/`
- Toast notifications use `toast()` from `sonner`
- Deactivation actions show confirmation via AlertDialog
- Self-deactivation: compare admin IDs, show warning in AlertDialog
- Admin list `role` field: string in list response, object `{ id, name }` in create/update response — display via `typeof role === "string" ? role : role.name`
- Role form permissions: grouped checkboxes keyed by resource name (products, orders, categories, etc.)
- Role dropdown in admin form: disabled + error toast on fetch failure
- Role deactivation with assigned admins: 409 conflict → error toast, item stays in table
- Admin password: required on create, optional on edit (blank = unchanged)
- Arabic-first RTL layout (already handled by root layout)
- Mobile-responsive at 375px width

## Build & Verify

```bash
pnpm run build
pnpm run lint
```
