# Feature Specification: Customer Order History & Detail

**Feature Branch**: `009-customer-order-history`

**Created**: 2026-06-20

**Status**: Draft

**Input**: User description: "Customer Order History and Detail"

## Clarifications

### Session 2026-06-20

- Q: Should "Confirmed" and "Refunded" be added as status filter tabs? → A: Yes, include both "Confirmed" and "Refunded" tabs alongside the existing set.
- Q: Where should the "Write a Review" link navigate to? → A: Navigate to the product detail page with the review section auto-opened and order_item_id pre-filled.
- Q: How should the status timeline be announced to screen readers? → A: Use a visually hidden ordered list where screen readers announce each step as "Step N: [Status] — [date]".
- Q: How should stale data be handled if admin changes order status while customer is viewing? → A: Show a toast notification on tab focus/visibility change indicating data changed, with a refresh action.

## User Scenarios & Testing

### User Story 1 - View and Filter Order History (Priority: P1)

Customers can browse their past orders on a dedicated page, filter them by status, and see key information at a glance such as order number, date, status, total, and number of items.

**Why this priority**: This is the primary entry point for customers to track their purchases. Without it, customers have no way to reference past orders.

**Independent Test**: Logged-in customer with multiple orders can visit the orders page, see them listed with correct details, and filter by status. Each filter shows only orders matching that status.

**Acceptance Scenarios**:

1. **Given** a customer has placed multiple orders with different statuses, **When** they visit `/orders`, **Then** they see all their orders listed chronologically (newest first) with order number, date, status badge, total, and item count for each.
2. **Given** a customer is on the orders page, **When** they click a status filter tab (e.g., "Delivered"), **Then** only orders matching that status are shown and the active tab is highlighted.
3. **Given** a customer has more than 20 orders, **When** they scroll to the bottom of the list, **Then** pagination controls appear allowing them to navigate to additional pages.
4. **Given** a customer has no orders, **When** they visit `/orders`, **Then** they see an empty state message with a prompt to start shopping.

---

### User Story 2 - View Order Detail and Status Timeline (Priority: P1)

Customers can see the full details of a specific order, including a visual status timeline, itemized list, delivery address, and payment information.

**Why this priority**: Customers need to track where their order is in the fulfillment process and see all relevant details in one place.

**Independent Test**: A customer can click any order from the orders list and view its complete detail page with all sections populated correctly.

**Acceptance Scenarios**:

1. **Given** a customer is viewing an order detail page, **When** the page loads, **Then** they see a visual step tracker showing all status transitions from Pending to the current status, with each step showing the date/time it occurred.
2. **Given** an order has been placed, **When** viewing order detail, **Then** each ordered item is listed with its product name, variant (if any), quantity, unit price, and line total.
3. **Given** an order has a delivery address, **When** viewing order detail, **Then** the full delivery address and phone number are displayed.
4. **Given** an order uses a manual payment method (Instapay or Vodafone Cash), **When** viewing order detail, **Then** the payment method, payment status (pending review / approved / rejected), and any rejection note are shown.

---

### User Story 3 - Cancel an Order (Priority: P2)

Customers can cancel an order that is still in `pending` or `confirmed` status.

**Why this priority**: Order cancellation is an essential customer right that reduces support burden and improves trust.

**Independent Test**: A customer with an order in `pending` status can cancel it and see the status update immediately.

**Acceptance Scenarios**:

1. **Given** a customer is viewing an order with status `pending` or `confirmed`, **When** they click "Cancel Order", **Then** a confirmation dialog appears explaining the action.
2. **Given** the customer confirms cancellation in the dialog, **When** the API call succeeds, **Then** the order status updates to `cancelled` in the UI and a success message is shown.
3. **Given** a customer is viewing an order with status `shipped`, `delivered`, or `cancelled`, **When** they look for the cancel button, **Then** no cancel button is shown.

---

### User Story 4 - Submit Payment Proof from Order Detail (Priority: P2)

Customers who chose a manual payment method (Instapay or Vodafone Cash) can submit their payment proof from the order detail page if they skipped it during checkout or need to resubmit after a rejection.

**Why this priority**: This provides a safety net for customers who didn't complete payment during checkout and allows resubmission if a proof is rejected.

**Independent Test**: A customer with a pending manual payment order can submit a proof reference and screenshot from the order detail page.

**Acceptance Scenarios**:

1. **Given** a customer has a pending order with a manual payment method and no proof has been submitted yet, **When** they view the order detail, **Then** they see the payment proof submission form with transaction reference input and screenshot upload.
2. **Given** a customer previously submitted a proof that was rejected, **When** they view the order detail, **Then** they see the rejection note and a resubmission form.
3. **Given** a customer submits valid proof, **When** the API call succeeds, **Then** the payment status updates to "submitted" and the form is replaced with a "Payment under review" message.

---

### User Story 5 - Review Prompt for Delivered Items (Priority: P3)

Customers see a prompt to review each item in a delivered order that hasn't been reviewed yet.

**Why this priority**: Encourages review collection from verified purchasers, building trust for other customers.

**Independent Test**: A customer viewing a delivered order sees a "Write a Review" link next to each item that hasn't been reviewed yet.

**Acceptance Scenarios**:

1. **Given** a customer views a delivered order containing items not yet reviewed, **When** they scroll to the items section, **Then** each unreviewed item shows a "Write a Review" link.
2. **Given** a customer clicks "Write a Review" on a delivered item, **When** the page navigates to that product's detail page with the review section auto-opened and order_item_id pre-filled, **Then** the customer can submit their review.

### Edge Cases

- What happens when an order has no items (should not occur, but handled gracefully)?
- How does the status timeline render when there is only a single status entry?
- What happens when the order detail API returns a 404 (order not found or not owned by customer)?
- How does the cancel button behave if the API call fails due to the order no longer being cancellable?
- What happens if the payment proof upload fails mid-upload?
- How does pagination behave when the last page has fewer items than the page size?
- What happens when the customer has orders across all statuses and filters by a status with no results?
- How does the order detail page detect and notify about status changes made by admin while the customer is viewing? (Resolution: toast notification on tab focus, with refresh action.)

## Requirements

### Functional Requirements

- **FR-001**: Customers MUST be able to view a paginated list of their orders, sorted newest-first.
- **FR-002**: Customers MUST be able to filter their order list by status using tab-style filters: All, Pending, Confirmed, Processing, Shipped, Delivered, Cancelled, Refunded.
- **FR-003**: Each order card in the list MUST display: order number, date, status badge with color coding, total amount, and item count.
- **FR-004**: The order list MUST show a thumbnail of the first product image on each order card.
- **FR-005**: Customers MUST be able to click any order card to navigate to that order's detail page.
- **FR-006**: The order detail page MUST display a visual step tracker showing all status transitions in chronological order, highlighting the current status.
- **FR-007**: The order detail page MUST display an itemized list of all products in the order with: product name, variant label, quantity, unit price, and line total.
- **FR-008**: The order detail page MUST display the full delivery address including recipient name, phone, street, and city.
- **FR-009**: The order detail page MUST display payment method, payment status, and for manual payments (Instapay/Vodafone Cash) the review status with any rejection note.
- **FR-010**: Customers MUST be able to cancel an order if its status is `pending` or `confirmed`.
- **FR-011**: The cancel action MUST show a confirmation dialog before executing.
- **FR-012**: After a successful cancellation, the order status MUST update to `cancelled` in the UI immediately and the cancel button must disappear.
- **FR-013**: Customers with manual payment orders MUST be able to submit payment proof (transaction reference + screenshot) from the order detail page.
- **FR-014**: If a payment proof was rejected, customers MUST see the rejection reason and be able to resubmit.
- **FR-015**: The order list and detail pages MUST show a loading state while data is being fetched.
- **FR-016**: The order list MUST show a meaningful empty state when the customer has no orders.
- **FR-017**: Customers viewing a delivered order MUST see a prompt to write a review for each item that hasn't been reviewed yet.
- **FR-018**: The status timeline MUST include a hidden ordered list for screen readers, with each entry reading "Step N: [status name] — [date]".

### Key Entities

- **Order**: Represents a customer's purchase. Contains items, shipping address, payment info, status history, and financial breakdown (subtotal, discount, shipping, total).
- **OrderItem**: A single product line within an order. Contains product name, variant info, quantity, unit price, and line total.
- **OrderStatusHistory**: A timestamped record of each status transition for an order, including who changed it.
- **Payment**: Represents a payment transaction for an order. For manual payments, includes proof reference, screenshot URL, review status, and rejection reason.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Customers can find any past order within 2 clicks (order list → order detail).
- **SC-002**: The order list page loads and displays orders within 3 seconds on a standard connection.
- **SC-003**: Customers can successfully cancel a cancellable order in under 30 seconds from landing on the order detail page.
- **SC-004**: Customers with manual payment methods can submit payment proof in under 2 minutes from landing on the order detail or confirmation page.
- **SC-005**: Status badges are visually distinct by color so customers can identify order status at a glance without reading text labels.

## Assumptions

- Customers must be logged in to access any order pages — unauthenticated access redirects to the login page.
- The order history page is built on top of existing checkout infrastructure (the order placement, order retrieval, and payment proof API wrappers already exist).
- The backend returns orders with all necessary related data (items, status history, shipping address, payment info) in a single API call for the order detail endpoint.
- The status timeline visual step tracker shows all statuses from Pending through Delivered, with completed steps marked and the current step highlighted.
- Status badge colors follow a consistent scheme: Pending (yellow), Confirmed (blue), Processing (indigo), Shipped (cyan), Delivered (green), Cancelled (red), Refunded (orange).
- The review prompt for delivered items links to the existing review creation flow (Phase 6) with the product and order item pre-identified.
- Pagination uses standard page-based navigation with page numbers, not infinite scroll.
- The cancel button uses a standard confirmation dialog and updates the UI optimistically after a successful API response, then re-fetches to confirm.
