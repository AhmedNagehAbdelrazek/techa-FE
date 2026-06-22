# Tasks: Admin Panel — Orders & Payment Review

**Input**: Design documents from `specs/015-admin-orders-payments/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not requested in this phase.

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify project structure and existing infrastructure

- [ ] T001 Verify all required shadcn UI wrappers exist: Table, Dialog, AlertDialog, Badge, Button, Input, Select, Textarea, Skeleton, ErrorState, EmptyState in `src/components/ui/`

**Note**: All required wrappers should already exist from Phase 13/14. If any are missing, create them.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: API wrapper that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T002 [P] Create admin orders API wrappers: `listOrders`, `getOrderDetail`, `updateOrderStatus`, `listPendingPayments`, `approvePayment`, `rejectPayment` in `src/lib/api/admin-orders.ts` with full TypeScript types and `adminOrdersKeys` query keys

**Checkpoint**: API layer ready — all user stories can now use these wrappers

---

## Phase 3: User Story 1 — Browse and Manage Orders List (Priority: P1) 🎯 MVP

**Goal**: Admin can view a paginated, sortable, filterable data table of all orders at `/admin/orders`

**Independent Test**: Navigate to `/admin/orders`, verify the table renders with columns: order number, customer, total, payment method, payment status, order status, date, and View button. Apply status/payment status filters. Type in search box (debounced). Click column headers to sort. Navigate to next page.

### Implementation for User Story 1

- [ ] T003 [P] [US1] Create `OrdersTable` component with server-side pagination, sortable columns (date/total/order number), status/payment status/date range filters, search by order number or email, empty/error states, and `OrdersTableSkeleton` export in `src/components/admin/OrdersTable.tsx`
- [ ] T004 [US1] Create orders list page at `src/app/admin/(protected)/orders/page.tsx` integrating `OrdersTable` with URL-based filter state (`?status=`, `?payment_status=`, `?search=`, `?sort=`, `?page=`) via `useSearchParams` + `useRouter.replace` (debounced 300ms), permission-gated by `orders.read`

**Checkpoint**: Orders list fully functional and independently testable. Admin can browse, search, filter, sort orders.

---

## Phase 4: User Story 2 — View Order Detail and Update Status (Priority: P1)

**Goal**: Admin can click "View" on an order and see full details — customer info, items, status timeline, payment card, address. Admin can update order status via a modal.

**Independent Test**: Navigate to `/admin/orders/:id`, verify all sections render. Open "Update Status" modal, select a valid next status, confirm, verify timeline updates without page reload. For manual payment orders, verify approve/reject buttons appear (gated by `orders.update`).

### Implementation for User Story 2

- [ ] T005 [P] [US2] Create `OrderDetail` component rendering customer info card, items table, status timeline (chronological from `status_history`), payment info card, and delivery address card with `OrderDetailSkeleton` export in `src/components/admin/OrderDetail.tsx`
- [ ] T006 [P] [US2] Create `OrderStatusUpdateModal` component with current status display, radio options for valid forward transitions (`pending → confirmed → processing → shipped → delivered`), confirm button, and `OrderStatusUpdateModalSkeleton` export in `src/components/admin/OrderStatusUpdateModal.tsx`
- [ ] T007 [P] [US2] Create `PaymentInfoCard` component showing payment method, status, proof reference, clickable screenshot thumbnail (opens Dialog), and Approve (AlertDialog) / Reject (Dialog with reason textarea) buttons gated by `orders.update` permission, with `PaymentInfoCardSkeleton` export in `src/components/admin/PaymentInfoCard.tsx`
- [ ] T008 [US2] Create order detail page at `src/app/admin/(protected)/orders/[id]/page.tsx` integrating `OrderDetail`, `OrderStatusUpdateModal`, and `PaymentInfoCard` with React Query invalidation on status/payment changes, permission-gated by `orders.read`

**Checkpoint**: Order detail fully functional. Admin can view all order info, update status, and approve/reject payments from the detail page.

---

## Phase 5: User Story 3 — Review and Approve/Reject Pending Payments (Priority: P2)

**Goal**: Admin can visit `/admin/payments` for a dedicated queue of payments awaiting review, with screenshot preview, approve with confirmation, and reject with reason.

**Independent Test**: Navigate to `/admin/payments`, verify pending payments list renders. Click screenshot thumbnail, verify Dialog opens with full-size image. Click "Approve" on a payment, confirm via AlertDialog, verify success toast and row removal. Click "Reject", enter reason, submit, verify row removal.

### Implementation for User Story 3

- [ ] T009 [P] [US3] Create `PaymentsTable` component with pending payments list (order number, customer, method, amount, proof reference, screenshot thumbnail, submitted date), screenshot preview Dialog, approve AlertDialog, reject Dialog with required reason textarea, empty state ("All caught up!"), and `PaymentsTableSkeleton` export in `src/components/admin/PaymentsTable.tsx`
- [ ] T010 [US3] Create pending payments page at `src/app/admin/(protected)/payments/page.tsx` integrating `PaymentsTable` with React Query invalidation after approve/reject (also invalidates order detail keys for cross-view consistency), permission-gated by `orders.read`

**Checkpoint**: Payments queue fully functional. Admin can review and process all pending payments.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Dashboard link, sidebar nav, final review, build verification

- [ ] T011 Add "Payments Awaiting Review" `DashboardMetricCard` (value from `pending_payments`, icon: `Banknote`, href: `/admin/payments`, `Highlighted`) to the dashboard at `src/app/admin/(protected)/page.tsx`
- [ ] T012 Add "Orders" and "Payments" links to the admin sidebar navigation at `src/components/admin/AdminSidebar.tsx` (or equivalent sidebar component)
- [ ] T013 Run build verification: `pnpm run build` — fix any type or lint errors

**Checkpoint**: All Phase 15 features complete and build passes.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — verify infrastructure exists
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Foundational
- **US2 (Phase 4)**: Depends on Foundational — can run in parallel with US1 (different files/components)
- **US3 (Phase 5)**: Depends on Foundational + US2 (shares `PaymentInfoCard` patterns, but can be parallelized)
- **Polish (Phase 6)**: Depends on all user stories complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Phase 2 — No dependencies on other stories
- **User Story 2 (P1)**: Can start after Phase 2 — No dependencies on other stories (different components)
- **User Story 3 (P2)**: Can start after Phase 2 — Reuses `admin-orders.ts` API wrappers, independent components

### Within Each User Story

- API wrappers before components
- Components before pages
- Page integration last

### Parallel Opportunities

- T002 can run standalone (API wrapper file only)
- T003, T005, T006, T007, T009 are all different component files — can run in full parallel
- T004, T008, T010 are page files — each depends on their component being done
- T011, T012 are independent edits

---

## Parallel Example: User Story 1

```bash
# Launch all components for US1 together:
Task: "Create OrdersTable in src/components/admin/OrdersTable.tsx"
Task: "Create orders page in src/app/admin/(protected)/orders/page.tsx"
```

## Parallel Example: User Story 2 + 3 (after API layer done)

```bash
# Launch all detail components together:
Task: "Create OrderDetail in src/components/admin/OrderDetail.tsx"
Task: "Create OrderStatusUpdateModal in src/components/admin/OrderStatusUpdateModal.tsx"
Task: "Create PaymentInfoCard in src/components/admin/PaymentInfoCard.tsx"
Task: "Create OrdersTable in src/components/admin/OrdersTable.tsx"

# Pages depend on components — do after:
Task: "Create order detail page in src/app/admin/(protected)/orders/[id]/page.tsx"
Task: "Create payments page in src/app/admin/(protected)/payments/page.tsx"
Task: "Create orders list page in src/app/admin/(protected)/orders/page.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: API wrappers
3. Complete Phase 3: Orders table + list page
4. **STOP and VALIDATE**: Test `/admin/orders` independently
5. Deploy/demo if ready

### Incremental Delivery

1. Phase 1 + 2 → API foundation ready
2. Add US1 (orders table + list) → Test independently → Deploy/Demo (MVP!)
3. Add US2 (order detail + status update + payment card) → Test independently → Deploy
4. Add US3 (pending payments queue) → Test independently → Deploy
5. Add Polish (dashboard + sidebar) → Final build verification

### Parallel Strategy

With multiple developers:
1. One developer creates the API wrapper (T002) — fast, ~30 min
2. Once done, parallelize:
   - Developer A: US1 (OrdersTable + page)
   - Developer B: US2 (OrderDetail, OrderStatusUpdateModal, PaymentInfoCard, detail page)
   - Developer C: US3 (PaymentsTable + payments page)
3. Developer A finishes first (simplest) — adds sidebar + dashboard links
4. Final build check by anyone

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
