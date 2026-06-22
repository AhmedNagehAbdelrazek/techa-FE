# Implementation Plan: Admin Panel — Orders & Payment Review

**Branch**: `015-admin-orders-payments` | **Date**: 2026-06-23 | **Spec**: `specs/015-admin-orders-payments/spec.md`

**Input**: Feature specification from `specs/015-admin-orders-payments/spec.md`

## Summary

Build admin order management UI: paginated sortable orders table with filters/search, order detail page with status timeline and update modal, payment review queue with approve/reject actions. This phase creates API wrappers, order list/detail pages, payment review page, and adds a dashboard metric link. All within existing `admin/(protected)` route group. Permission gating via `useAdminStore` — `orders.read/update` control visibility.

## Technical Context

**Language/Version**: TypeScript 5 (strict: true), Next.js 15 (App Router), React 19

**Primary Dependencies**: Next.js (react-dom, react), Tailwind CSS 4, shadcn/ui (New York, radix icons), lucide-react, zustand (@tanstack/react-query v5), react-hook-form + zod + @hookform/resolvers, sonner, next-themes

**API Client**: `adminRequest` from `src/lib/api/AdminRequest.ts` — separate axios instance with `admin_access_token` (localStorage), interceptor for auth header injection

**Storage**: N/A (data fetched from backend REST API)

**Testing**: N/A (testing deferred — existing Vitest + @testing-library/react + Playwright setup available but not used in this phase)

**Target Platform**: Web (Next.js 15, server + client rendering)

**Project Type**: Web application (Next.js App Router, frontend-only — consumes backend REST API)

**Performance Goals**: Order list page loads within 2 seconds (SC-004); order status update complete within 5 seconds; payment approve/reject within 3 seconds

**Constraints**: No new npm packages; all required dependencies already in `package.json`. Arabic-first (RTL, `lang="ar"`, `dir="rtl"`). Mobile-responsive (375px). Frontend-only — backend provides REST API.

**Scale/Scope**: Order list paginated at 20/page; payments list paginated at 20/page. 3 routes within admin.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Check | Status |
|------|-------|--------|
| Pre-Flight Checklist | Applied to every new file | ✅ |
| Package additions | Zero new packages needed — all dependencies exist | ✅ |
| No new dependencies for core logic | All patterns exist: adminRequest, useAdminStore, React Query, shadcn ui wrappers | ✅ |
| Existing patterns followed | Uses adminRequest, useAdminStore, ErrorState/EmptyState, skeleton export pattern, React Query query keys | ✅ |

## Project Structure

### Documentation (this feature)

```text
specs/015-admin-orders-payments/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── orders-api.md
│   └── payments-api.md
└── tasks.md             # Phase 2 output (NOT created by /speckit.plan)
```

### Source Code (repository root)

```
src/
├── lib/
│   └── api/
│       └── admin-orders.ts              # NEW — API wrappers + inline types for orders & payments
├── components/
│   ├── ui/
│   │   └── (existing: Table, Dialog, AlertDialog, Badge, Button, Input, Select, Textarea, ErrorState, EmptyState, LoadingState, Separator, Skeleton)
│   └── admin/
│       ├── OrdersTable.tsx              # NEW — paginated order data table with search, filters, sorting
│       ├── OrderDetail.tsx              # NEW — order detail sections (customer card, items, timeline, payment, address)
│       ├── OrderStatusUpdateModal.tsx   # NEW — modal for status transitions
│       ├── PaymentInfoCard.tsx          # NEW — payment info with approve/reject for manual payments
│       └── PaymentsTable.tsx           # NEW — pending payments queue table
├── app/
│   └── admin/
│       └── (protected)/
│           ├── orders/
│           │   ├── page.tsx            # NEW — orders list page
│           │   └── [id]/
│           │       └── page.tsx        # NEW — order detail page
│           └── payments/
│               └── page.tsx            # NEW — pending payments page
```

**Structure Decision**: Next.js App Router with admin route group. Component architecture splits concerns: data table, detail sections, modals. Each component has named exports with matching `*Skeleton` export for loading states (existing convention).

## Complexity Tracking

No constitution violations — all patterns match existing codebase conventions.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | — | — |
