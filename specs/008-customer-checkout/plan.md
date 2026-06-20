# Implementation Plan: Customer Checkout

**Branch**: `008-customer-checkout` | **Date**: 2026-06-20 | **Spec**: `specs/008-customer-checkout/spec.md`

**Input**: Feature specification from `specs/008-customer-checkout/spec.md`

---

## Summary

Implement multi-step checkout flow: address selection/inline creation on step 1, order review + payment method selection + optional notes on step 2, and payment proof submission on separate confirmation page. All checkout state managed via local `useState` (no Zustand). Auth guard redirects to `/login?next=/checkout`. Empty cart redirects to `/cart`.

## Technical Context

**Language/Version**: TypeScript 5 (strict: true), Next.js 15, React 19

**Primary Dependencies**: Zustand (cart store only — `cartStore.reset()` after order), sonner (toasts), lucide-react (icons), shadcn/ui (Button, Input, Select, RadioGroup, Card, Skeleton, Separator, Badge, Label, Textarea)

**Storage**: API backend as source of truth; no Zustand persist for checkout state (local `useState` only); cart store persists in localStorage for cross-session cart

**Testing**: Vitest 2 + @testing-library/react (unit/integration), @playwright/test (E2E)

**Target Platform**: Web (Next.js App Router with SSR + `"use client"` interactive components)

**Project Type**: Web application — Next.js 15 e-commerce storefront (Arabic-first, RTL)

**Performance Goals**: Checkout complete <3 min (SC-001), address load <2s (SC-002), shipping rate <2s (SC-003), order placement <5s (SC-004), proof submission <3s (SC-005)

**Constraints**: Auth required (no guest checkout), RTL/Arabic-first, no react-hook-form or zod (plain controlled inputs with `useState`), checkout step state via local `useState` only, file upload via `POST /api/upload` on selection

**Scale/Scope**: Single-vendor marketplace, authenticated customer users

## Constitution Check

| Gate | Check | Result |
|------|-------|--------|
| YAGNI | Does this feature serve a real requirement? | **PASS** — Spec defines 4 user stories, 17 FRs, driven by Phase 8 of frontend-spec |
| stdlib | Can the stdlib do it? | **PASS** — Controlled inputs via `useState`, API calls via existing `Request.ts`, file upload via `<input type="file">` + `FormData`, toasts via existing sonner |
| Installed deps | Are required libraries already in package.json? | **PASS** — Zustand, sonner, lucide-react, shadcn/ui all present; no new dependencies needed (plain controlled inputs, no form library) |
| One line | Can any sub-task be written in one line? | **PASS** — API wrappers delegate to `request.get<T>()` / `request.post<T>()` in one line |
| Minimum code | Will we avoid over-engineering? | **PASS** — Single page with 2-step local state, no abstraction layer, no Zustand for checkout, no form validation library |

**No violations. No complexity tracking required.**

## Project Structure

### Documentation (this feature)

```text
specs/008-customer-checkout/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── checkout-api.md  # Phase 1 output
└── spec.md              # Feature specification
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── types/
│   │   └── order.ts              NEW — Address, Order, ShippingRate, PaymentMethod, request/response types
│   └── api/
│       ├── addresses.ts          NEW — listAddresses, createAddress, updateAddress, setDefaultAddress, deleteAddress, getDeliveryZones
│       ├── shipping.ts           NEW — getShippingRate
│       ├── orders.ts             NEW — placeOrder, getOrder, getOrders, cancelOrder
│       └── payments.ts           NEW — getPaymentMethods, submitProof
├── components/
│   └── store/
│       ├── CheckoutAddressStep.tsx    NEW — saved address list (radio) + inline create form
│       └── CheckoutReviewStep.tsx     NEW — item summary, shipping rate, payment selector, place order
└── app/
    └── (store)/
        ├── checkout/
        │   └── page.tsx              NEW — multi-step checkout (auth guard, empty cart redirect, 2-step useState)
        └── orders/
            └── [id]/
                └── confirmation/
                    └── page.tsx      NEW — order success + payment proof form
```

### Structure Decision

Single Next.js App Router project following existing conventions: types in `src/lib/types/`, API wrappers in `src/lib/api/`, components in `src/components/store/`, pages in `src/app/(store)/`. No state management library for checkout (local `useState` only), matching the spec's clarification that no Zustand or form libraries should be used for checkout state.

## Complexity Tracking

> Not required — zero violations from Constitution Check.
