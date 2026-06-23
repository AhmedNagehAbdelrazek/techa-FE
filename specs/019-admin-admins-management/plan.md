# Implementation Plan: Admin Admins & Roles Management

**Branch**: `019-admin-admins-management` | **Date**: 2026-06-23 | **Spec**: `specs/019-admin-admins-management/spec.md`

**Input**: Feature specification from `specs/019-admin-admins-management/spec.md`. Postman collection (`Techa Auth API.postman_collection.json`) provides full API shapes for admin accounts CRUD and roles CRUD.

## Summary

Build admin management UI for two pages:

1. **Admins** (`/admin/admins`): Paginated table of all admin accounts with name, email, role label, status badge (Active/Inactive), created date. Create/Edit Dialog (name, email, password, role dropdown). Deactivate/Reactivate toggle with AlertDialog. Self-deactivation blocked (backend 400 → toast). Permission gated via `"admins"` key.
2. **Roles** (`/admin/roles`): Table of all roles with name, permission count, assigned admin count. Create/Edit Dialog (name, grouped permission checkboxes). Soft-delete (deactivate) with AlertDialog. Delete disabled if role has assigned admins. Permission gated via same `"admins"` key.

Permission gating via `useAdminStore` with `"admins"` resource key (read gates page access; create/update/delete gate action buttons). Both pages use `adminRequest`. No new npm packages. Sidebar links: Admins already exists, add Roles link.

## Technical Context

**Language/Version**: TypeScript 5 (strict: true), Next.js 15 (App Router), React 19

**Primary Dependencies**: Next.js (react-dom, react), Tailwind CSS 4, shadcn/ui (New York, radix icons), lucide-react, zustand (@tanstack/react-query v5), sonner, react-hook-form + zod + @hookform/resolvers

**API Client**: `adminRequest` from `src/lib/api/AdminRequest.ts` — separate axios instance with `admin_access_token` (localStorage), interceptor for auth header injection.

**Storage**: N/A (data fetched from backend REST API)

**Testing**: N/A (testing deferred — existing Vitest + @testing-library/react + Playwright setup available but not used in this phase)

**Target Platform**: Web (Next.js 15, server + client rendering)

**Project Type**: Web application (Next.js App Router, frontend-only — consumes backend REST API)

**Performance Goals**: Admins table loads within 2 seconds; roles table loads within 2 seconds.

**Constraints**: No new npm packages; all required dependencies already in `package.json`. Arabic-first (RTL, `lang="ar"`, `dir="rtl"`). Mobile-responsive (375px). Frontend-only — backend provides REST API.

**Scale/Scope**: Admin accounts typically <50; roles typically <20.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Check | Status |
|------|-------|--------|
| Pre-Flight Checklist | Applied to every new file | ✅ |
| Package additions | Zero new packages needed — all dependencies exist | ✅ |
| No new dependencies for core logic | All patterns exist: adminRequest, useAdminStore, React Query, shadcn ui wrappers | ✅ |
| Existing patterns followed | Uses adminRequest, useAdminStore, ErrorState/EmptyState, skeleton export pattern, React Query query keys, Dialog for CRUD forms, pagination for admins | ✅ |

## Project Structure

### Documentation (this feature)

```text
specs/019-admin-admins-management/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── admins-api.md
│   └── roles-api.md
└── tasks.md             # Phase 2 output (NOT created by /speckit.plan)
```

### Source Code (repository root)

```
src/
├── lib/
│   └── api/
│       └── admin-admins-roles.ts           # NEW — API wrappers + inline types for admins & roles CRUD
├── components/
│   ├── ui/
│   │   └── (existing: Table, Dialog, AlertDialog, Badge, Button, Input, Textarea, Select, ErrorState, EmptyState, Skeleton)
│   └── admin/
│       ├── AdminAdminsTable.tsx             # NEW — admins data table with status badge, deactivate/reactivate
│       ├── AdminFormDialog.tsx              # NEW — create/edit admin form in Dialog with role dropdown
│       ├── AdminRolesTable.tsx              # NEW — roles table with permission count, admin count
│       └── RoleFormDialog.tsx               # NEW — create/edit role form with grouped permission checkboxes
├── app/
│   └── admin/
│       └── (protected)/
│           ├── admins/
│           │   └── page.tsx                 # NEW — admin accounts management page
│           └── roles/
│               └── page.tsx                 # NEW — roles management page
└── components/
    └── layout/
        ├── AdminSidebar.tsx                 # MODIFY — add Roles link (Admins already exists)
        └── Breadcrumbs.tsx                  # MODIFY — add "roles" segment label (admins already exists)
```

**Structure Decision**: Two separate routes. Admins follow the table+Dialog CRUD pattern from Phases 14-17. Roles use a similar table+Dialog pattern but with permission checkboxes instead of simple form fields.

## Implementation Order

1. Create `src/lib/api/admin-admins-roles.ts` — API wrappers and types for admins (list, create, update, reactivate, deactivate) and roles (list, create, update, deactivate)
2. Create `src/components/admin/AdminAdminsTable.tsx` — data table with name, email, role label, status badge (Active/Inactive), created date, deactivate/reactivate toggle
3. Create `src/components/admin/AdminFormDialog.tsx` — create/edit form in Dialog with react-hook-form + zod (name, email, password optional on edit, role dropdown from roles API)
4. Create `src/components/admin/AdminRolesTable.tsx` — roles table with name, permission count, admin count, deactivate button
5. Create `src/components/admin/RoleFormDialog.tsx` — create/edit role form with name input and grouped permission checkboxes
6. Create page files: `/admin/admins/page.tsx`, `/admin/roles/page.tsx`
7. Modify `AdminSidebar.tsx` — add Roles link (with `Shield` icon, below Admins)
8. Modify `Breadcrumbs.tsx` — add "roles" segment label
9. Tree-shake / final review
10. Build verification: `pnpm run build`

## Critical Patterns (enforced)

- **No new npm packages**: All dependencies already in package.json
- **Permission gating**: `useAdminStore` with `EMPTY_PERMISSIONS` — `"admins"` resource key for both pages (read gates access, create/update/delete gate action buttons)
- **React Query keys**: `adminAdminsRolesKeys` matching `adminBannerSettingsKeys`/`adminProductsKeys` patterns
- **Skeleton exports**: Each component exports `*Skeleton`
- **Error/empty states**: Reuse `ErrorState` / `EmptyState` from `src/components/ui/`
- **Admin API client**: `adminRequest` for all API calls
- **Form validation**: react-hook-form + zod for admin form; controlled state for role form
- **Admin status badge**: Two-way — is_active true → green "Active", is_active false → gray "Inactive"
- **Role dropdown**: Fetched from `GET /api/admin/roles` on dialog open. On fetch failure: disable dropdown + error toast with retry. Block submission without role.
- **Deactivation confirmation**: AlertDialog for both deactivate admin and deactivate role
- **Self-deactivation**: Backend returns 400; frontend shows error toast with backend message, row unchanged
- **Role deactivation with admins**: Backend returns 409; frontend shows error in AlertDialog, item stays in table
- **Permission checkboxes (roles)**: All available permission keys shown as grouped checkboxes (grouped by resource key like "products", "orders", etc.). Pre-filled from existing role permissions on edit.
- **Sidebar**: Add Roles link with `Shield` icon; Admins already exists
- **Breadcrumbs**: Add "roles" segment label (admins already exists)
- **Role display in admin table**: Admin list returns `role` as string; create/update return `role` as `{ id, name }`. Normalize to display name string in table.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Permission checkboxes (roles) | Roles have variable permission keys that need selection UI | Simple text input — too error-prone, admin would need to type permission keys manually |
| Admin list role string vs object | Backend returns role as string in list but object in create/update | Normalizing at API layer adds complexity — display-only coercion is simpler: `typeof role === "string" ? role : role.name` |
| Role creation returns `createdat` (lowercase) | Backend uses lowercase timestamps for roles | Standardize in API layer adapter or handle in component — minor display concern |
