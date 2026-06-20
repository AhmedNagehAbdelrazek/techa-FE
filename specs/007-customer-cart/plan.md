# Implementation Plan: Customer Cart

**Branch**: `007-customer-cart` | **Date**: 2026-06-20 | **Spec**: `specs/007-customer-cart/spec.md`

**Input**: Feature specification from `specs/007-customer-cart/spec.md`

---

## Summary

Implement full cart experience: view cart items (dedicated page), manage quantities/remove items, apply/remove coupons, and proceed to checkout. Cart uses a Zustand store with persist for offline resilience and optimistic updates with rollback on failure.

## Technical Context

**Language/Version**: TypeScript 5 (strict: true), Next.js 15, React 19

**Primary Dependencies**: Zustand (persist middleware for cart state), sonner (toasts), lucide-react (icons), shadcn/ui (Button, Badge, Input, Sheet, Skeleton, Separator), TanStack React Query 5 (server state — used elsewhere, cart uses direct store fetch)

**Storage**: API backend as source of truth (PostgreSQL via Django); Zustand persist middleware caches cart state in localStorage under key `"cart-storage"`

**Testing**: Vitest 2 + @testing-library/react (unit/integration), @playwright/test (E2E)

**Target Platform**: Web (Next.js App Router with SSR + `"use client"` interactive components)

**Project Type**: Web application — Next.js 15 e-commerce storefront (Arabic-first, RTL)

**Performance Goals**: Cart load <2s (SC-001), badge update <500ms (SC-002), quantity changes <500ms (SC-003), coupon apply/remove <1s (SC-004)

**Constraints**: Auth required (no guest cart), RTL/Arabic-first, optimistic UI with rollback on failure, Zustand persist for cross-session cart state

**Scale/Scope**: Single-vendor marketplace, authenticated customer users

## Constitution Check

| Gate | Check | Result |
|------|-------|--------|
| YAGNI | Does this feature serve a real requirement? | **PASS** — Spec defines 3 user stories, 13 FRs, all driven by Phase 7 of frontend-spec |
| stdlib | Can the stdlib do it? | **PASS** — Cart state management uses installed Zustand (existing pattern), API calls use existing Request.ts, toasts use existing sonner |
| Installed deps | Are required libraries already in package.json? | **PASS** — Zustand, sonner, lucide-react, shadcn/ui all present; zero new dependencies needed (confirmed in research) |
| One line | Can any sub-task be written in one line? | **PASS** — API wrappers are one-liners delegating to `request.get<T>()`, `request.post<T>()`, etc. |
| Minimum code | Will we avoid over-engineering? | **PASS** — Dedicated cart page (not a complex multi-step flow), simple Zustand store, no abstraction layers beyond existing patterns |

**No violations. No complexity tracking required.**

## Project Structure

### Documentation (this feature)

```text
specs/007-customer-cart/
├── plan.md              # This file
├── research.md          # Phase 0 output — research decisions
├── data-model.md        # Phase 1 output — entities and store interface
├── quickstart.md        # Phase 1 output — setup guide
├── contracts/
│   └── cart-api.md      # API endpoint contracts
└── spec.md              # Feature specification
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── types/
│   │   └── cart.ts               Cart, CartItem, CartCoupon, request/response types
│   ├── api/
│   │   └── cart.ts               6 API wrapper functions (getCart, addItem, updateItemQty, removeItem, applyCoupon, removeCoupon)
│   └── stores/
│       └── cart.store.ts         Zustand store with persist; optimistic add/update/remove with rollback
├── components/
│   └── store/
│       ├── CartAddButton.tsx     Add to Cart (product detail page), auth guard, success toast
│       ├── CartEmptyState.tsx    Empty cart illustration + "Continue Shopping" link to `/`
│       ├── CartItemRow.tsx       Item row: thumbnail, name, variant, unit price, qty stepper, line total, remove, price-changed badge
│       ├── CartOrderSummary.tsx  Subtotal, discount, shipping label, total, "Proceed to Checkout"
│       ├── CartCouponInput.tsx   Coupon input + "Apply" button, removable coupon chip
│       └── CartDrawer.tsx        Slide-over Sheet (mobile quick-preview)
└── app/
    └── (store)/
        └── cart/
            └── page.tsx          Cart page composing CartItemRow, CartOrderSummary, CartCouponInput, CartEmptyState with loading skeleton
```

### Structure Decision

Single Next.js App Router project with feature-aligned files under `src/lib/types/`, `src/lib/api/`, `src/lib/stores/`, `src/components/store/`, and `src/app/(store)/cart/`. This matches the existing conventions established by the reviews feature (Phase 6).

## Complexity Tracking

> Not required — zero violations from Constitution Check.
