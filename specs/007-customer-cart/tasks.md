---

description: "Implementation tasks for Customer Cart feature"
---

# Tasks: Customer Cart

**Input**: Design documents from `specs/007-customer-cart/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/cart-api.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project is already initialized. No setup tasks needed.

*Phase empty — proceeding to foundational tasks.*

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core types, API wrappers, and store that ALL user stories depend on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T001 Create cart types (`Cart`, `CartItem`, `CartCoupon`, request/response types) in `src/lib/types/cart.ts`
- [x] T002 [P] Create 6 cart API wrapper functions (`getCart`, `addItem`, `updateItemQty`, `removeItem`, `applyCoupon`, `removeCoupon`) in `src/lib/api/cart.ts`
- [x] T003 Replace `src/lib/stores/cart.store.ts` with full Zustand store (persist middleware, optimistic add/update/remove with rollback, `itemCount` getter)

**Checkpoint**: Foundation ready — types, API client, and store are usable. User story implementation can begin.

---

## Phase 3: User Story 1 — View Cart (Priority: P1) 🎯 MVP

**Goal**: A customer visits their cart to review items, see totals, and proceed to checkout.

**Independent Test**: Log in, add a product to the cart (via API or prior story), navigate to `/cart`, and verify:
- Loading skeleton is shown during fetch
- Cart items display with thumbnail, name, variant label, unit price, qty, line total
- Price-changed badge appears if applicable
- Order summary shows subtotal and total
- Empty cart shows illustration + "Continue Shopping" button linking to `/`

### Implementation for User Story 1

- [x] T004 [P] [US1] Create `CartEmptyState` component in `src/components/store/CartEmptyState.tsx` (illustration + "Continue Shopping" link to `/`)
- [x] T005 [P] [US1] Create `CartItemRow` component in `src/components/store/CartItemRow.tsx` (thumbnail, name, variant label, unit price, qty stepper, line total, price-changed badge, remove button)
- [x] T006 [P] [US1] Create `CartOrderSummary` component in `src/components/store/CartOrderSummary.tsx` (subtotal, discount, shipping label "Calculated at checkout", total, "Proceed to Checkout" button → `/checkout`)
- [x] T007 [P] [US1] Create `CartDrawer` component in `src/components/store/CartDrawer.tsx` (slide-over shadcn Sheet for mobile quick-preview)
- [x] T008 [US1] Create cart page at `src/app/(store)/cart/page.tsx` composing CartItemRow, CartOrderSummary, CartEmptyState with loading skeleton

**Checkpoint**: Customer can view cart with items and totals, see empty state, and proceed to checkout.

---

## Phase 4: User Story 2 — Manage Cart Items (Priority: P1)

**Goal**: A customer adds, updates, or removes products in their cart.

**Independent Test**: From a product detail page, click "Add to Cart" and verify:
- Success toast is shown
- Header badge count increments
- Open cart and verify item appears
- Increase quantity using stepper — verify line total and cart total update
- "+" button is disabled when qty reaches stock max
- Decrease qty to 0 or click "Remove" — verify item removed, badge decremented, totals recalculated
- On API failure — verify quantity reverts and error toast is shown

### Implementation for User Story 2

- [x] T009 [P] [US2] Create `CartAddButton` component in `src/components/store/CartAddButton.tsx` (auth guard — redirects unauthenticated to login; success toast; triggers store.addItem)
- [x] T010 [US2] Header already reads `itemCount` from `useCartStore` — reactive badge works with new store
- [x] T011 [US2] Quantity stepper built into `CartItemRow` (T005) — already complete
- [x] T012 [US2] Remove handler built into `CartItemRow` (T005) — already complete

**Checkpoint**: Customer can add items from product pages, adjust quantities, and remove items. Header badge stays in sync.

---

## Phase 5: User Story 3 — Apply Coupons (Priority: P2)

**Goal**: A customer applies a discount code to their cart.

**Independent Test**: Log in, add items to cart, apply a coupon code:
- Enter valid coupon → verify discount shown in order summary, coupon shown as removable chip
- Click remove on coupon chip → verify discount resets to zero
- Enter invalid/expired coupon → verify error toast, no discount applied
- Click "Proceed to Checkout" → verify redirect to `/checkout` (or `/login?next=/checkout` if unauthenticated)

### Implementation for User Story 3

- [x] T013 [P] [US3] Create `CartCouponInput` component in `src/components/store/CartCouponInput.tsx` (text input + "Apply" button, disabled when empty; applied coupon shown as removable chip)
- [x] T014 [US3] CartOrderSummary (T006) already reads `discount` and `coupon` from store — discount line shown when coupon applied

**Checkpoint**: Customer can apply and remove coupons, with discount reflected in order summary.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and integration.

- [x] T015 [P] Verify build passes with `npm run build`
- [x] T016 Run lint check with `npm run lint`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — project already initialized
- **Foundational (Phase 2)**: No external dependencies — BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Phase 2 completion
  - US1 (Phase 3): Can start immediately after Phase 2
  - US2 (Phase 4): Can start after Phase 2 — CartAddButton and Header badge are independent of US1
  - US3 (Phase 5): Can start after Phase 2 — CouponInput is independent; CartOrderSummary integration needs US1's CartOrderSummary component
- **Polish (Phase 6)**: After all user stories complete

### User Story Dependencies

- **US1 (P1)**: After Foundational — No dependencies on other stories
- **US2 (P1)**: After Foundational — No dependencies on other stories
- **US3 (P2)**: After Foundational — CartOrderSummary integration depends on US1's component

US1 and US2 can be implemented in parallel. US3 requires US1's CartOrderSummary for full integration.

### Parallel Opportunities

- T002 and T001 can run in parallel
- T004-T007 (US1 components) can all run in parallel
- T009 and T010 (US2) can run in parallel
- T011 depends on T005 (CartItemRow) and T003 (store)
- T013 (US3) can run in parallel with US2 work

---

## Parallel Example: User Story 1

```bash
# Launch all US1 components together:
Task: "Create CartEmptyState in src/components/store/CartEmptyState.tsx"
Task: "Create CartItemRow in src/components/store/CartItemRow.tsx"
Task: "Create CartOrderSummary in src/components/store/CartOrderSummary.tsx"
Task: "Create CartDrawer in src/components/store/CartDrawer.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational (T001-T003)
2. Complete Phase 3: US1 (T004-T008) → Cart view works with items, totals, empty state, drawer
3. **STOP and VALIDATE**: Navigate to `/cart`, verify items display, empty state, checkout navigation

### Incremental Delivery

1. Foundational complete → Types, API, store ready
2. Add US1 (View Cart) → Test → Customer can see their cart (MVP!)
3. Add US2 (Manage Items) → Test → Customer can add/update/remove items
4. Add US3 (Apply Coupons) → Test → Customer can use discount codes
5. Each story adds value without breaking previous stories

### Single Developer Strategy

1. T001-T003 (foundational — sequential, types → API → store)
2. T004-T008 (US1 — parallel components, then page composition)
3. T009-T012 (US2 — parallel components, then integration)
4. T013-T014 (US3 — parallel components, then integration)
5. T015-T016 (polish — lint + build)
