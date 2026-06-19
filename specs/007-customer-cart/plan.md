# Implementation Plan: Customer Cart

**Branch**: `007-customer-cart` | **Date**: 2026-06-19 | **Spec**: `specs/007-customer-cart/spec.md`

**Input**: Feature specification from `specs/007-customer-cart/spec.md`

---

## Summary

Implement full cart experience: view cart items with quantity steppers, add items from product pages, apply/remove coupons, empty state, and checkout navigation. Cart uses a dedicated page at `/cart`, backed by a Zustand store with persist middleware, communicating via 6 API endpoints.

## Technical Context

**Language/Version**: TypeScript 5 (strict: true), Next.js 15, React 19

**Primary Dependencies**: Zustand (persist middleware), TanStack React Query 5, sonner (toasts), lucide-react (icons), shadcn/ui Sheet (already exists at `src/components/ui/sheet.tsx`), shadcn/ui Skeleton, Button, Badge, Input

**Storage**: Zustand persist middleware → localStorage (`"cart-storage"` key)

**Testing**: Vitest 2 + @testing-library/react (unit/integration), @playwright/test (E2E)

**Target Platform**: Web (Next.js SSR with `"use client"` interactive components)

**Project Type**: Web application — Next.js 15 storefront (App Router)

**Performance Goals**: Cart view load <2s (SC-001), badge update <500ms (SC-002), qty change <500ms (SC-003), coupon apply/remove <1s (SC-004)

**Constraints**: Auth required for all cart ops (no guest cart), RTL/Arabic-first, optimistic UI with rollback on API failure, Zustand persist for cross-session state, "+" stepper disabled at stock max

**Scale/Scope**: Single-vendor marketplace, single-user cart (no sharing), no saved-for-later

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Check | Result |
|------|-------|--------|
| YAGNI | Does this feature serve a real requirement? | **PASS** — Spec defines 3 user stories, 13 FRs |
| stdlib | Can the stdlib do it? | **PASS** — All patterns (Zustand stores, shadcn Sheet, Request.ts API) use existing codebase conventions |
| Installed deps | Are required libraries already in package.json? | **PASS** — Zustand, sonner, lucide-react, shadcn/ui, @tanstack/react-query all present |
| One line | Can any sub-task be written in one line? | **PASS** — Will follow per-component (e.g., `cn()` usage, store selectors) |
| Minimum code | Will we avoid over-engineering? | **PASS** — Follow existing component/store patterns without abstraction layers |

**No violations. No complexity tracking required.**

## Project Structure

### Documentation (this feature)

```text
specs/007-customer-cart/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── cart-api.md
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── api/
│   │   └── cart.ts              NEW — 6 API wrapper functions
│   ├── stores/
│   │   └── cart.store.ts        REPLACE — full Zustand store with persist
│   └── types/
│       └── cart.ts              NEW — Cart, CartItem, CartCoupon, request types
├── components/
│   ├── store/
│   │   ├── CartAddButton.tsx    NEW — "Add to Cart" button (product detail)
│   │   ├── CartDrawer.tsx       NEW — cart slide-over panel (mobile quick-add)
│   │   ├── CartItemRow.tsx      NEW — single item row with stepper + remove
│   │   ├── CartOrderSummary.tsx NEW — subtotal, discount, total, coupon chip
│   │   ├── CartEmptyState.tsx   NEW — empty cart illustration + CTA
│   │   └── CartCouponInput.tsx  NEW — coupon input + apply/remove buttons
│   ├── layout/
│   │   └── Header.tsx           MODIFY — reactive badge from new cart store
│   └── ui/
│       └── sheet.tsx            EXISTS — shadcn Sheet for cart drawer
└── app/
    └── (store)/
        └── cart/
            └── page.tsx         NEW — dedicated cart page route
```

**Structure Decision**: Single Next.js project. All cart code follows existing patterns: types in `src/lib/types/`, API in `src/lib/api/`, store in `src/lib/stores/`, components in `src/components/store/`, page in `src/app/(store)/cart/`. This matches Phase 5 (product detail) and Phase 6 (reviews) conventions.
