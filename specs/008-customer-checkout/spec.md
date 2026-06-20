# Feature Specification: Customer Checkout

**Feature Branch**: `008-customer-checkout`

**Created**: 2026-06-20

**Status**: Draft

**Input**: Phase 8 from frontend-spec.md — Multi-step checkout: address selection, order review, payment, and order confirmation.

---

## Clarifications

### Session 2026-06-20

- Q: How many steps on `/checkout` vs separate confirmation page? → A: 2 steps on `/checkout` (address → review+pay) + separate confirmation page at `/orders/:id/confirmation`
- Q: Can user navigate back from review step to address step? → A: Yes, a back button on the review step returns to address step with the previously selected address preserved
- Q: How does the user provide proof screenshot? → A: File upload input that immediately uploads to `POST /api/upload` on selection, stores returned URL in form state, then submits with proof
- Q: Should the review step include a notes field? → A: Yes, an optional notes textarea on the review step, passed as `notes` in the order payload
- Q: What loading state during Place Order? → A: Spinner on the button (disabled + spinner), consistent with existing patterns
- Q: What accessibility requirements should the multi-step checkout flow support? → A: All standard accessibility features: focus management on step change, ARIA live regions for error/success toasts, keyboard-accessible radio group, and step announcements via aria-live polite
- Q: What are the accepted file formats and maximum file size for payment proof screenshots? → A: Images only (jpg, png), max 5MB
- Q: What phone number format should the address form validate for? → A: Egyptian mobile format — `01` followed by 9 digits (11 total)

---

### Out of Scope

- Guest checkout (all checkout operations require authentication)
- Saved payment methods / wallet
- Multi-vendor checkout (single-vendor marketplace)
- Shipping method selection (single cheapest rate per zone)
- Re-ordering from past orders
- Payment gateway integration (manual proof submission only)

---

## User Scenarios & Testing

### User Story 1 — Select or Add Delivery Address (Priority: P1)

A customer selects a saved address or adds a new one during checkout.

**Why this priority**: An address is required to calculate shipping and place the order — without it the flow cannot proceed.

**Independent Test**: Log in, navigate to `/checkout`, verify saved addresses are listed. Select one and proceed. Then go back and add a new address inline, select it, and proceed.

**Acceptance Scenarios**:

1. **Given** a customer has saved addresses **When** they land on checkout **Then** saved addresses are shown with radio selection, default address pre-selected
2. **Given** a customer has no saved addresses **When** they land on checkout **Then** an inline address form is shown and "Continue" is disabled until the form is valid
3. **Given** a customer is on the address step **When** they click "Add New Address" **Then** an inline form appears with fields: full name, phone, street, city, zone (dropdown), label, building, apartment, landmark, notes
4. **Given** a customer fills in the address form **When** they submit it **Then** the address is saved via `POST /api/addresses`, selected, and the customer proceeds to the next step
5. **Given** a customer clicks "Continue" without selecting an address **When** no address is selected **Then** the button is disabled

---

### User Story 2 — Review Order and Select Payment (Priority: P1)

A customer reviews their cart items, shipping details, and selects a payment method before placing the order.

**Why this priority**: Reviewing the order is the final validation step before purchase commitment.

**Independent Test**: Proceed to step 2, verify cart items are listed with quantities and prices, shipping address is shown, shipping rate is displayed, total is calculated correctly, select a payment method, and place the order.

**Acceptance Scenarios**:

1. **Given** a customer has selected an address and is on the review step **When** the step loads **Then** cart items are displayed with name, variant (if any), qty, unit price, and line total
2. **Given** the review step loads **When** the selected address is present **Then** a shipping rate is fetched via `GET /api/shipping/rate?address_id=&order_total=` and displayed with charge and estimated delivery days
3. **Given** the shipping rate is fetched **When** `is_free` is true **Then** shipping is shown as "Free" instead of a charge
4. **Given** a customer reviews their order **When** they see the order summary **Then** subtotal, discount (if coupon applied), shipping charge, and total are all displayed
5. **Given** a customer is on the review step **When** they select a payment method **Then** the selected method is highlighted: Cash on Delivery, Instapay, or Vodafone Cash
6. **Given** a customer selects Instapay or Vodafone Cash **When** the payment method selector opens **Then** the receiving account info (Instapay handle or Vodafone Cash number) is displayed, fetched from `GET /api/payments/methods`
7. **Given** a customer clicks "Place Order" **When** the form is valid **Then** a `POST /api/orders` is made, the cart is cleared via `reset()`, and the customer is redirected to `/orders/:id/confirmation`
8. **Given** an order placement API call fails **When** the error occurs **Then** an error toast is shown and the customer remains on the review step
9. **Given** a customer is on the review step **When** they click "Back" **Then** they return to the address step with their previously selected address preserved
10. **Given** a customer is on the review step **When** they see the order summary **Then** an optional notes textarea is available for delivery instructions

---

### User Story 3 — Submit Payment Proof (Priority: P2)

A customer who chose Instapay or Vodafone Cash submits their payment proof on the confirmation page.

**Why this priority**: Manual payment methods require proof submission to complete the payment flow.

**Independent Test**: Place an order with Vodafone Cash, land on the confirmation page, submit a transaction reference and screenshot URL, and verify the success message.

**Acceptance Scenarios**:

1. **Given** a customer placed an order with Instapay or Vodafone Cash **When** they land on the confirmation page **Then** a proof submission form is shown with fields: transaction reference and file upload for screenshot
2. **Given** a customer submits payment proof **When** the form is valid **Then** a `POST /api/payments/submit-proof` is made with `{ order_id, proof_reference, proof_screenshot_url }`
3. **Given** payment proof is submitted successfully **When** the API returns success **Then** a success toast is shown and the form is replaced with a "Payment submitted — pending verification" message
4. **Given** a customer placed an order with Cash on Delivery **When** they land on the confirmation page **Then** the proof form is not shown — instead a message says "Pay on delivery"

---

### User Story 4 — Checkout Guard (Priority: P1)

An unauthenticated customer is redirected to login before accessing checkout.

**Why this priority**: All checkout operations require authentication; without the guard, API calls would fail.

**Independent Test**: Log out, navigate to `/checkout`, and verify redirect to `/login?next=/checkout`.

**Acceptance Scenarios**:

1. **Given** a customer is not logged in **When** they navigate to `/checkout` **Then** they are redirected to `/login?next=/checkout`
2. **Given** a customer is logged in **When** they navigate to `/checkout` **Then** the checkout page renders normally

---

### Edge Cases

- What happens when the customer's cart is empty? → Redirect to `/cart` with a message
- What happens when the selected address's shipping rate fails to load? → Show error state on the review step, disable "Place Order"
- What happens when a delivery zone has no active shipping rates? → Show "Shipping not available to this address" message
- What happens when the customer tries to place an order for a now out-of-stock item? → API returns error, cart is refreshed via `fetchCart()`, user is notified
- What happens on browser refresh during checkout? → Step resets to step 1 (address selection from saved state) — no critical data loss since order hasn't been placed
- What happens when `GET /api/payments/methods` fails? → Show error toast, but COD remains selectable (doesn't require receiving account info)
- What happens when the uploaded screenshot file is too large or wrong format? → Show client-side validation error before upload; accepted formats are jpg/png, max 5MB; show server error if upload fails
- What happens when the file upload (`POST /api/upload`) fails? → Show error toast, allow user to retry with same or different file

---

## Requirements

### Functional Requirements

- **FR-001**: System MUST show saved addresses with radio selection on the checkout address step, pre-selecting the default address
- **FR-002**: System MUST allow inline address creation via `POST /api/addresses` with fields: full_name, phone (11-digit Egyptian mobile, `01` prefix), street, city, zone_id, label (optional), building (optional), apartment (optional), landmark (optional), notes (optional)
- **FR-003**: System MUST fetch delivery zones from `GET /api/public/delivery-zones` for the zone dropdown in the address form
- **FR-004**: System MUST fetch shipping rate via `GET /api/shipping/rate?address_id=&order_total=` when an address is selected
- **FR-005**: System MUST display order review with: cart items summary, shipping address, shipping rate (charge + estimated days), order subtotal, discount, shipping total, and grand total
- **FR-006**: System MUST support payment method selection: `cash_on_delivery`, `instapay`, `vodafone_cash`
- **FR-007**: System MUST fetch receiving account info from `GET /api/payments/methods` when Instapay or Vodafone Cash is selected
- **FR-008**: System MUST place the order via `POST /api/orders` with `{ address_id, payment_method, notes? }`
- **FR-009**: System MUST call `cartStore.reset()` and redirect to `/orders/:id/confirmation` on successful order placement
- **FR-010**: System MUST redirect unauthenticated users to `/login?next=/checkout`
- **FR-011**: System MUST redirect to `/cart` if the cart is empty
- **FR-012**: System MUST show payment proof form (transaction reference + file upload for screenshot) on the confirmation page for Instapay/Vodafone Cash orders
- **FR-013**: System MUST upload screenshot to `POST /api/upload` on file selection, then submit payment proof via `POST /api/payments/submit-proof` with `{ order_id, proof_reference, proof_screenshot_url }` using the returned URL
- **FR-014**: System MUST show a loading skeleton during checkout data fetching
- **FR-015**: System MUST show error toasts on API failures and prevent proceeding to the next step
- **FR-016**: System MUST manage the checkout flow with 2 steps (address → review+pay) on the `/checkout` page via local `useState`, with order confirmation on a separate `/orders/:id/confirmation` page
- **FR-017**: System MUST show a spinner on the "Place Order" button and disable it during the order placement API call

### Key Entities

- **Address**: Customer's shipping address. Contains `id`, `full_name`, `phone`, `street`, `city`, `zone_id`, `label` (optional), `building`, `apartment`, `landmark`, `notes`, `is_default`.
- **DeliveryZone**: A shipping zone. Contains `id`, `name`, `regions` (string array).
- **ShippingRate**: Calculated rate for an address. Contains `zone_id`, `zone_name`, `rate_id`, `charge`, `estimated_days_min`, `estimated_days_max`, `is_free`.
- **Order**: A placed order. Contains `id`, `order_number`, `status`, `payment_method`, `payment_status`, `subtotal`, `discount`, `shipping_charge`, `total`, `coupon`, `shipping_address`, `notes`, `items`, `status_history`, `created_at`, `updated_at`.
- **PaymentMethodInfo**: Receiving account info for manual payments. Contains `instapay.handle` and `vodafone_cash.number`.

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: Customers can complete checkout in under 3 minutes from landing on `/checkout`
- **SC-002**: Address step loads saved addresses within 2 seconds
- **SC-003**: Shipping rate is calculated and displayed within 2 seconds of address selection
- **SC-004**: Order placement API call completes within 5 seconds
- **SC-005**: Payment proof submission completes within 3 seconds
- **SC-006**: Checkout flow is fully keyboard-navigable with focus management on step changes; step transitions and errors are announced to screen readers via ARIA live regions

## Assumptions

- All checkout operations require authentication (guest checkout not supported)
- The cart must have at least one item to access checkout
- The backend validates stock at order placement time and returns errors if stock is insufficient
- The delivery zone list is small and fetched once per checkout session
- The shipping rate endpoint accepts `order_total` as a query parameter
- Receiving account info (`GET /api/payments/methods`) is public and does not require auth
- Cash on Delivery does not require payment proof submission
- Orders with Instapay/Vodafone Cash require proof submission after placement (not before)
- The existing `cartStore.reset()` action clears the cart and is called after successful `POST /api/orders`
- The confirmation page receives the order ID via the URL path `/orders/:id/confirmation`
