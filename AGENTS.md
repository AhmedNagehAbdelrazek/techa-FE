<!-- SPECKIT START -->

## Current Plan

**Feature**: Customer Checkout
**Branch**: `008-customer-checkout`
**Plan file**: `specs/008-customer-checkout/plan.md`
**Spec file**: `specs/008-customer-checkout/spec.md`

### Key Artifacts

- [spec.md](specs/008-customer-checkout/spec.md) — Feature specification
- [plan.md](specs/008-customer-checkout/plan.md) — Implementation plan
- [research.md](specs/008-customer-checkout/research.md) — Research decisions
- [data-model.md](specs/008-customer-checkout/data-model.md) — Data model
- [quickstart.md](specs/008-customer-checkout/quickstart.md) — Setup guide
- [contracts/checkout-api.md](specs/008-customer-checkout/contracts/checkout-api.md) — API contracts

### Implementation Order

1. Create `src/lib/types/order.ts` — `Address`, `Order`, `ShippingRate`, `PaymentMethodInfo`, request/response types
2. Create `src/lib/api/addresses.ts` — 6 API wrappers (list, create, update, setDefault, delete, getDeliveryZones)
3. Create `src/lib/api/shipping.ts` — 1 API wrapper (getShippingRate)
4. Create `src/lib/api/orders.ts` — 4 API wrappers (placeOrder, getOrder, getOrders, cancelOrder)
5. Create `src/lib/api/payments.ts` — 2 API wrappers (getPaymentMethods, submitProof)
6. Create `src/app/(store)/checkout/page.tsx` — Multi-step checkout page with auth guard, empty cart redirect, step management via useState
7. Create `src/components/store/CheckoutAddressStep.tsx` — Saved address list with radio selection + inline add form
8. Create `src/components/store/CheckoutReviewStep.tsx` — Item summary, shipping rate, payment method selector, place order button
9. Create `src/app/(store)/orders/[id]/confirmation/page.tsx` — Order success screen + proof submission form for non-COD
10. Verify: build passes with `npm run build`

### Critical Patterns (enforced)

- **No direct `request` calls in UI components**: All API access through `src/lib/api/*.ts` wrappers, consumed by UI components via direct async calls (no Zustand store for checkout — local state only)
- **Auth guard**: `/checkout` uses `<ProtectedRoute>` wrapper (existing pattern from `src/app/(store)/account/page.tsx`)
- **Cart store integration**: On successful `POST /api/orders`, call `cartStore.reset()` then `router.push` to confirmation page

### Completed (Phase 7)

- Customer Cart: types, API wrappers, Zustand store with persist, CartAddButton, CartEmptyState, CartItemRow, CartOrderSummary, CartCouponInput, CartDrawer, cart page, header badge

<!-- SPECKIT END -->
