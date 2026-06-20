<!-- SPECKIT START -->

## Current Plan

**Feature**: Customer Cart
**Branch**: `007-customer-cart`
**Plan file**: `specs/007-customer-cart/plan.md`
**Spec file**: `specs/007-customer-cart/spec.md`

### Key Artifacts

- [spec.md](specs/007-customer-cart/spec.md) — Feature specification
- [plan.md](specs/007-customer-cart/plan.md) — Implementation plan
- [research.md](specs/007-customer-cart/research.md) — Research decisions
- [data-model.md](specs/007-customer-cart/data-model.md) — Data model
- [quickstart.md](specs/007-customer-cart/quickstart.md) — Setup guide
- [contracts/cart-api.md](specs/007-customer-cart/contracts/cart-api.md) — API contracts

### Implementation Order

1. Create `src/lib/types/cart.ts` — `Cart`, `CartItem`, `CartCoupon`, request/response types
2. Create `src/lib/api/cart.ts` — 6 API wrapper functions (getCart, addItem, updateItemQty, removeItem, applyCoupon, removeCoupon)
3. Replace `src/lib/stores/cart.store.ts` — Full Zustand store with persist, optimistic add/update/remove with rollback
4. Create `src/components/store/CartAddButton.tsx` — Add to Cart (product detail page), auth guard, success toast, badge increment
5. Create `src/components/store/CartEmptyState.tsx` — Empty cart illustration + "Continue Shopping" link to `/`
6. Create `src/components/store/CartItemRow.tsx` — Single item row with thumbnail, name, variant, unit price, qty stepper, line total, remove button, price-changed badge
7. Create `src/components/store/CartOrderSummary.tsx` — Subtotal, discount (if coupon), shipping label, total, "Proceed to Checkout" button
8. Create `src/components/store/CartCouponInput.tsx` — Coupon text input + "Apply" button, removable coupon chip
9. Create `src/components/store/CartDrawer.tsx` — Slide-over Sheet (mobile quick-preview)
10. Create `src/app/(store)/cart/page.tsx` — Compose CartItemRow, CartOrderSummary, CartCouponInput, CartEmptyState with loading skeleton
11. Modify `src/components/layout/Header.tsx` — Reactive cart badge from new store's `itemCount`
12. Verify: build passes with `npm run build`

### Critical Patterns (enforced)

- **No direct `request` calls in UI components**: All API access goes through `src/lib/api/*.ts` wrappers, consumed by Zustand stores (`src/lib/stores/*.store.ts`). UI components call store actions only — never import or use `request`/`axios` directly. Violations cause data flow bypass (no store updates, no rollback, no reactive state).

### Completed (Phase 6)

- Customer Reviews: types, API wrappers, StarRatingSelector, write/edit/delete flow, AlertDialog, eligibility, build verification

<!-- SPECKIT END -->
