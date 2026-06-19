# Feature Specification: Customer Cart

**Feature Branch**: `007-customer-cart`

**Created**: 2026-06-19

**Status**: Draft

**Input**: Phase 7 from frontend-spec.md — Full cart experience: view, manage items, apply coupons, and proceed to checkout.

---

### Out of Scope

- Checkout flow (covered by Phase 8)
- Guest cart (requires authentication — all cart operations require login)
- Cart sharing or saved-for-later
- Multi-vendor cart (single-vendor marketplace)

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — View Cart (Priority: P1)

A customer visits their cart to review items, see totals, and proceed to checkout.

**Why this priority**: Viewing the cart is the minimum viable feature — customers need to see what they've added before purchasing.

**Independent Test**: Log in, add a product to the cart from the product detail page, navigate to the cart view, and verify the item is displayed with its thumbnail, name, variant label (if applicable), unit price, quantity, line total, and current price. Verify subtotal and total are calculated correctly.

**Acceptance Scenarios**:

1. **Given** a customer is logged in and has items in their cart **When** they open the cart view, **Then** all cart items are displayed with: product thumbnail, product name, variant label, unit price, quantity stepper, line total, and a remove button
2. **Given** a cart item's `current_price` differs from its `unit_price` **When** the cart loads, **Then** a price change warning badge is shown on that item
3. **Given** a customer has an empty cart **When** they open the cart view, **Then** an empty state with an illustration and "Continue Shopping" button linking to `/` is displayed
4. **Given** a customer opens the cart **When** items are loading, **Then** a skeleton or spinner is shown

---

### User Story 2 — Manage Cart Items (Priority: P1)

A customer adds, updates, or removes products in their cart.

**Why this priority**: Customers need to control what and how much they purchase.

**Independent Test**: From any product page, add a product to the cart. Verify the header badge updates. Open the cart, increase quantity using the stepper, verify the line total and cart total update. Remove the item, verify the cart shows empty state.

**Acceptance Scenarios**:

1. **Given** a customer is on a product detail page **When** they click "Add to Cart" with a valid quantity, **Then** the item is added to the cart, the header badge count increments, and a success toast is shown
2. **Given** a customer has an item in their cart **When** they increase the quantity using the stepper, **Then** the line total and cart total update, and the "+" button is disabled when quantity reaches available stock
3. **Given** a customer has an item in their cart **When** they decrease the quantity to 0 or click "Remove", **Then** the item is removed from the cart, totals are recalculated, and the header badge decrements
4. **Given** a customer adds the same product with the same variant that already exists in the cart **When** the API call is made, **Then** the quantity is incremented rather than creating a duplicate entry
5. **Given** a stock-keeping API call fails during quantity update **When** the error occurs, **Then** the quantity reverts to its previous value and an error toast is shown

---

### User Story 3 — Apply Coupons (Priority: P2)

A customer applies a discount code to their cart.

**Why this priority**: Coupons encourage purchase completion and reward customer loyalty.

**Independent Test**: Log in, add items to the cart, enter a valid coupon code, and verify the discount is reflected in the order summary. Remove the coupon and verify the discount disappears.

**Acceptance Scenarios**:

1. **Given** a customer has items in their cart **When** they enter a valid coupon code and click "Apply", **Then** the discount is applied, the coupon is shown as a removable chip, and the order summary updates
2. **Given** a customer has applied a coupon **When** they click the remove button on the coupon chip, **Then** the coupon is removed and the discount is reset to zero
3. **Given** a customer enters an invalid or expired coupon code **When** they click "Apply", **Then** an error toast is shown and no discount is applied
4. **Given** a customer is authenticated **When** they click "Proceed to Checkout", **Then** they are redirected to `/checkout`

---

## Clarifications

None required — all details are specified in the frontend spec and Postman API contracts.

## Edge Cases

- What happens when a product's current price differs from the price at which it was added to the cart? → A "price changed" warning badge is shown on that item with the current price displayed
- What happens when the customer tries to add more of an item than is in stock? → The API returns a stock validation error; the frontend disables the "+" button at max stock
- What happens when an item in the cart is later deactivated or deleted? → The item remains visible with a "Product unavailable" notice, but the quantity stepper is disabled
- What happens when the cart fetch fails on page load? → Show error toast; previously cached state from Zustand persist is used as fallback
- What happens when the coupon endpoint is called without a code? → The "Apply" button is disabled when the input is empty

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display all cart items with product thumbnail, name, variant label, unit price, quantity stepper, line total, and remove button
- **FR-002**: System MUST show a price change warning badge on items where `current_price !== unit_price`
- **FR-003**: System MUST display an order summary section showing: subtotal, discount (if coupon applied), shipping label ("Calculated at checkout"), and total
- **FR-004**: System MUST display an empty cart state with illustration and "Continue Shopping" button when the cart has no items
- **FR-005**: System MUST support "Add to Cart" from the product detail page with product ID, optional variant ID, and quantity
- **FR-006**: System MUST validate quantity against available stock and disable the "+" button when at maximum
- **FR-007**: System MUST update the header cart badge reactively when items are added or removed
- **FR-008**: System MUST provide a coupon input with "Apply" button and show the applied coupon as a removable chip
- **FR-009**: System MUST recalculate totals when items are added, removed, or updated, or when a coupon is applied or removed
- **FR-010**: System MUST show a loading skeleton while the cart is being fetched
- **FR-011**: System MUST persist cart state across page refreshes using Zustand persist middleware
- **FR-012**: System MUST show a "Proceed to Checkout" button that redirects to `/checkout` (requires authentication)
- **FR-013**: System MUST show error toasts on API failures and revert any optimistic UI changes

### Key Entities *(include if feature involves data)*

- **CartItem**: A product line item in the cart. Contains `id`, `product_id`, `product_name`, `product_slug`, `variant_id` (nullable), `variant_label` (nullable), `qty`, `unit_price`, `total_price`, `current_price`, `price_changed` (boolean).
- **CartCoupon**: An applied coupon. Contains `id`, `code`, `discount_type` ("percentage" or "fixed"), `discount_value`.
- **Cart**: The full cart object. Contains `id`, `subtotal`, `discount`, `total`, `coupon` (nullable CartCoupon), `items` (CartItem[]), `version` (number for optimistic concurrency).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Customers can view their complete cart within 2 seconds of opening the cart view
- **SC-002**: Adding an item to the cart reflects in the header badge within 500ms of the action
- **SC-003**: Quantity changes update line totals and cart total within 500ms of the action
- **SC-004**: Coupon application or removal updates the order summary within 1 second
- **SC-005**: Empty cart state displays correct messaging and navigation 100% of the time

## Assumptions

- All cart operations require authentication (guest cart is not supported)
- The backend cart API handles stock validation and returns errors when stock is insufficient
- The header cart badge count is derived from the Zustand cart store's `items` array length
- The "Proceed to Checkout" button requires authentication — unauthenticated users are redirected to `/login?next=/checkout`
- The cart version field is tracked but not used for conflict resolution on the frontend (server always wins)
- Cart data is fetched on mount via `GET /api/cart` and merged with persisted Zustand state
- The existing `cartStore` in `src/lib/stores/cart.store.ts` will be replaced with a full-featured store including items, coupon, and totals
