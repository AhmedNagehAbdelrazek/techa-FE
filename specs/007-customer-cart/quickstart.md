# Quickstart: Customer Cart

## Prerequisites

- Branch: `007-customer-cart`
- All previous phases implemented (auth foundation, layout, homepage, listing, product detail, reviews)
- Backend running with cart API endpoints available
- Authenticated user session (all cart operations require login)

## Key Files

| File | Action |
|------|--------|
| `src/lib/types/cart.ts` | CREATE — Cart, CartItem, CartCoupon, request/response types |
| `src/lib/api/cart.ts` | CREATE — 6 API wrapper functions (getCart, addItem, updateItemQty, removeItem, applyCoupon, removeCoupon) |
| `src/lib/stores/cart.store.ts` | REPLACE — Full Zustand store with persist, optimistic updates |
| `src/components/store/CartAddButton.tsx` | CREATE — "Add to Cart" button for product detail page |
| `src/components/store/CartEmptyState.tsx` | CREATE — Empty cart illustration + "Continue Shopping" link |
| `src/components/store/CartItemRow.tsx` | CREATE — Single cart item row with thumbnail, info, stepper, remove |
| `src/components/store/CartOrderSummary.tsx` | CREATE — Subtotal, discount, shipping, total, checkout button |
| `src/components/store/CartCouponInput.tsx` | CREATE — Coupon input + apply/remove |
| `src/components/store/CartDrawer.tsx` | CREATE — Slide-over drawer for mobile quick-preview |
| `src/components/layout/Header.tsx` | MODIFY — Reactive cart badge from new store |
| `src/app/(store)/cart/page.tsx` | CREATE — Cart page route |
| `src/app/(store)/layout.tsx` | MODIFY — Wire up cart drawer in header |

## Implementation Order

1. **Types** (`src/lib/types/cart.ts`) — Define `Cart`, `CartItem`, `CartCoupon`, `AddItemRequest`, `UpdateItemRequest`, `ApplyCouponRequest`
2. **API** (`src/lib/api/cart.ts`) — Wrapper functions using `Request.ts` singleton
3. **Store** (`src/lib/stores/cart.store.ts`) — Zustand store with persist + optimistic actions
4. **CartAddButton** — Add to Cart on product detail page
5. **CartEmptyState** — Empty state component
6. **CartItemRow** — Single item row component
7. **CartOrderSummary** — Order summary + checkout button
8. **CartCouponInput** — Coupon input + apply/remove
9. **CartDrawer** — Slide-over drawer (mobile)
10. **Cart page** — Compose all components at `/cart`
11. **Header integration** — Reactive badge from new store

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
npx playwright test                   # E2E tests (if cart E2E tests exist)
```

## Rollback

If the feature needs to be reverted:

```bash
git checkout main -- src/lib/types/cart.ts
git checkout main -- src/lib/api/cart.ts
git checkout main -- src/lib/stores/cart.store.ts
git checkout main -- src/components/store/Cart*.tsx
git checkout main -- src/app/\(store\)/cart/
# Manually revert Header.tsx and layout.tsx changes
```
