---

description: "Task list for Customer Checkout feature implementation"

---

# Tasks: Customer Checkout

**Input**: Design documents from `specs/008-customer-checkout/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/checkout-api.md

**Tests**: Not requested — test tasks omitted. Spec acceptance scenarios serve as test criteria.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create shared types and API wrappers that all user stories depend on

- [ ] T001 Create order types (Address, Order, ShippingRate, PaymentMethodInfo, request/response) in src/lib/types/order.ts
- [ ] T002 [P] Create addresses API wrapper (listAddresses, createAddress, updateAddress, setDefaultAddress, deleteAddress, getDeliveryZones) in src/lib/api/addresses.ts
- [ ] T003 [P] Create shipping API wrapper (getShippingRate) in src/lib/api/shipping.ts
- [ ] T004 [P] Create orders API wrapper (placeOrder, getOrder, getOrders, cancelOrder) in src/lib/api/orders.ts
- [ ] T005 [P] Create payments API wrapper (getPaymentMethods, submitProof) in src/lib/api/payments.ts

---

## Phase 2: Foundational — Checkout Page Shell + Guards (US4)

**Purpose**: Scaffold the `/checkout` page with auth guard and empty cart redirect. This satisfies US4 and provides the page structure all other stories build on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T006 Create multi-step checkout page with auth guard (ProtectedRoute), empty cart redirect, and 2-step useState management in src/app/(store)/checkout/page.tsx

**Checkpoint**: Foundation ready — `/checkout` page renders for authenticated users with cart items, and redirects unauthenticated users to `/login?next=/checkout` and empty carts to `/cart`

---

## Phase 3: User Story 1 — Select or Add Delivery Address (Priority: P1) 🎯 MVP

**Goal**: Customer selects a saved address or adds a new inline address on checkout step 1

**Independent Test**: Log in, navigate to `/checkout`, verify saved addresses are listed with radio selection and default pre-selected. Add a new address inline, select it, and proceed.

### Implementation for User Story 1

- [ ] T007 [P] [US1] Create CheckoutAddressStep component (saved address radio list, inline add form, zone dropdown, Continue button) in src/components/store/CheckoutAddressStep.tsx
- [ ] T008 [US1] Integrate CheckoutAddressStep into checkout page step 1 in src/app/(store)/checkout/page.tsx

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently — addresses display, inline creation works, Continue advances to step 2

---

## Phase 4: User Story 2 — Review Order and Select Payment (Priority: P1)

**Goal**: Customer reviews cart items, shipping rate, and selects payment method before placing the order

**Independent Test**: Proceed to step 2, verify cart items are listed, shipping rate is displayed, select a payment method, add optional notes, and click "Place Order". Confirm redirect to `/orders/:id/confirmation`.

### Implementation for User Story 2

- [ ] T009 [P] [US2] Create confirmation page route at src/app/(store)/orders/[id]/confirmation/page.tsx
- [ ] T010 [P] [US2] Create CheckoutReviewStep component (item summary, shipping rate, payment method selector with receiving info, notes textarea, Place Order button with spinner) in src/components/store/CheckoutReviewStep.tsx
- [ ] T011 [US2] Integrate CheckoutReviewStep into checkout page step 2 with back-to-step-1 navigation and cartStore.reset() on success in src/app/(store)/checkout/page.tsx

**Checkpoint**: At this point, User Stories 1 AND 2 should both work — full checkout flow from address to order placement

---

## Phase 5: User Story 3 — Submit Payment Proof (Priority: P2)

**Goal**: Customer submits payment proof (transaction reference + screenshot) for manual payment methods on confirmation page

**Independent Test**: Place an order with Vodafone Cash, land on confirmation page, submit a transaction reference and screenshot file, verify success message.

### Implementation for User Story 3

- [ ] T012 [P] [US3] Add proof submission form (transaction reference input, file upload with client-side validation for jpg/png max 5MB, immediate POST /api/upload on selection, submit via POST /api/payments/submit-proof) in src/app/(store)/orders/[id]/confirmation/page.tsx
- [ ] T013 [US3] Add COD condition: hide proof form and show "Pay on delivery" message for cash_on_delivery orders in src/app/(store)/orders/[id]/confirmation/page.tsx

**Checkpoint**: All user stories now functional — payment proof submission works for manual payment methods, COD shows appropriate message

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verification and edge case handling

- [ ] T014 [P] Add loading skeleton states during checkout data fetching (addresses, shipping rate) in src/app/(store)/checkout/page.tsx
- [ ] T015 [P] Add error toast handling and rollback for API failures (order placement, shipping rate, payment methods, proof upload) across checkout components
- [ ] T016 Verify build passes with npm run build

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — types and API wrappers can be created immediately in parallel
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational (Phase 2) completion
  - US1 and US3 can start in parallel after Phase 2
  - US2 depends on US1 (address must be selected before review)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 4 (P1)**: Guards (Phase 2) — No dependencies on other stories, must complete first
- **User Story 1 (P1)**: Depends on Phase 2 — No dependencies on other stories, can start immediately after
- **User Story 2 (P1)**: Depends on US1 (address selection) and Phase 2 — US1 must be functional before US2
- **User Story 3 (P2)**: Depends on US2 (order placement) — an order must exist before proof submission
- **User Story 3 (P2)**: Also depends on confirmation page route (T009) — but T009 is already in Phase 4

### Within Each User Story

- API wrappers and types before UI components
- Core implementation before edge cases
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T002-T005)
- US1 and confirmation page route (T009) can start in parallel after Phase 2
- T007 and T009 can run in parallel (different components)
- Polish tasks marked [P] can run in parallel (T014-T016)

---

## Parallel Example: Phase 1

```bash
# Launch all API wrappers together:
Task: "Create addresses API wrapper in src/lib/api/addresses.ts"
Task: "Create shipping API wrapper in src/lib/api/shipping.ts"
Task: "Create orders API wrapper in src/lib/api/orders.ts"
Task: "Create payments API wrapper in src/lib/api/payments.ts"
```

## Parallel Example: Phase 3 + Phase 4 First Task

```bash
# Launch US1 address step and confirmation page route together:
Task: "Create CheckoutAddressStep component in src/components/store/CheckoutAddressStep.tsx"
Task: "Create confirmation page route at src/app/(store)/orders/[id]/confirmation/page.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (types + API wrappers)
2. Complete Phase 2: Foundational (checkout page with guards)
3. Complete Phase 3: User Story 1 (address step)
4. **STOP and VALIDATE**: Test address selection independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Checkout page shell with guards
2. Add User Story 1 → Address step → Test independently (MVP!)
3. Add User Story 2 → Review step + order placement → Test independently
4. Add User Story 3 → Confirmation page proof form → Test independently
5. Add Polish → Edge cases and verification

### Parallel Team Strategy

With multiple developers:

1. Phase 1: Developer A does types, Developers B-E each do one API wrapper
2. Phase 2: Developer A does checkout page shell
3. Phase 3: Developer A does CheckoutAddressStep
4. Phase 4: Developer B does confirmation route, Developer A does CheckoutReviewStep
5. Phase 5: Developer A does proof form
6. Phase 6: Split edge case tasks across team

---

## Notes

- [P] tasks = different files, no dependencies
- No direct `request` calls in UI components — all API access through `src/lib/api/*.ts` wrappers
- Auth guard uses existing `<ProtectedRoute>` pattern from `src/app/(store)/account/page.tsx`
- Cart store integration: on successful `POST /api/orders`, call `cartStore.reset()` then `router.push`
- No Zustand or form libraries for checkout — local `useState` only
- Phone validation: 11-digit Egyptian mobile, `01` prefix
- File upload: jpg/png only, max 5MB, immediate upload on selection
