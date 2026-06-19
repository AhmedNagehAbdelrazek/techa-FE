# Feature Specification: Storefront Homepage

**Feature Branch**: `003-storefront-homepage`

**Created**: 2026-06-19

**Status**: Draft

**Input**: User description: "start phase 3 from the file frontend-spec.md and use the endpoint refrence from Techa Auth API.postman_collection.json"

## User Scenarios & Testing

### User Story 1 - Browse Homepage and Discover Products (Priority: P1)

A first-time visitor lands on the homepage and sees hero banners, featured products, categories, and new arrivals. They can click any product or category to explore further.

**Why this priority**: The homepage is the primary entry point for all users. Every other flow depends on users discovering products and categories from here.

**Independent Test**: Can be fully tested by visiting the root URL and verifying that all content sections load with live data, hero banners auto-play, and all clickable elements navigate correctly.

**Acceptance Scenarios**:

1. **Given** the user visits the homepage, **When** the page loads, **Then** they see a hero banner carousel at the top cycling through active banners positioned as "hero"
2. **Given** there are active hero banners, **When** the carousel plays, **Then** each banner shows its image, title, and clickable link
3. **Given** the homepage is fully loaded, **When** the user scrolls down, **Then** they see sections for featured products, top-level categories, a mid-page banner, and new arrivals in that order
4. **Given** there are fewer than 8 featured products, **When** the section renders, **Then** it shows only the available products without empty slots

---

### User Story 2 - Browse Featured Products (Priority: P1)

A shopper sees a "Featured Products" section and can view product details or navigate to the full product listing.

**Why this priority**: Featured products drive conversions and are a key merchandising surface.

**Independent Test**: Can be tested by verifying that up to 8 featured products are displayed with image, name, brand, rating, price (with discount formatting), and that clicking a product navigates to its detail page.

**Acceptance Scenarios**:

1. **Given** the featured products section is visible, **When** the user clicks a product card, **Then** they are navigated to `/product/:slug`
2. **Given** a product has a `discount_percent > 0`, **When** the product card renders, **Then** the discounted price is shown alongside the original price crossed out and a discount badge
3. **Given** a product has no discount, **When** the card renders, **Then** only the regular price is shown without any crossed-out price or badge
4. **Given** the featured products API returns an empty array, **When** the section renders, **Then** it shows an empty state message (e.g. "No featured products available")

---

### User Story 3 - Browse Categories (Priority: P2)

A shopper sees a grid of top-level categories and can click one to browse products in that category.

**Why this priority**: Category browsing is the second most common discovery path after search/featured.

**Independent Test**: Can be tested by verifying that top-level categories display with image and name, and that clicking a category navigates to `/category/:slug`.

**Acceptance Scenarios**:

1. **Given** the category grid section is visible, **When** the user clicks a category card, **Then** they are navigated to `/category/:slug`
2. **Given** a category has no image, **When** its card renders, **Then** a placeholder image or fallback icon is shown instead of a broken image

---

### User Story 4 - Browse New Arrivals (Priority: P2)

A shopper sees the newest products and can click to view details or navigate to the full sort-by-newest listing.

**Why this priority**: "New Arrivals" creates urgency and showcases recent inventory, driving repeat visits.

**Independent Test**: Can be tested by verifying that the newest 8 products are displayed sorted by most recent first.

**Acceptance Scenarios**:

1. **Given** the new arrivals section loads, **When** there are products available, **Then** the products are displayed in descending order of creation date (newest first)

---

### Edge Cases

- What happens when the banner API is unreachable or returns an error? The hero section shows a fallback placeholder or gracefully skips the carousel.
- How does the page handle partial API failures (e.g., banners fail but products load)? Each section independently handles its own loading/error state — one failure does not block the entire page.
- What happens if category images fail to load? A placeholder or fallback icon appears, and the clickable link still works.
- How does the carousel behave with zero enabled banners? The hero section is hidden entirely rather than showing an empty carousel.
- What happens when all API calls fail? The page shows a generic error state with a "Retry" button or message.

## Requirements

### Functional Requirements

- **FR-001**: Homepage MUST display a hero banner carousel auto-playing through active banners fetched from the banners API filtered by `position=hero`
- **FR-002**: The hero carousel MUST support manual navigation (previous/next controls and dot indicators)
- **FR-003**: Each hero banner MUST display its image, title, and be clickable linking to the banner's `link_url`
- **FR-004**: The homepage MUST show a "Featured Products" section displaying up to 8 products fetched with the `is_featured=true` filter
- **FR-005**: Product cards MUST display the primary product image, product name, brand name, rating stars, and price
- **FR-006**: When a product has a non-zero discount, its card MUST show the discounted price prominently, the original price crossed out, and a visible discount percentage badge
- **FR-007**: The homepage MUST show a grid of top-level categories (parent categories with no parent) fetched from the category tree API
- **FR-008**: Category cards MUST display the category image (or a fallback placeholder) and category name, linking to `/category/:slug`
- **FR-009**: The homepage MUST display a mid-page banner section showing active banners with `position=mid_page`
- **FR-010**: A "New Arrivals" section MUST display up to 8 products sorted newest first
- **FR-011**: Each product card in the new arrivals section MUST include an "Add to Wishlist" toggle button
- **FR-012**: Each section header MUST include a title and a "View All" link that navigates to the relevant full listing page
- **FR-013**: All images on the homepage MUST use lazy loading except hero carousel images which MUST use priority loading (`loading="eager"` or `priority` attribute)
- **FR-014**: Every data-fetching section MUST display a skeleton loader while data is loading
- **FR-015**: Each section MUST handle its own error state independently without blocking other sections
- **FR-016**: The homepage MUST gracefully handle empty states (no banners, no products, no categories) with appropriate messages rather than showing empty sections
- **FR-017**: Rating stars MUST be displayed using custom filled/half/empty star icons — no third-party rating library

### Key Entities

- **Banner**: A promotional image displayed in the carousel or mid-page sections. Has: title, description, image_url, link_url, position (hero/mid_page), sort_order, start/end dates.
- **Product**: A purchasable item. Has: primary image, name, brand name, rating (average and count), base price, discount percent, slug, and variant information.
- **Category**: A product grouping in a tree hierarchy. Has: name, slug, image_url, parent_id, sort_order. Top-level categories have parent_id = null.
- **Settings**: Public site settings including site_name, logo_url, and currency code — used by the homepage's parent layout.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can see a fully populated homepage with live data within 3 seconds on a standard broadband connection
- **SC-002**: All five content sections (hero, featured, categories, mid-banner, new arrivals) render correctly without any section showing an error state when the backend APIs are healthy
- **SC-003**: Clicking any product card navigates to the correct product detail page at `/product/:slug`
- **SC-004**: Clicking any category card navigates to the correct category page at `/category/:slug`
- **SC-005**: The hero carousel auto-advances through slides and responds to manual navigation controls
- **SC-006**: All sections gracefully degrade — if one API fails, the remaining four sections still render normally

## Assumptions

- The backend `/api/products` endpoint supports the `is_featured` query parameter filter
- The backend `/api/products` endpoint supports sorting via `sort=newest`
- The category tree API (`/api/categories/tree`) returns enough data to extract top-level categories (parent_id = null) along with their images
- embla-carousel-react is available (provided via shadcn/ui's `carousel` component dependency)
- Skeleton components from shadcn/ui are available for loading states
- Hero banners have at minimum: image_url, title, link_url. If a banner lacks a link_url, the banner is displayed non-clickable.
- The homepage is the root route `/` under the `(store)` route group and uses the storefront layout from Phase 2
- All data fetching happens server-side (Next.js Server Components) for SEO
