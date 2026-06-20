# Feature Specification: Customer Wishlist

**Feature Branch**: `010-customer-wishlist`

**Created**: 2026-06-20

**Status**: Draft

**Input**: Phase 10 from frontend-spec.md

## Clarifications

No outstanding clarifications — wishlist behavior is well-defined in the frontend spec.

---

## User Scenarios & Testing

### User Story 1 - View and Manage Wishlist (Priority: P1)

Customers can view all their saved products on a dedicated wishlist page, remove items they no longer want, and add items to their cart directly from the wishlist.

**Why this priority**: The wishlist page is the primary way customers interact with their saved products. Without it, the wishlist heart button on product cards provides no destination for review or management.

**Independent Test**: A logged-in customer with saved products can visit `/wishlist`, see all their wishlist items displayed as product cards, remove one item, and add another to the cart.

**Acceptance Scenarios**:

1. **Given** a customer has items in their wishlist, **When** they visit `/wishlist`, **Then** they see a grid of product cards, each showing the product image, name, price, and a "Remove from Wishlist" button.
2. **Given** a customer views a wishlist item, **When** they click "Add to Cart", **Then** the product (or selected variant) is added to the cart and a success message is shown.
3. **Given** a customer wants to remove an item, **When** they click the remove button, **Then** the item is removed from the wishlist optimistically (the card disappears immediately), and the header wishlist badge count updates.
4. **Given** a customer has no wishlist items, **When** they visit `/wishlist`, **Then** they see an empty state message with a "Start Shopping" link to the homepage.

---

### User Story 2 - Toggle Wishlist from Product Card (Priority: P1)

Customers can add or remove products from their wishlist directly from product cards across the storefront without navigating to a separate page.

**Why this priority**: This provides the primary mechanism for building a wishlist. The dedicated page (US1) is useless if customers can't add items.

**Independent Test**: An unauthenticated customer clicks the heart icon on a product card and is redirected to login. An authenticated customer clicks the heart icon and sees it toggle immediately.

**Acceptance Scenarios**:

1. **Given** an unauthenticated customer clicks the wishlist heart icon on a product card or product detail page, **When** the icon is clicked, **Then** they are redirected to the login page with a `next` query parameter pointing back to the current page.
2. **Given** an authenticated customer clicks an empty heart icon, **When** the API call succeeds, **Then** the icon fills immediately (optimistic UI) and the header badge count increments.
3. **Given** an authenticated customer clicks a filled heart icon, **When** they confirm removal, **Then** the icon empties immediately and the header badge count decrements.

---

### Edge Cases

- What happens when the wishlist API returns an error during add/remove? The UI reverts the optimistic change and shows an error toast.
- What happens when the customer's wishlist has many items? The page uses the same ProductCard grid as the product listing, which handles pagination upstream — products show in a responsive grid.
- What happens if a wishlist product is no longer active or is out of stock? The product card still renders but shows the out-of-stock state and disables "Add to Cart".
- What happens when an unauthenticated user navigates directly to `/wishlist`? The page redirects to `/login?next=/wishlist` via the existing ProtectedRoute component.

## Requirements

### Functional Requirements

- **FR-001**: Customers MUST be able to view all their saved wishlist items on a dedicated `/wishlist` page.
- **FR-002**: The wishlist page MUST display products as a grid of ProductCard components, each showing product image, name, price, and a remove button.
- **FR-003**: Customers MUST be able to remove an item from the wishlist from the wishlist page, with the item disappearing immediately (optimistic UI).
- **FR-004**: Customers MUST be able to add a wishlist item to their cart directly from the wishlist page.
- **FR-005**: The wishlist page MUST show a meaningful empty state with a call to action when the customer has no saved items.
- **FR-006**: The wishlist page MUST redirect unauthenticated users to the login page via the existing ProtectedRoute pattern.
- **FR-007**: The wishlist heart icon on ProductCard and ProductDetailClient MUST show a filled state when the product is in the wishlist and an outline when it is not.
- **FR-008**: Toggling the wishlist from a product card MUST use optimistic UI — update the icon immediately and roll back on API failure.
- **FR-009**: Unauthenticated customers clicking the wishlist heart MUST be redirected to `/login?next=<current_path>`.
- **FR-010**: The header MUST display a wishlist icon with a count badge showing the number of saved items.
- **FR-011**: The header wishlist badge count MUST update reactively when items are added or removed.

### Key Entities

- **WishlistItem**: Represents a saved product in a customer's wishlist. Contains a reference to the product (with optional variant), the user who saved it, and timestamps.
- **Product**: An existing entity in the system. Wishlist items link to products by product_id. Product images, names, and prices are displayed from the Product relationship.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Customers can navigate from any product card to their full wishlist in 1 click (heart icon → /wishlist).
- **SC-002**: Customers can remove an item from their wishlist in under 5 seconds from landing on the page.
- **SC-003**: The wishlist page loads and displays products within 2 seconds on a standard connection.
- **SC-004**: The wishlist heart icon toggle responds visually in under 100ms (optimistic UI before API responds).

## Assumptions

- The `/wishlist` page uses the existing ProductCard component for displaying wishlist items.
- The wishlist API returns product data (name, price, image) nested within each wishlist item response so the page can render without additional API calls.
- The existing ProtectedRoute pattern from Phase 1 handles authentication gating.
- The existing Zustand wishlist store tracks `itemCount` and persists it to localStorage.
- The existing WishlistButton component handles the optimistic toggle, auth guard, and API calls for individual products.
- The wishlist is customer-specific — each customer sees only their own wishlist items.
- Wishlist items are identified by `id` (the wishlist entry ID, not the product ID) for removal operations.
