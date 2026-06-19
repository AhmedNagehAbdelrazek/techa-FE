# Feature Specification: Product Detail Page

**Feature Branch**: `005-product-detail-page`

**Created**: 2026-06-19

**Status**: Draft

**Input**: User description: "Phase 5 — Product Detail Page: Full product page matching the Amazon-style layout with image gallery, variant selectors, add to cart, wishlist toggle, coupon validation, and reviews section."

### Out of Scope

- Image zoom/lightbox on the primary image
- Review writing, editing, or deletion (covered in Phase 6)
- Social share buttons
- Full cart page or slide-over cart panel (covered in Phase 7)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Product Details (Priority: P1)

A customer visits a product page to see full product information, browse images, and understand pricing before making a purchase decision.

**Why this priority**: This is the core function of the page — without it, no other interaction (add to cart, wishlist, etc.) is possible.

**Independent Test**: Can be fully tested by navigating to any product URL and verifying that all product information (name, brand, price, images, description, attributes) is displayed correctly.

**Acceptance Scenarios**:

1. **Given** a customer navigates to `/product/:slug`, **When** the page loads, **Then** the product name (h1), brand name, price (with discount if applicable), primary image, and stock status are all displayed
2. **Given** a product has a discount, **When** the product page loads, **Then** the discounted price is shown prominently alongside the original crossed-out price and a discount percentage badge
3. **Given** a product has multiple images, **When** the customer clicks a thumbnail, **Then** the primary image updates to the selected image
4. **Given** a product is out of stock, **When** the product page loads, **Then** "Out of Stock" is displayed and the "Add to Cart" button is disabled
5. **Given** a product has attributes in "details" and "specs" sections, **When** the customer scrolls to the product details area, **Then** attributes are displayed in two clearly labeled tables

---

### User Story 2 - Select Product Variant (Priority: P1)

A customer chooses a specific variant (e.g., color, size) and sees the corresponding price, stock, and images update in real time.

**Why this priority**: Variant selection directly affects what the customer can add to cart — without it, the add-to-cart flow is broken for multi-variant products.

**Independent Test**: Can be fully tested with a product that has at least two variants in different colors; selecting each variant updates the price, stock status, and images.

**Acceptance Scenarios**:

1. **Given** a product has color variants, **When** the customer clicks a color swatch, **Then** the displayed price, stock status, and images update to match the selected variant
2. **Given** a product has size variants, **When** the customer clicks a size pill button, **Then** the displayed price and stock status update to match the selected variant
3. **Given** a variant is out of stock, **When** displayed in the variant list, **Then** it is shown but visually disabled with a strikethrough and cannot be selected
4. **Given** a product has variants and no variant is selected, **When** the customer tries to add to cart, **Then** the button is disabled with the message "Please select options"

---

### User Story 3 - Add to Cart (Priority: P1)

A customer selects quantity and adds the product (or a specific variant) to their shopping cart.

**Why this priority**: Adding to cart is the primary conversion action on the product page.

**Independent Test**: Can be fully tested by selecting a quantity (default 1) and clicking "Add to Cart", then verifying the cart count updates and a success toast appears.

**Acceptance Scenarios**:

1. **Given** a customer is on a product page with a single-variant or no-variant product, **When** they click "Add to Cart", **Then** the item is added to the cart with default quantity 1, the button briefly shows "Added!", and a toast notification confirms success
2. **Given** a customer has selected a specific variant, **When** they click "Add to Cart", **Then** the correct variant is added to the cart
3. **Given** a customer wants more than one unit, **When** they adjust the quantity selector (up to 10 or stock quantity, whichever is lower), **Then** the quantity reflects their selection before adding to cart
4. **Given** a product is out of stock, **When** the page loads, **Then** the "Add to Cart" button is disabled

---

### User Story 4 - Toggle Wishlist (Priority: P2)

An authenticated customer adds or removes the product from their wishlist for future reference.

**Why this priority**: Wishlist enhances the shopping experience but is not required for purchase.

**Independent Test**: Can be fully tested by clicking the heart icon (when authenticated) and verifying the item appears in the wishlist; clicking again removes it.

**Acceptance Scenarios**:

1. **Given** an authenticated customer is on a product page and the product is not in their wishlist, **When** they click the heart icon, **Then** the product is added to the wishlist and the icon fills
2. **Given** an authenticated customer is on a product page and the product is already in their wishlist, **When** they click the heart icon, **Then** the product is removed and the icon becomes an outline
3. **Given** a customer is not authenticated, **When** they click the heart icon, **Then** they are redirected to the login page

---

### User Story 5 - Apply Coupon (Priority: P2)

A customer enters a discount code to see potential savings on the product.

**Why this priority**: Coupon validation adds value for customers with discount codes but is secondary to the core purchase flow.

**Independent Test**: Can be tested by entering a valid coupon code and verifying the discount amount and expiry are shown.

**Acceptance Scenarios**:

1. **Given** a customer enters a valid coupon code, **When** they click "Apply", **Then** the computed discount amount and coupon expiry are displayed
2. **Given** a customer enters an invalid or expired coupon code, **When** they click "Apply", **Then** a clear error message is shown
3. **Given** a coupon has already been applied, **When** the customer can remove it, **Then** the discount is cleared

---

### User Story 6 - View Product Reviews (Priority: P2)

A customer reads reviews and sees the overall rating distribution before deciding to purchase.

**Why this priority**: Reviews influence purchase decisions but are supplementary to the core product display.

**Independent Test**: Can be tested by navigating to a product with at least one review and verifying the rating summary, distribution bar chart, and individual review cards are displayed.

**Acceptance Scenarios**:

1. **Given** a product has reviews, **When** the product page loads, **Then** the average rating with star display, rating count, and individual review cards are shown
2. **Given** a product has no reviews, **When** the product page loads, **Then** a "No reviews yet" message is displayed
3. **Given** a review was left by a verified purchaser, **When** displayed, **Then** it shows a "Verified Purchase" badge

---

### Clarifications

### Session 2026-06-19

- Q: When stock changes between page load and "Add to Cart" click, what should the UI do? → A: Show a specific "Sorry, this item just went out of stock" message, disable the "Add to Cart" button, and update the stock status indicator in place.
- Q: What should be explicitly out of scope for Phase 5? → A: Image zoom/lightbox, review writing/editing, and social share buttons are all out of scope.
- Q: What level of accessibility conformance is expected? → A: WCAG 2.1 Level AA (keyboard navigation, screen reader announcements for dynamic variant/image changes, focus management, color contrast).
- Q: How should add-to-cart success be communicated? → A: Both a toast notification and an inline button animation ("Added!" text replacing the button label briefly).

## Edge Cases

- What happens when a product slug does not exist? → Show a 404 page
- What happens when the product has zero variants? → Hide the variant selector section entirely and show controls for the base product
- What happens when stock is low (≤3)? → Show "Only X left" warning in addition to "In Stock"
- What happens when an image fails to load? → Show a placeholder/fallback image
- What happens when the API returns an error? → Show an error state with a retry button
- What happens when a customer applies a coupon, then changes the variant? → Clear the coupon and re-validate (or keep the coupon and re-validate with the new variant price)
- What happens when stock sells out between page load and "Add to Cart" click? → Show "Sorry, this item just went out of stock", disable the button, and update stock status in place
- What happens when quantity is set above available stock? → Cap the quantity selector at `min(10, stock_qty)`

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display the product name as an h1 heading at the top of the product info section
- **FR-002**: System MUST display the brand name as a clickable link that navigates to the brand-filtered product listing
- **FR-003**: System MUST display the average rating as star icons (filled/half/empty) alongside the numeric rating and total review count
- **FR-004**: System MUST display the current price prominently; if a discount exists, show the original price crossed out and a discount percentage badge
- **FR-005**: System MUST render a thumbnail strip for all product images; clicking a thumbnail updates the primary image
- **FR-006**: System MUST group variant options by option type (e.g., "Color", "Size") with distinct visual treatment for color-type options versus text-based options
- **FR-007**: System MUST disable out-of-stock variants visually with a strikethrough and prevent selection
- **FR-008**: System MUST display stock status as "In Stock", "Only X left" (when ≤3), or "Out of Stock"
- **FR-009**: System MUST provide a quantity selector with range 1 to `min(10, stock_qty)`
- **FR-010**: System MUST disable the "Add to Cart" button when the product is out of stock or when variants exist but none is selected
- **FR-011**: System MUST show "Please select options" on the "Add to Cart" button when variants exist and none is selected
- **FR-012**: System MUST provide a wishlist toggle button; clicking when authenticated adds/removes the product from the wishlist; clicking when unauthenticated redirects to login
- **FR-013**: System MUST provide a coupon code input with an "Apply" button; on success, show the discount amount and expiry; on failure, show an error message
- **FR-014**: System MUST display "About this item" bullet points from the product's about_points
- **FR-015**: System MUST display a "Product Details" table for attributes with section "details"
- **FR-016**: System MUST display a "Product Information" table for attributes with section "specs"
- **FR-017**: System MUST display a rating distribution bar chart (count of each star level: 5★, 4★, etc.)
- **FR-018**: System MUST display individual review cards showing: rating stars, reviewer name, relative date, comment body, and "Verified Purchase" badge when applicable
- **FR-019**: System MUST support Open Graph meta tags (`og:title`, `og:description`, `og:image`) for social sharing
- **FR-020**: System MUST show a loading skeleton while product data is being fetched
- **FR-021**: System MUST show a 404 page when a product slug does not match any product
- **FR-022**: System MUST update the primary image when a variant with variant-specific images is selected
- **FR-023**: System MUST re-validate an applied coupon when the selected variant changes (or clear it if re-validation fails)
- **FR-024**: System MUST conform to WCAG 2.1 Level AA: all interactive elements keyboard-navigable, variant/image changes announced to screen readers via aria-live regions, focus managed on image swap, and color contrast ratios met

### Key Entities *(include if feature involves data)*

- **Product**: Represents a sellable item with name, slug, description, base price, discount, rating, category, brand, and status. Contains related images, variants, attributes, tags, and reviews.
- **ProductVariant**: A specific version of a product defined by option key-value pairs (e.g., Color: Red, Size: XL). Has its own price, discount, stock quantity, and optionally its own images.
- **ProductImage**: An image associated with a product (or variant), with a URL, alt text, primary flag, and sort order.
- **ProductAttribute**: A key-value pair grouped by section ("details" or "specs") providing additional product information.
- **Review**: A customer's rating and comment on a product, marked with verified purchase status.
- **Coupon**: A discount code that can be applied to a product, with type (percentage/fixed), value, expiry, and usage limits.
- **Wishlist**: A customer's saved products collection linking users to products or specific variants.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Customers can view complete product details (name, brand, price, images, attributes) within 2 seconds of page load
- **SC-002**: Variant selection updates the displayed price, stock, and images instantly without requiring a full page reload
- **SC-003**: 95% of product pages render without JavaScript errors across desktop, tablet, and mobile viewports
- **SC-004**: Customers can successfully add a product to cart in 3 clicks or fewer from page load
- **SC-005**: The product page loads and becomes interactive within 3 seconds on a standard broadband connection for a product with 5+ images
- **SC-006**: Open Graph meta tags are present on every product page and correctly reflect the product's title, description, and primary image

## Assumptions

- Product data (including variants, images, attributes, and reviews) is fetched from the backend via a single `GET /api/products/:slug` endpoint with eager-loaded relationships
- The backend provides `rating_avg` and `rating_count` as part of the product response
- The backend supports separate paginated review fetching via `GET /api/products/:id/reviews`
- Variant-specific images are included in the variant object and swap when the variant is selected
- Color variants use hex or CSS color values that can be rendered as swatch buttons
- The coupon validation endpoint `POST /api/coupons/validate` accepts a product_id (or variant_id) and returns discount amount, type, and expiry
- The wishlist endpoints (`POST /api/wishlist`, `DELETE /api/wishlist/:id`) require authentication
- No real-time stock updates are needed — stock is fetched once on page load
- Product detail content is fetched and rendered on the server so that the page is immediately visible with full SEO metadata; interactive elements (variant selection, quantity, add to cart, wishlist, coupon) update on the client without a full page reload
