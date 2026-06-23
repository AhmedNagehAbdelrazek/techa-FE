# Implementation Plan: Admin Panel — Categories, Brands & Tags

**Branch**: `016-admin-categories-brands-tags` | **Date**: 2026-06-23 | **Spec**: `specs/016-admin-categories-brands-tags/spec.md`

**Input**: Feature specification from `specs/016-admin-categories-brands-tags/spec.md`

## Summary

Build admin taxonomy management UI: category tree with expand/collapse and CRUD via Dialog, brands paginated data table with Dialog-based CRUD, and tags flat list with inline edit/delete. Three new routes under `admin/(protected)`. Permission gating via `useAdminStore` with granular `read`/`create`/`update`/`delete` permissions. No new npm packages.

## Technical Context

**Language/Version**: TypeScript 5 (strict: true), Next.js 15 (App Router), React 19

**Primary Dependencies**: Next.js (react-dom, react), Tailwind CSS 4, shadcn/ui (New York, radix icons), lucide-react, zustand (@tanstack/react-query v5), sonner, react-hook-form + zod + @hookform/resolvers

**API Client**: `adminRequest` from `src/lib/api/AdminRequest.ts` — separate axios instance with `admin_access_token` (localStorage), interceptor for auth header injection

**Storage**: N/A (data fetched from backend REST API)

**Testing**: N/A (testing deferred — existing Vitest + @testing-library/react + Playwright setup available but not used in this phase)

**Target Platform**: Web (Next.js 15, server + client rendering)

**Project Type**: Web application (Next.js App Router, frontend-only — consumes backend REST API)

**Performance Goals**: Category tree renders within 2 seconds (SC-002); brands table loads within 2 seconds; tag CRUD operations complete within 2 seconds

**Constraints**: No new npm packages; all required dependencies already in `package.json`. Arabic-first (RTL, `lang="ar"`, `dir="rtl"`). Mobile-responsive (375px). Frontend-only — backend provides REST API.

**Scale/Scope**: Brands paginated at 20/page; categories tree (all items, not paginated); tags list (all items, not paginated). 3 routes within admin.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Check | Status |
|------|-------|--------|
| Pre-Flight Checklist | Applied to every new file | ✅ |
| Package additions | Zero new packages needed — all dependencies exist | ✅ |
| No new dependencies for core logic | All patterns exist: adminRequest, useAdminStore, React Query, shadcn ui wrappers | ✅ |
| Existing patterns followed | Uses adminRequest, useAdminStore, ErrorState/EmptyState, skeleton export pattern, React Query query keys, Dialog for CRUD forms | ✅ |

## Project Structure

### Documentation (this feature)

```text
specs/016-admin-categories-brands-tags/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── categories-api.md
│   ├── brands-api.md
│   └── tags-api.md
└── tasks.md             # Phase 2 output (NOT created by /speckit.plan)
```

### Source Code (repository root)

```
src/
├── lib/
│   ├── api/
│   │   └── admin-taxonomy.ts          # NEW — API wrappers + inline types for categories, brands, tags
│   └── types/
│       ├── category.ts                # EXISTING — Category interface (may extend)
│       ├── brand.ts                   # EXISTING — Brand interface (may extend)
│       └── product.ts                 # EXISTING — Tag interface defined here
├── components/
│   ├── ui/
│   │   └── (existing: Table, Dialog, AlertDialog, Badge, Button, Input, Select, Textarea, Checkbox, ErrorState, EmptyState, Skeleton)
│   └── admin/
│       ├── CategoryTree.tsx           # NEW — recursive tree view with expand/collapse, edit/deactivate
│       ├── CategoryFormDialog.tsx     # NEW — create/edit category form in Dialog
│       ├── BrandsTable.tsx            # NEW — paginated brands data table with create/edit Dialog
│       ├── BrandFormDialog.tsx        # NEW — create/edit brand form in Dialog
│       └── TagsList.tsx              # NEW — flat tags list with inline edit/delete
├── app/
│   └── admin/
│       └── (protected)/
│           ├── categories/
│           │   └── page.tsx           # NEW — category management page
│           ├── brands/
│           │   └── page.tsx           # NEW — brand management page
│           └── tags/
│               └── page.tsx           # NEW — tag management page
```

**Structure Decision**: Each taxonomy type gets its own page route and dedicated component. Category uses a recursive tree pattern; brand uses a data table matching Phase 14's ProductsTable pattern (without bulk actions); tag uses a simple flat list. Forms are extracted into separate Dialog components for reusability (create/edit share the same Dialog).

## Complexity Tracking

No constitution violations — all patterns match existing codebase conventions.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | — | — |
