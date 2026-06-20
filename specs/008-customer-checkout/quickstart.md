# Quickstart: Customer Checkout

## Prerequisites

- Branch: `008-customer-checkout`
- Customer Cart (Phase 7) fully implemented with `cartStore.reset()` action available
- Backend running with checkout API endpoints available
- Authenticated user session (all checkout operations require login)

## Key Files

| File | Action |
|------|--------|
| `src/lib/types/order.ts` | CREATE — Address, Order, ShippingRate, PaymentMethod, request/response types |
| `src/lib/api/addresses.ts` | CREATE — 6 API wrappers (list, create, update, setDefault, delete, getDeliveryZones) |
| `src/lib/api/shipping.ts` | CREATE — 1 API wrapper (getShippingRate) |
| `src/lib/api/orders.ts` | CREATE — 4 API wrappers (placeOrder, getOrder, getOrders, cancelOrder) |
| `src/lib/api/payments.ts` | CREATE — 2 API wrappers (getPaymentMethods, submitProof) |
| `src/app/(store)/checkout/page.tsx` | CREATE — Multi-step checkout page with auth guard, empty cart redirect, step management via useState |
| `src/components/store/CheckoutAddressStep.tsx` | CREATE — Saved address list with radio selection + inline add form |
| `src/components/store/CheckoutReviewStep.tsx` | CREATE — Item summary, shipping rate, payment method selector, place order |
| `src/app/(store)/orders/[id]/confirmation/page.tsx` | CREATE — Order success screen + proof submission form for non-COD |

## Implementation Order

1. **Types** (`src/lib/types/order.ts`) — Define `Address`, `Order`, `ShippingRate`, `PaymentMethodInfo`, request/response types
2. **Addresses API** (`src/lib/api/addresses.ts`) — 6 wrapper functions using `Request.ts`
3. **Shipping API** (`src/lib/api/shipping.ts`) — `getShippingRate` wrapper
4. **Orders API** (`src/lib/api/orders.ts`) — 4 wrapper functions
5. **Payments API** (`src/lib/api/payments.ts`) — 2 wrapper functions
6. **Checkout page** (`src/app/(store)/checkout/page.tsx`) — Auth guard, empty cart redirect, 2-step state management via `useState`
7. **CheckoutAddressStep** — Saved address radio list + inline create form with zone dropdown
8. **CheckoutReviewStep** — Cart item summary, shipping rate display, payment method selector, notes textarea, place order
9. **Confirmation page** (`src/app/(store)/orders/[id]/confirmation/page.tsx`) — Success display + proof submission for manual payment

## Verification

```bash
git status                            # Only intended files changed
npm run lint                          # No lint errors
npm run build                         # No build errors
npx tsc --noEmit                      # TypeScript strict check
```

## Testing Commands

```bash
npm run test                          # Unit tests (Vitest)
npx playwright test                   # E2E tests (if checkout E2E tests exist)
```

## Rollback

If the feature needs to be reverted:

```bash
git checkout main -- src/lib/types/order.ts
git checkout main -- src/lib/api/addresses.ts
git checkout main -- src/lib/api/shipping.ts
git checkout main -- src/lib/api/orders.ts
git checkout main -- src/lib/api/payments.ts
git checkout main -- src/components/store/Checkout*.tsx
git checkout main -- src/app/\(store\)/checkout/
git checkout main -- src/app/\(store\)/orders/
```
