# Feature Specification: Admin Panel — Orders & Payment Review

**Feature Branch**: `015-admin-orders-payments`

**Created**: 2026-06-23

**Status**: Draft

**Input**: User description: "Phase 15 — Admin Panel: Orders & Payment Review from the frontend-spec.md, using the endpoint references from the Postman collection"

## Clarifications

### Session 2026-06-23

- Q: The list orders API (`GET /api/admin/orders`) response does NOT include customer info (name, email) — only `order_number`, `status`, `payment_method`, `payment_status`, `total`, `item_count`, `created_at`. The frontend-spec table requires a "customer" column. How should we handle this? → A: The backend must include `customer` fields in the list endpoint; if not available, display "—" as a placeholder and file a backend ticket.
- Q: Is CSV export required for the orders list? → A: Not required for this phase. Deferred.
- Q: What is the order status lifecycle? → A: `pending → confirmed → processing → shipped → delivered`. Cancellation and refund are supported from most states (back-end managed). The "Update Status" modal should show only valid forward transitions.
- Q: Should the `/admin/payments` page redirect back to the previous page after approve/reject? → A: Yes. After action, refresh the list (invalidate React Query) and show a success toast.
- Q: Should the admin order detail page include separate Cancel or Refund buttons? → A: No — deferred. Customer self-service cancel already exists (Phase 9), refund has its own dedicated phase (Phase 23). This phase only covers forward lifecycle transitions (pending → confirmed → processing → shipped → delivered) via the status update modal.
- Q: Is payment approve/reject gated by `payments.manage` or `orders.update`? → A: `orders.update` — payment review is part of order processing, not a separate domain. No backend schema change needed.
- Q: Should the orders data table support column sorting? → A: Yes — clicking column headers (date, total, order number) toggles ASC/DESC sort. Requires `?sort=field:dir` query param support from the backend.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Browse and Manage Orders List (Priority: P1)

An admin lands on `/admin/orders` and sees a paginated data table of all orders. The admin can filter by status, payment status, date range, and search by order number or customer email.

**Why this priority**: The orders list is the primary entry point for order management. Without it, admins cannot locate orders to process, update, or review.

**Independent Test**: Navigate to `/admin/orders`, verify the table renders with orders, apply filters, confirm pagination works.

**Acceptance Scenarios**:

1. **Given** an authenticated admin is on the orders page, **When** the page loads, **Then** a paginated table displays with columns: order number, customer, total, payment method, payment status, order status, date, and actions (View)
2. **Given** the orders table is displayed, **When** the admin selects a status filter (e.g., "pending"), **Then** only orders with that status are shown
3. **Given** the orders table is displayed, **When** the admin selects a payment status filter (e.g., "pending"), **Then** only orders with that payment status are shown
4. **Given** the orders table is displayed, **When** the admin types in the search box, **Then** results filter to show only orders whose order number or customer email matches (debounced 300ms)
5. **Given** the orders table is displayed, **When** the admin clicks the "View" action on a row, **Then** they are navigated to `/admin/orders/:id`

---

### User Story 2 — View Order Detail and Update Status (Priority: P1)

An admin clicks "View" on an order row and sees the full order detail: customer info, items table, status timeline, payment info, and delivery address. The admin can update the order status via a modal.

**Why this priority**: Processing orders through their lifecycle (confirm, process, ship, deliver) is the core operational task.

**Independent Test**: Navigate to `/admin/orders/:id`, verify all sections render with correct data, open the status update modal, change status, confirm the timeline updates.

**Acceptance Scenarios**:

1. **Given** an admin is on the order detail page, **When** the page loads, **Then** the customer info card, items table, status timeline, payment info card, and delivery address card are all rendered
2. **Given** the status timeline is displayed, **When** the admin views it, **Then** it shows entries from `status_history` in chronological order with old → new status, admin name, and timestamp
3. **Given** the admin clicks "Update Status", **When** the modal opens, **Then** it shows the current status (read-only) and radio options for valid next statuses
4. **Given** the admin selects a new status, **When** they confirm, **Then** the status updates, the modal closes, and the timeline shows the new entry without a full page reload
5. **Given** an order has an Instapay or Vodafone Cash payment awaiting review, **When** the admin views the payment info card, **Then** they see the proof reference, screenshot (clickable to enlarge), and Approve/Reject buttons
6. **Given** the admin approves a payment from the order detail page, **When** the action completes, **Then** the payment status changes to "paid" and the payment info card updates

---

### User Story 3 — Review and Approve/Reject Pending Payments (Priority: P2)

An admin visits `/admin/payments` and sees a dedicated queue of payments awaiting review. The admin can click thumbnails to enlarge screenshots, and approve or reject each payment.

**Why this priority**: Manual payment review is a bottleneck; a dedicated queue prevents admins from having to hunt through orders to find payments needing action.

**Independent Test**: Navigate to `/admin/payments`, verify the pending payments list renders, approve a payment, reject another, confirm both update correctly.

**Acceptance Scenarios**:

1. **Given** an admin is on the payments page, **When** the page loads, **Then** a paginated list shows pending payments with: order number, customer name, method, amount, proof reference, screenshot thumbnail, and submitted date
2. **Given** the admin clicks a screenshot thumbnail, **When** the Dialog opens, **Then** the full-size image is displayed with a close button
3. **Given** the admin clicks "Approve" on a payment, **When** they confirm via AlertDialog, **Then** the payment status changes to "succeeded", the order advances to "confirmed", and a success toast appears
4. **Given** the admin clicks "Reject" on a payment, **When** they enter a required rejection reason and submit, **Then** the payment status changes to "failed" and the order's payment status changes to "failed"
5. **Given** an admin is on the payments page, **When** they approve or reject a payment, **Then** the payment row is removed from the pending list (React Query invalidation)

### Edge Cases

- What happens if an admin tries to update an order status to an invalid transition? The backend will reject it with a 422 error; the frontend must show the error message in a toast.
- How does the system handle concurrency if two admins try to process the same order? The backend should handle at the DB level; the frontend just shows the error toast.
- What happens when the screenshot URL fails to load? Show a broken image placeholder with a "Retry" link.
- What happens if a payment is already approved by another admin? The approve/reject endpoint returns a 409 conflict; show a toast "Payment already processed".
- How does the date range filter work for orders? Use two separate inputs (from date / to date) in the filter bar, passed as query params `date_from` and `date_to` — note: the Postman collection does not document these params, so they may need backend confirmation.
- What happens when an order has no customer info (e.g., deleted customer)? Show "Deleted Customer" as fallback text.
- What happens when there are no pending payments? Show an empty state with "All caught up!" message.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a paginated, sortable order data table with columns: order number, customer, total, payment method, payment status, order status, date, and actions (View button). Column headers for date, total, and order number MUST support click-to-sort (ASC/DESC toggle).
- **FR-002**: Admin MUST be able to filter orders by order status using a dropdown selector
- **FR-003**: Admin MUST be able to filter orders by payment status using a dropdown selector
- **FR-004**: Admin MUST be able to search orders by order number or customer email with debounced input (300ms)
- **FR-005**: Admin MUST be able to filter orders by date range (from/to date inputs)
- **FR-006**: Admin MUST be able to click "View" on an order row to navigate to the order detail page (`/admin/orders/:id`)
- **FR-007**: System MUST display the order detail page with these sections: customer info card, items table, status timeline, payment info card, delivery address card
- **FR-008**: System MUST display the status timeline from `status_history` entries in chronological order showing: from_status, to_status, changed_by, changed_at
- **FR-009**: Admin MUST be able to open an "Update Status" modal from the order detail page showing the current status and valid forward lifecycle transitions (pending → confirmed → processing → shipped → delivered) as radio options. Cancel and refund transitions are excluded from this modal.
- **FR-010**: Admin MUST be able to confirm a status update, after which the timeline updates without a full page reload
- **FR-011**: System MUST show Approve/Reject buttons on the payment info card when the payment method is "instapay" or "vodafone_cash", the payment status is "pending", AND the admin has `orders.update` permission
- **FR-012**: Admin MUST be able to enlarge the payment proof screenshot by clicking the thumbnail to open a Dialog
- **FR-013**: System MUST display a dedicated `/admin/payments` page listing all pending payments with: order number, customer name, method, amount, proof reference, screenshot thumbnail, submitted date
- **FR-014**: Admin MUST be able to approve a payment via a confirmation AlertDialog, calling `PUT /api/admin/payments/:id/approve`
- **FR-015**: Admin MUST be able to reject a payment by providing a required rejection reason in a Dialog, calling `PUT /api/admin/payments/:id/reject` with `{ "rejection_note": "..." }`
- **FR-016**: System MUST show loading skeletons for all data tables while data is being fetched
- **FR-017**: System MUST show error states with retry capability when API calls fail
- **FR-018**: System MUST paginate the orders list with a page size of 20 by default
- **FR-019**: System MUST paginate the pending payments list with a page size of 20 by default
- **FR-020**: System MUST show an empty state when no orders match the current filters with a "Clear Filters" button
- **FR-021**: System MUST show an empty state when no pending payments exist with an "All caught up!" message
- **FR-022**: System MUST invalidate and refetch relevant React Query data after any payment approval/rejection action across both `/admin/orders/:id` and `/admin/payments`
- **FR-023**: Admin dashboard metric card "Payments Awaiting Review" (from `pending_payments` in stats) MUST link to `/admin/payments`
- **FR-024**: System MUST conditionally show/hide order management UI elements based on the admin's permissions — `orders.read` for page access, `orders.update` for status update button and payment approve/reject actions (follow the same permission pattern from Phase 14 appendix)

### Key Entities

- **Order**: Core entity representing a customer purchase. Has order_number, status, payment_method, payment_status, subtotal, discount, shipping_charge, total, coupon, notes, timestamps. Associated with a customer, shipping address, items, status history entries, and payments.
- **OrderItem**: A line item within an order. References a product and optionally a variant, with qty, unit_price, and total_price.
- **OrderStatusHistory**: Audit trail of status changes. Records from_status, to_status, changed_by (admin name), and changed_at timestamp.
- **Payment**: Records a payment attempt for an order. Has method, amount, status, proof_reference, proof_screenshot_url, and review fields (reviewed_by, reviewed_at, rejection_note).
- **PendingPayment**: View-specific entity returned by the pending payments endpoint — combines payment data with related Order and User info for the review queue.

### API Endpoints

#### Orders

| Method | Endpoint | Description | Query/Body |
|--------|----------|-------------|------------|
| GET | `/api/admin/orders` | List all orders (paginated, sortable) | `?status=&payment_status=&page=1&limit=20&sort=created_at:desc` |
| GET | `/api/admin/orders/:id` | Get order detail with items, history, customer, payments | — |
| PUT | `/api/admin/orders/:id/status` | Update order status | Body: `{ "status": "confirmed" }` |
| GET | `/api/admin/orders/stats` | Order statistics (already exists) | `?period=7d` |

#### Payments

| Method | Endpoint | Description | Query/Body |
|--------|----------|-------------|------------|
| GET | `/api/admin/payments/pending` | List pending payments (paginated) | `?page=1&limit=20` |
| PUT | `/api/admin/payments/:id/approve` | Approve a pending payment | — |
| PUT | `/api/admin/payments/:id/reject` | Reject a pending payment | Body: `{ "rejection_note": "..." }` |

### Response Shapes

#### List Orders Response
```json
{
  "data": [
    {
      "id": "order-uuid",
      "order_number": "ORD-001",
      "status": "pending",
      "payment_method": "cash_on_delivery",
      "payment_status": "pending",
      "total": 164.98,
      "item_count": 2,
      "customer": { "id": "uuid", "full_name": "Ahmed Ali", "email": "ahmed@example.com" },
      "created_at": "2026-06-01T10:00:00.000Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 1, "totalPages": 1 }
}
```

> **Note**: The current Postman response for the list endpoint does NOT include `customer`. This field must be added by the backend, or the spec will display "—" as a placeholder.

#### Order Detail Response
```json
{
  "id": "uuid",
  "order_number": "ORD-001",
  "status": "pending",
  "payment_method": "cash_on_delivery",
  "payment_status": "pending",
  "subtotal": 150,
  "discount": 0,
  "shipping_charge": 65,
  "total": 215,
  "coupon": null,
  "notes": "",
  "shipping_address": {
    "id": "addr-uuid",
    "full_name": "Ahmed Ali",
    "phone": "+966501234567",
    "street": "123 Main St",
    "city": "Cairo",
    "state": "",
    "zip_code": "",
    "country": "Egypt",
    "zone_id": "zone-uuid"
  },
  "items": [
    {
      "id": "item-uuid",
      "product_id": "prod-uuid",
      "product_name": "Product Name",
      "variant_id": null,
      "variant_label": null,
      "qty": 2,
      "unit_price": 50,
      "total_price": 100
    }
  ],
  "status_history": [
    {
      "from_status": null,
      "to_status": "pending",
      "changed_by": null,
      "changed_at": "2026-06-01T10:00:00.000Z"
    }
  ],
  "customer": {
    "id": "user-uuid",
    "full_name": "Ahmed Ali",
    "email": "ahmed@example.com",
    "phone": "+966501234567"
  },
  "payments": [],
  "created_at": "2026-06-01T10:00:00.000Z",
  "updated_at": "2026-06-01T10:00:00.000Z"
}
```

#### List Pending Payments Response
```json
{
  "data": [
    {
      "id": "pay-uuid",
      "order_id": "order-uuid",
      "payment_method": "instapay",
      "amount": 215,
      "status": "pending",
      "proof_reference": "INSTAPAY-12345",
      "proof_screenshot_url": "https://cdn.example.com/proof.jpg",
      "created_at": "2026-06-01T10:00:00.000Z",
      "Order": {
        "id": "order-uuid",
        "order_number": "ORD-001",
        "status": "pending",
        "payment_status": "pending"
      },
      "User": {
        "id": "user-uuid",
        "full_name": "Ahmed Ali",
        "email": "ahmed@example.com"
      }
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 1, "totalPages": 1 }
}
```

#### Approve Payment Response
```json
{
  "payment": {
    "id": "pay-uuid",
    "status": "succeeded",
    "paid_at": "2026-06-01T11:00:00.000Z",
    "reviewed_by": "admin-uuid",
    "reviewed_at": "2026-06-01T11:00:00.000Z"
  },
  "order": {
    "id": "order-uuid",
    "order_number": "ORD-001",
    "status": "confirmed",
    "payment_status": "paid"
  }
}
```

#### Reject Payment Response
```json
{
  "payment": {
    "id": "pay-uuid",
    "status": "failed",
    "reviewed_by": "admin-uuid",
    "reviewed_at": "2026-06-01T11:00:00.000Z",
    "rejection_note": "Screenshot is illegible"
  },
  "order": {
    "id": "order-uuid",
    "order_number": "ORD-001",
    "status": "pending",
    "payment_status": "failed"
  }
}
```

#### Update Order Status Response
Same shape as Order Detail Response, with updated `status` and an additional `status_history` entry.

#### Order Statistics Response (existing, for dashboard link)
```json
{
  "total_orders": 150,
  "total_revenue": 25000,
  "by_status": { "pending": 25, "confirmed": 30, "processing": 20, "shipped": 15, "delivered": 40, "cancelled": 15, "refunded": 5 },
  "pending_payments": 10
}
```

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An admin can find any order within 3 clicks or 10 seconds using filters and search
- **SC-002**: An admin can change an order's status in under 30 seconds from the order detail page
- **SC-003**: An admin can review and process a payment (approve or reject) in under 45 seconds from the payments queue
- **SC-004**: The orders list page loads and renders within 2 seconds on a standard internet connection
- **SC-005**: All order and payment management operations are fully functional on mobile viewport width of 375px

### Out of Scope

- CSV/Excel export of orders — deferred to a future phase
- Print invoice/receipt functionality — deferred
- Email/SMS notification triggers from the admin panel (handled server-side)
- Refund processing UI — covered in Phase 23 (Returns & Refunds)
- Customer profile page from the admin panel — covered in Phase 22
- Real-time order updates via WebSocket/Socket.IO — deferred
- Admin-initiated order cancellation — deferred (customer self-service exists in Phase 9)

## Assumptions

- The list orders endpoint will include `customer` fields as shown in the spec above; if not, the frontend displays "—" fallback
- The update status endpoint enforces valid transitions on the backend; the frontend only exposes forward transitions
- Approve/Reject endpoints handle idempotency — calling them twice returns a soft error (409 Conflict)
- The existing React Query invalidation pattern from Phase 14 (query keys) is used to keep order detail and payments list in sync
- Order status badge colors follow the same convention as Phase 9 (customer side): pending=yellow, confirmed=blue, processing=indigo, shipped=cyan, delivered=green, cancelled=red, refunded=orange
- Payment status badge colors: pending=yellow, paid=green, failed=red, refunded=orange
- Date range filter uses HTML date inputs (`<input type="date">`) for simplicity, no date picker library needed
- The existing `useAdminStore` permission check pattern from Phase 14 applies: `orders.read` for page access, `orders.update` for status update
- No new shadcn UI wrappers are needed — all required components (Table, Dialog, AlertDialog, Badge, Button, Input, Select, Textarea) already exist
- `adminRequest` from `AdminRequest.ts` is used for all API calls (existing pattern)
- sonner `toast()` is used for success/error notifications
- `ErrorState` and `EmptyState` from `src/components/ui/` are reused for error and empty states
