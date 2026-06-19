# Feature Specification: Product Listing & Search

**Feature Branch**: `004-product-listing-search`

**Created**: 2026-06-19

**Status**: Draft

**Input**: User description: "start phase 4 from the file frontend-spec.md and use the endpoint refrence from Techa Auth API.postman_collection.json"

## Clarifications

### Session 2026-06-19

- Q: The search URL parameter — spec used `?q=` but the Postman collection shows the backend expects `?search=`. Which should the frontend use? → A: Use `?search=` to match the backend API parameter.
- Q: How does the frontend resolve `/category/:slug` to a category ID for the products API? There is no documented slug-based lookup endpoint. → A: Fetch the full category tree server-side on the category page, resolve the slug to a category ID in memory, then pass `category_id` to the products API.
- Q: The brand filter is specified as multi-select but the Postman API shows `brand_id` as a single value. How should multiple brands be passed? → A: Use comma-separated brand IDs in the `brand_id` parameter (e.g., `?brand_id=1,2,3`).
- Q: The stock and rating filters (`in_stock`, `min_rating`) are not present in the documented Postman API params. Are these supported? → A: Include the filters in the UI; if the backend returns an error for unsupported params, gracefully hide those filters and notify the user.

## User Scenarios & Testing

### User Story 1 — Browse Products by Category (Priority: P1)

A shopper navigates to a category page (e.g., `/category/electronics`) and sees a paginated grid of products in that category with the category name as the page title.

**Why this priority**: Category browsing is a primary product discovery path directly linked from the homepage category grid.

**Independent Test**: Visit a specific category URL with known products and verify that products are listed, pagination works, and the category name is displayed correctly.

**Acceptance Scenarios**:
1. **Given** the user visits `/category/:slug` for a category with products, **When** the page loads, **Then** products belonging to that category are displayed in a grid layout
2. **Given** a category has multiple pages of products, **When** the user clicks the next page, **Then** the next set of products loads and the URL updates to reflect the page number
3. **Given** a category has no products, **When** the page loads, **Then** a friendly empty state message is shown with a "Browse All Products" link

---

### User Story 2 — Search Products (Priority: P1)

A shopper types a query into the search bar, presses Enter, and is taken to `/search?search=query` showing relevant products matching their query.

**Why this priority**: Search is the most direct product discovery method and serves as the fallback for users who don't browse by category.

**Independent Test**: Type a known product name in the search bar and verify that the results page shows matching products with the search query highlighted in the page title.

**Acceptance Scenarios**:
1. **Given** the user searches for "phone", **When** the search results page loads, **Then** products matching "phone" are displayed
2. **Given** a search returns no results, **When** the results page renders, **Then** a "No products found" message is shown with a "Clear filters" button

---

### User Story 3 — Filter and Sort Products (Priority: P1)

A shopper on a category or search page applies filters and sorting to narrow down results to exactly what they want.

**Why this priority**: Filtering and sorting are critical for usability when browsing large product catalogs.

**Independent Test**: Apply each filter type individually and in combination, verifying that the product list updates, URL query params update, and the result count is accurate.

**Acceptance Scenarios**:
1. **Given** the user is on a listing page, **When** they select a brand filter, **Then** products are filtered to show only that brand and the URL updates with `?brand_id=...`
2. **Given** the user sets a price range, **When** they submit the min and max values, **Then** only products within that price range are shown and the URL reflects `?min_price=...&max_price=...`
3. **Given** the user selects a sort option "Price Low→High", **When** the sort is applied, **Then** products are re-ordered from lowest to highest price and the URL shows `?sort=price_asc`
4. **Given** the user toggles "In Stock Only", **When** the toggle is activated, **Then** only products with available stock are displayed and the URL includes `?in_stock=true`
5. **Given** the user sets a minimum rating of 4 stars, **When** the rating filter is applied, **Then** only products with average rating of 4 or higher are shown

---

### User Story 4 — Mobile Filtering (Priority: P2)

A shopper on a mobile device browses products and uses a slide-over sheet to apply filters.

**Why this priority**: Mobile users should have the same filtering capability without the sidebar taking up screen space.

**Independent Test**: On a 375px viewport, verify that no filter sidebar is visible and that a "Filters" button opens a slide-over sheet containing all filter options.

**Acceptance Scenarios**:
1. **Given** the user is on a mobile device, **When** the listing page loads, **Then** the filter sidebar is hidden and a "Filters" button is visible
2. **Given** the mobile user taps "Filters", **When** the sheet opens, **Then** all filter options (brand, price range, rating, in-stock) are available in the sheet
3. **Given** the mobile user applies filters in the sheet, **When** they close the sheet, **Then** the product list updates to reflect the applied filters

---

### Edge Cases

- What happens when the products API returns an error? The page shows a generic error state with a retry action rather than breaking the layout.
- What happens when the brands API fails? The brand filter checkboxes show a "Failed to load brands" message with a retry button.
- How does the page handle invalid URL query params (e.g., `?min_price=abc`)? Invalid numeric params are ignored and treated as not set.
- What happens when a user navigates to a non-existent category slug? The page shows a 404 or "Category not found" state.
- How does the page behave when all filters are applied but yield no results? The empty state shows a "Clear all filters" button to reset everything at once.
- What happens when the user applies conflicting filters (e.g., min_price > max_price)? The higher value takes precedence or both are treated as not set — whichever provides the most results.
- How does pagination behave when the total results change due to filtering? The page resets to page 1 whenever a filter changes.

## Requirements

### Functional Requirements

- **FR-001**: The category page at `/category/:slug` MUST resolve the slug to a category ID (via the category tree API), then fetch products filtered by that category ID, displaying the category name as the page title
- **FR-002**: The search results page at `/search?search=` MUST fetch products matching the search query, displaying "Search results for: [query]" as the page title
- **FR-003**: Both pages MUST share a common product listing component that supports the same filtering, sorting, and pagination interface
- **FR-004**: A filter sidebar MUST be present on desktop with all filter controls visible; on mobile, filters MUST be accessible via a slide-over sheet triggered by a "Filters" button
- **FR-005**: All filter values and the current page number MUST be reflected in the URL as query parameters — changing a filter MUST update the URL and reset to page 1
- **FR-006**: Filter state MUST NOT be stored in client-side global state — it MUST live entirely in the URL
- **FR-007**: Brand filter MUST display as multi-select checkboxes populated from the brands API; selected brands are passed to the API as comma-separated IDs in the `brand_id` parameter
- **FR-008**: Price range filter MUST provide min and max price inputs
- **FR-009**: Minimum rating filter MUST use a clickable star selector (1–5 stars)
- **FR-010**: An "In Stock Only" toggle filter MUST be provided as a switch or checkbox
- **FR-011**: A sort dropdown MUST provide the following options: Newest, Price Low→High, Price High→Low, Top Rated
- **FR-012**: Pagination MUST display numbered page controls at the bottom of the product list with previous/next navigation
- **FR-013**: Active filter chips MUST appear above the product list showing each applied filter with an individual remove button (X) to clear that single filter
- **FR-014**: A result count MUST be displayed above the product list showing "Showing 1–20 of 143 products" format
- **FR-015**: When no results match the current filters/search, a friendly empty state MUST be shown with a "Clear all filters" button
- **FR-016**: Each product card MUST link to `/product/:slug`
- **FR-017**: Every data-fetching operation MUST show a skeleton or spinner while loading — never a blank screen
- **FR-018**: All API errors MUST be caught and communicated to the user — section-specific failures must not break the entire page
- **FR-019**: On the search page, a category filter MUST be available (populated from the category tree) to narrow results by category

### Key Entities

- **Product**: A purchasable item with fields: id, name, slug, primary image, brand name, average rating, rating count, base price, discount percent, stock status, and category association.
- **Category**: A product grouping with fields: id, name, slug, parent_id, image_url, sort_order. Forms a tree structure for hierarchical filtering.
- **Brand**: A product manufacturer with fields: id, name, logo_url. Used as a multi-select filter option.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can browse products by category at `/category/:slug` and see results within 3 seconds on a standard connection
- **SC-002**: Users can search for products at `/search?search=` and see relevant results within 3 seconds
- **SC-003**: Applying any single filter updates the product list within 2 seconds and correctly reflects the selected filter criteria in the page URL
- **SC-004**: Combining multiple filters (brand + price range + rating + stock) correctly narrows results without errors
- **SC-005**: Pagination controls navigate through all available pages without errors or duplicate/empty pages
- **SC-006**: The empty state with no results shows the "Clear all filters" button, and clicking it resets all filters and returns results
- **SC-007**: All filter and sort controls are fully usable on a 375px-wide mobile screen via the filter sheet

## Assumptions

- The backend `GET /api/products` endpoint supports the following query parameters: `page`, `limit`, `search`, `category_id`, `brand_id`, `min_price`, `max_price`, `sort`. The `in_stock` and `min_rating` params may not be supported — if the API rejects them, those filters gracefully hide from the UI.
- The backend supports sorting values: `newest`, `price_asc`, `price_desc`, `top_rated`
- The brands API `GET /api/brands` returns all active brands as a flat list with `id`, `name`, `slug`
- The category tree API `GET /api/categories/tree` returns categories with `slug` in addition to `id`, `name`, and `parent_id`, allowing the frontend to resolve `:slug` to the correct `category_id`
- The product list API response includes pagination metadata (`total`, `page`, `limit`, `totalPages`)
- A slide-over panel component is available for the mobile filter overlay
- The listing pages use the existing storefront layout
- The search bar in the header submits to `/search?search=`
- The frontend uses URL query parameters for filter state management (no client-side global state)
