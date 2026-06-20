# Research: Customer Checkout

## Decisions

### Checkout Page: 2-Step Single Page + Separate Confirmation

**Decision**: The checkout flow uses 2 steps on a single `/checkout` page: Step 1 (address selection/inline create) and Step 2 (review + payment + place order). A separate `/orders/:id/confirmation` page handles post-order success and payment proof submission.

**Rationale**:
- Clarified during spec review: 2 steps on `/checkout` + separate confirmation page at `/orders/:id/confirmation`
- Single page avoids routing complexity and preserves state between steps via `useState`
- Separate confirmation page allows deep-linking to a specific order
- No Zustand for checkout step state — local `useState` only, matching the pattern of form wizards

**Alternatives considered**:
- Multi-page checkout (each step a separate route): More complex state management, harder to navigate back-and-forth
- Single-page with Zustand store: Unnecessary complexity for transient checkout state that doesn't need persistence

### State Management: Local useState Only

**Decision**: All checkout form state (selected address, step number, payment method, notes) is managed via local `useState` in the page component. No Zustand store, no React Query, no form library.

**Rationale**:
- Checkout state is transient — it doesn't need to persist across page refreshes (refreshing resets to step 1 is acceptable per spec)
- Plain controlled inputs avoid adding `react-hook-form` or `zod` dependencies
- Cart store (`cartStore`) is only used for `reset()` after successful order placement
- Simplifies the component tree and data flow

**Alternatives considered**:
- Zustand store for checkout steps: Extra boilerplate for ephemeral state, violates YAGNI
- react-hook-form + zod: Already used in `product-detail1.tsx`, but the spec explicitly says plain controlled inputs

### Address Management: Saved + Inline Create

**Decision**: The address step shows saved addresses as radio options (with default pre-selected). If no addresses exist, an inline creation form is shown. A click-to-add-new button shows the inline form alongside saved addresses.

**Rationale**:
- Graceful handling of both returning customers (saved addresses) and new customers (no addresses)
- Inline form avoids redirecting away from checkout
- Address creation via `POST /api/addresses` saves the address server-side and selects it immediately

**Alternatives considered**:
- Modal/dialog for address creation: More complex, less integrated UX
- Separate address management page: Requires round-trip navigation, disruptive to checkout flow

### Shipping Rate: On-Demand Fetch

**Decision**: Shipping rate is fetched via `GET /api/shipping/rate?address_id=&order_total=` when an address is selected (on step transition to review). The result shows charge (or "Free" if `is_free`) and estimated delivery days.

**Rationale**:
- Rate depends on selected address, so fetches naturally after address selection
- Loading/error states shown in the review step
- Edge case: rate fetch failure shows error state and disables "Place Order"

**Alternatives considered**:
- Pre-fetch all rates on checkout load: Unnecessary, wastes bandwidth, rates depend on specific address

### Payment Methods: Fetch Receiving Info on Demand

**Decision**: Payment methods (COD, Instapay, Vodafone Cash) are fetched from `GET /api/payments/methods`. When a manual method (Instapay/Vodafone Cash) is selected, the receiving account info (handle/number) is displayed from the fetched data. COD remains selectable even if the payments endpoint fails.

**Rationale**:
- Receiving account info is public and needed only when the user selects that method
- COD as fallback ensures checkout isn't blocked by a non-critical API failure
- Matches edge case spec: "COD remains selectable (doesn't require receiving account info)"

### File Upload: Immediate Upload on Selection

**Decision**: When the user selects a screenshot file on the confirmation page, it uploads immediately to `POST /api/upload`. The returned URL is stored in local state. On form submit, the URL is sent with `POST /api/payments/submit-proof`.

**Rationale**:
- Avoids submitting a large file as part of the payment proof payload
- Immediate upload provides early failure feedback (wrong format, too large)
- Matches existing file upload patterns in the app

### Auth Guard: ProtectedRoute Wrapper

**Decision**: The `/checkout` page uses the existing `<ProtectedRoute>` component (used in `src/app/(store)/account/page.tsx`) to redirect unauthenticated users to `/login?next=/checkout`.

**Rationale**:
- Reuses existing auth guard pattern
- Consistent with how other protected pages work
- Spec FR-010 explicitly requires this redirect

**Alternatives considered**:
- Middleware-level auth check: Auth middleware isn't implemented yet (constitution notes bare middleware)
- Inline auth check: Duplicates existing pattern

### Empty Cart Guard

**Decision**: The checkout page checks `cartStore.items.length` on mount. If the cart is empty, it redirects to `/cart` with a toast message.

**Rationale**:
- Cart state is available from the persisted Zustand store
- Prevents users from going through checkout with nothing to order

### API Client: Request.ts (Existing)

**Decision**: All new API wrappers (`addresses.ts`, `shipping.ts`, `orders.ts`, `payments.ts`) use the existing `Request.ts` class-based client.

**Rationale**:
- Consistent with all other API wrappers (cart, reviews, product, categories)
- Handles auth token injection and refresh queue automatically
- `withCredentials: true` for cookie-based auth

### No Dependency Additions

**Decision**: All required dependencies are already in `package.json`. Zero new dependencies needed.

**Rationale**:
- Zustand: installed (used for cart store only)
- sonner: installed
- lucide-react: installed
- shadcn/ui components: Button, Input, RadioGroup, Card, Skeleton, Separator, Badge, Label, Textarea all exist
- No form library needed (plain controlled inputs)
