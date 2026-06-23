# Implementation Plan: Admin Panel — Coupons & Delivery Zones

**Branch**: `017-admin-coupons-delivery-zones` | **Date**: 2026-06-23 | **Spec**: `specs/017-admin-coupons-delivery-zones/spec.md`

**Input**: Feature specification from `specs/017-admin-coupons-delivery-zones/spec.md`

## Summary

Build admin management UI for coupons (paginated data table with CRUD via Dialog, searchable product combobox) and delivery zones (zone table with expandable rate rows, Add Zone/Rate Dialogs). Two new routes under `admin/(protected)`. Permission gating via `useAdminStore` with granular `read`/`create`/`update`/`delete` for `coupons.*` and `zones.*`. No new npm packages.

## Technical Context

**Language/Version**: TypeScript 5 (strict: true), Next.js 15 (App Router), React 19

**Primary Dependencies**: Next.js (react-dom, react), Tailwind CSS 4, shadcn/ui (New York, radix icons), lucide-react, zustand (@tanstack/react-query v5), sonner, react-hook-form + zod + @hookform/resolvers

**API Client**: `adminRequest` from `src/lib/api/AdminRequest.ts` — separate axios instance with `admin_access_token` (localStorage), interceptor for auth header injection

**Storage**: N/A (data fetched from backend REST API)

**Testing**: N/A (testing deferred — existing Vitest + @testing-library/react + Playwright setup available but not used in this phase)

**Target Platform**: Web (Next.js 15, server + client rendering)

**Project Type**: Web application (Next.js App Router, frontend-only — consumes backend REST API)

**Performance Goals**: Coupon table loads within 2 seconds; product combobox returns results within 2 seconds of typing (SC-002); zone table loads within 2 seconds

**Constraints**: No new npm packages; all required dependencies already in `package.json`. Arabic-first (RTL, `lang="ar"`, `dir="rtl"`). Mobile-responsive (375px). Frontend-only — backend provides REST API.

**Scale/Scope**: Coupons paginated at 20/page; zones not paginated (typically <50 zones). 2 routes within admin.

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
specs/017-admin-coupons-delivery-zones/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── coupons-api.md
│   └── delivery-zones-api.md
└── tasks.md             # Phase 2 output (NOT created by /speckit.plan)
```

### Source Code (repository root)

```
src/
├── lib/
│   └── api/
│       └── admin-coupons-zones.ts        # NEW — API wrappers + inline types for coupons, zones, rates
├── components/
│   ├── ui/
│   │   └── (existing: Table, Dialog, AlertDialog, Badge, Button, Input, Select, Combobox, DatePicker, ErrorState, EmptyState, Skeleton)
│   └── admin/
│       ├── CouponsTable.tsx              # NEW — paginated coupons data table
│       ├── CouponFormDialog.tsx          # NEW — create/edit coupon form in Dialog with product combobox
│       ├── ZonesTable.tsx                # NEW — delivery zones table with expandable rate rows
│       ├── ZoneFormDialog.tsx            # NEW — create/edit zone form in Dialog
│       └── RateFormDialog.tsx           # NEW — create/edit shipping rate form in Dialog
├── app/
│   └── admin/
│       └── (protected)/
│           ├── coupons/
│           │   └── page.tsx              # NEW — coupon management page
│           └── delivery-zones/
│               └── page.tsx              # NEW — delivery zone management page
```

**Structure Decision**: Coupons and delivery zones are separate routes with dedicated components. Coupon form uses a searchable Combobox for product selection (same pattern as taxonomy CRUD but with product search). Zones table has expandable rows for rates (new pattern — lightweight inline expansion). Forms extracted into separate Dialog components for reusability.

## Complexity Tracking

No constitution violations — all patterns match existing codebase conventions.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | — | — |
