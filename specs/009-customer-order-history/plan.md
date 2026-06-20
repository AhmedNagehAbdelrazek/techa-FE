# Implementation Plan: Customer Order History & Detail

**Branch**: `009-customer-order-history` | **Date**: 2026-06-20 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/009-customer-order-history/spec.md`

## Summary

Customers can view a paginated, filterable list of their past orders and see full order details with a visual status timeline, item breakdown, delivery address, payment info, and the ability to cancel (pending/confirmed) or submit/re-submit payment proof for manual payment methods. Delivered items prompt review submission. Builds on existing order types, API wrappers, and pages created during checkout (Phase 8).

## Technical Context

**Language/Version**: TypeScript 5 (`strict: true`)

**Framework**: Next.js 15 (App Router)

**Primary Dependencies**: React 19, shadcn/ui (New York style), Radix UI (AlertDialog), Zustand (cart store for reset), sonner (toast), lucide-react (icons), clsx + tailwind-merge (`cn()`)

**State Management**: Local `useState` for page-level state (order list, filters, proof form). No new Zustand stores needed.

**API Client**: `src/lib/api/Request.ts` (class-based singleton wrapping axios). Existing wrappers `orders.ts` (getOrders, getOrder, cancelOrder) and `payments.ts` (submitProof, uploadFile) already exist — need to extend `getOrders` with pagination/status query params and add `OrdersListResponse` type with `item_count` and `thumbnail`.

**Storage**: N/A (server-side persisted)

**Testing**: Vitest + @testing-library/react (unit), Playwright (E2E)

**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge), 375px+ mobile-first

**Project Type**: Web application — storefront (customer-facing) under `app/(store)/`

**Performance Goals**: Order list loads in <3s on standard connection; order detail page loads in <2s

**Constraints**: Arabic-first RTL layout, mobile-first responsive design, no new dependencies, existing auth guard pattern via `<ProtectedRoute>`

**Scale/Scope**: Single-vendor marketplace; customer-specific order data only (no admin views in this phase)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- ✅ No new dependencies required — all needed packages (shadcn/ui components, sonner, lucide-react) are already in `package.json`
- ✅ No new Zustand stores — all state is local `useState`
- ✅ Existing patterns reused — `<ProtectedRoute>` for auth, `Request.ts` for API, `cn()` for styling, `formatPrice`/`formatDateTime` for formatting
- ✅ No violation of YAGNI — each feature (list, filter, detail, cancel, proof, review prompt) has a clear requirement in the spec
- ✅ TypeScript `strict: true` respected — all new interfaces will be fully typed
- ✅ Arabic-first RTL — existing layout already handles this

**Status**: PASS — No violations. Proceeding.

## Project Structure

### Documentation (this feature)

```text
specs/009-customer-order-history/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (API contract updates)
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── spec.md             # Feature specification
```

### Source Code (repository root)

```text
src/
├── app/(store)/
│   ├── orders/
│   │   ├── page.tsx                  # ENHANCE — Add pagination, status filter tabs, thumbnail, item count
│   │   └── [id]/
│   │       ├── page.tsx              # ENHANCE — Add visual step tracker, review prompts, AlertDialog cancel, stale data toast
│   │       └── confirmation/
│   │           └── page.tsx          # EXISTING (Phase 8) — No changes needed
├── components/
│   └── store/
│       ├── OrderCard.tsx             # CREATE — Order list item card with thumbnail, status badge, total, date
│       ├── OrderStatusTimeline.tsx   # CREATE — Visual step tracker with hidden accessible ordered list
│       └── OrderStatusTabs.tsx       # CREATE — Status filter tab bar for order list
├── lib/
│   ├── api/
│   │   ├── orders.ts                 # ENHANCE — Update getOrders to accept status/query params, add pagination type
│   │   └── payments.ts               # EXISTING (Phase 8) — No changes needed
│   └── types/
│       └── order.ts                  # ENHANCE — Add OrdersListResponse type with pagination meta, item_count, thumbnail
```

**Structure Decision**: Follows the existing Next.js App Router pattern under `app/(store)/` with reusable components in `src/components/store/` and API wrappers in `src/lib/api/`. The orders list and detail pages already exist from Phase 8 and will be enhanced rather than rewritten.

## Complexity Tracking

No constitution violations to justify.
