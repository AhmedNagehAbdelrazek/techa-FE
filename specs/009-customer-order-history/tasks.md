---
description: "Task list for Customer Order History & Detail feature"
---

# Tasks: Customer Order History & Detail

**Input**: Design documents from `specs/009-customer-order-history/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/orders-api.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Project root**: `C:\Users\Laptop\Documents\Projects\techa-FE`
- **Source**: `src/`
- All paths relative to project root

---

## Phase 1: Foundation (Shared Infrastructure)

**Purpose**: Type definitions and API wrapper enhancements that all user stories depend on.

- [ ] T001 [P] Add `OrdersListResponse`, `OrdersQueryParams`, `OrderListItem`, `Meta` types to `src/lib/types/order.ts`
- [ ] T002 Update `getOrders()` in `src/lib/api/orders.ts` to accept `OrdersQueryParams` and return `OrdersListResponse` with paginated data

**Checkpoint**: Foundation types and API ready — user story implementation can begin.

---

## Phase 2: User Story 1 — View and Filter Order History (Priority: P1) 🎯 MVP

**Goal**: Customers can browse their past orders on `/orders`, filter by status tabs, and see paginated results with order cards showing thumbnail, status badge, total, date, and item count.

**Independent Test**: Logged-in customer with multiple orders visits `/orders`, sees all orders listed chronologically with correct details, clicks a status filter tab, and sees only matching orders.

- [ ] T003 [P] [US1] Create `src/components/store/OrderStatusTabs.tsx` — Horizontal tab bar with All, Pending, Confirmed, Processing, Shipped, Delivered, Cancelled, Refunded. Active tab highlighted. Calls `onTabChange` callback.
- [ ] T004 [P] [US1] Create `src/components/store/OrderCard.tsx` — Card showing order number, date, status badge with color coding, total, item count, and first item thumbnail. Links to `/orders/[id]`.
- [ ] T005 [US1] Enhance `src/app/(store)/orders/page.tsx` — Integrate OrderStatusTabs and OrderCard. Add pagination controls. Handle loading state (skeleton), empty state ("No orders yet — Start Shopping"), and error state with retry. Pass status filter as API query param.

**Checkpoint**: Order list page fully functional with filtering and pagination.

---

## Phase 3: User Story 2 — View Order Detail and Status Timeline (Priority: P1)

**Goal**: Customers can click any order and see full details including a visual step tracker, itemized list, delivery address, and payment info.

**Independent Test**: A customer clicks an order from the list and sees the detail page with timeline, items, address, and payment info all populated correctly.

- [ ] T006 [P] [US2] Create `src/components/store/OrderStatusTimeline.tsx` — Vertical visual step tracker showing all statuses from Pending to current. Each step has a colored dot, connecting line, status name, and date. Includes a hidden `<ol>` for screen readers reading "Step N: [Status] — [date]" (per FR-018). Completed steps highlighted, future steps grayed out.
- [ ] T007 [US2] Enhance `src/app/(store)/orders/[id]/page.tsx` — Replace basic status list with OrderStatusTimeline component. Add stale data detection: re-fetch on `visibilitychange` if >30s since last fetch, show toast if status changed (per Q4 clarification).

**Checkpoint**: Order detail page shows full information with accessible timeline.

---

## Phase 4: User Story 3 — Cancel an Order (Priority: P2)

**Goal**: Customers can cancel an order that is in `pending` or `confirmed` status with a confirmation dialog.

**Independent Test**: A customer viewing a pending order clicks "Cancel Order", confirms in the dialog, and sees the status update to cancelled.

- [ ] T008 [US3] Enhance `src/app/(store)/orders/[id]/page.tsx` — Replace `window.confirm()` with shadcn `AlertDialog` (use existing `ui/alert-dialog` component) for cancel confirmation. Show cancel button only when status is `pending` or `confirmed`. On confirm: call cancel API, update UI optimistically, re-fetch to confirm, show success toast. Handle error case (order no longer cancellable) with error toast.

**Checkpoint**: Cancel flow works with proper dialog and error handling.

---

## Phase 5: User Story 4 — Submit Payment Proof from Order Detail (Priority: P2)

**Goal**: Customers who chose Instapay or Vodafone Cash can submit or resubmit payment proof from the order detail page.

**Independent Test**: A customer with a pending manual payment order can submit a proof reference and screenshot from the order detail page.

- ⚠️ **ALREADY IMPLEMENTED** in Phase 8 — `src/app/(store)/orders/[id]/page.tsx` has payment proof submission form and resubmission logic. No changes needed.

**Checkpoint**: Payment proof submission available from order detail.

---

## Phase 6: User Story 5 — Review Prompt for Delivered Items (Priority: P3)

**Goal**: Customers see a "Write a Review" link for each delivered item that hasn't been reviewed yet, linking to the product page with review section auto-opened.

**Independent Test**: A customer viewing a delivered order sees a "Write a Review" link next to each unreviewed item.

- [ ] T009 [US5] Enhance `src/app/(store)/orders/[id]/page.tsx` — For delivered orders, show a "Write a Review" link next to each item that has a `product_id` and hasn't been reviewed yet. Link navigates to `/product/[slug]?review=1&order_item_id=[id]` (product page opens review section with pre-filled order_item_id). Conditionally render based on order status and item review status.

**Checkpoint**: Review prompts shown for delivered unreviewed items.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and quality checks.

- [ ] T010 Run build verification: `npm run build` passes with no errors
- [ ] T011 Run lint check: `npm run lint` passes with no errors
- [ ] T012 Run type check: `npx tsc --noEmit` passes with no errors
- [ ] T013 Verify all status badge colors match: pending=yellow, confirmed=blue, processing=indigo, shipped=cyan, delivered=green, cancelled=red, refunded=orange
- [ ] T014 Verify ARIA labels and keyboard navigation on OrderStatusTabs and OrderStatusTimeline

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundation (Phase 1)**: No dependencies — can start immediately
- **User Stories (Phases 2-6)**: All depend on Phase 1 completion
  - US1 is independent — no dependency on other stories
  - US2 is independent from US1 (different page)
  - US3 modifies the same file as US2 — must be implemented sequentially
  - US5 modifies the same file as US2 — must be implemented after US2

### User Story Dependencies

- **US1 (P1)**: After Phase 1 — no dependencies on other stories
- **US2 (P1)**: After Phase 1 — no dependencies on other stories (different file from US1)
- **US3 (P2)**: After Phase 1 + US2 (same file: `orders/[id]/page.tsx`)
- **US4 (P2)**: Already implemented — no tasks needed
- **US5 (P3)**: After Phase 1 + US2 + US3 (same file: `orders/[id]/page.tsx`)

### Within Each User Story

- Components before page integration
- Page integration before state management
- Story complete before moving to next

### Parallel Opportunities

- T001 + T002 in Phase 1 can run in parallel (different files)
- T003 + T004 in US1 can run in parallel (different files)
- All user stories can run in parallel EXCEPT those touching the same file (`orders/[id]/page.tsx`)

---

## Parallel Example: User Story 1

```bash
# Launch all US1 components together:
Task: "Create OrderStatusTabs component in src/components/store/OrderStatusTabs.tsx"
Task: "Create OrderCard component in src/components/store/OrderCard.tsx"

# Then integrate:
Task: "Enhance orders page in src/app/(store)/orders/page.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 + 2)

1. Complete Phase 1: Foundation
2. Complete Phase 2: User Story 1 (order list with filters + pagination)
3. Complete Phase 3: User Story 2 (order detail with timeline)
4. **STOP and VALIDATE**: Both P1 stories working — core order history experience complete
5. Deploy/demo if ready

### Incremental Delivery

1. Foundation → Types + API ready
2. US1 + US2 → Customers can browse and view orders (MVP!)
3. US3 → Customers can cancel orders
4. US5 → Review prompts for delivered items
5. Each story adds value without breaking previous stories

### Sequential Implementation (Single Developer)

Since US3, US5 all touch `orders/[id]/page.tsx`:

1. Phase 1: Foundation
2. Phase 2: US1 (order list — independent file)
3. Phase 3: US2 (order detail — adds timeline + stale data)
4. Phase 4: US3 (order detail — adds AlertDialog cancel)
5. Phase 6: US5 (order detail — adds review prompts)
6. Phase 7: Polish + verify

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- No new dependencies — all needed packages are already in `package.json`
- All state is local `useState` — no new Zustand stores
