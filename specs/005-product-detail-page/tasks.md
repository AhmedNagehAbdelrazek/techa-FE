---

description: "Task list for Product Detail Page implementation"
---

# Tasks: Product Detail Page

**Input**: Design documents from `specs/005-product-detail-page/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not included — no explicit testing requirements in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/` at repository root
- Paths follow the plan.md structure: components in `src/components/store/`, API in `src/lib/api/`, types in `src/lib/types/`, stores in `src/lib/stores/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Type definitions and API client wrappers that all user stories depend on

- [ ] T001 [P] Create ProductDetail, ProductVariant, ProductImage, ProductAttribute, VariantOption types in `src/lib/types/product.ts`
- [ ] T002 [P] Create Review, ReviewListResponse, PaginationMeta, RatingDistribution types in `src/lib/types/review.ts`
- [ ] T003 [P] Create getProductBySlug(slug) API wrapper in `src/lib/api/products.ts`
- [ ] T004 [P] Create addToWishlist(productId), removeFromWishlist(wishlistId), getWishlist() API wrappers in `src/lib/api/wishlist.ts`
- [ ] T005 [P] Create validateCoupon(code, productId?) API wrapper in `src/lib/api/coupons.ts`
- [ ] T006 [P] Create getProductReviews(productId, page?) API wrapper in `src/lib/api/reviews.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: State management stores that multiple user story components depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T007 Create Zustand wishlist store (items[], count, isLoading, fetchWishlist, addItem, removeItem, isInWishlist) in `src/lib/stores/wishlist.store.ts`
- [ ] T008 Create minimal cart count Zustand store (count, increment) in `src/lib/stores/cart-count.store.ts` — placeholder for Phase 7

**Checkpoint**: Foundation ready — user story implementation can now begin in parallel

---

## Phase 3: User Story 1 — View Product Details (Priority: P1) 🎯 MVP

**Goal**: Display all static product information — brand, name, rating, price, images, attributes — fetched and rendered on the server

**Independent Test**: Navigate to any product URL and verify brand name (linked), product name (h1), star rating, price (with discount crossed-out if applicable), primary image, thumbnail strip, and attributes tables are all rendered

### Implementation for User Story 1

- [ ] T009 [P] [US1] Create ProductImages component (thumbnail strip + primary image with click-to-swap) in `src/components/store/ProductImages.tsx`
- [ ] T010 [P] [US1] Create ProductInfo component (brand link, product name h1, star rating, price with discount display) in `src/components/store/ProductInfo.tsx`
- [ ] T011 [P] [US1] Create StockStatus component ("In Stock", "Only X left", "Out of Stock") in `src/components/store/StockStatus.tsx`
- [ ] T012 [P] [US1] Create ProductAttributes component (Details + Specs tables from attributes data) in `src/components/store/ProductAttributes.tsx`

**Checkpoint**: User Story 1 complete — product data displays correctly for any valid product slug

---

## Phase 4: User Story 2 — Select Product Variant (Priority: P1)

**Goal**: Allow customers to select a product variant (color, size, etc.) and see corresponding price, stock, and images update in real time

**Independent Test**: On a multi-variant product, select each option and verify price, stock status, and primary image update to match the selected variant; out-of-stock variants are disabled

### Implementation for User Story 2

- [ ] T013 [P] [US2] Create VariantSelector component (grouped option buttons by option_name, color swatches for color types, disabled styles for OOS variants) in `src/components/store/VariantSelector.tsx`
- [ ] T014 [US2] Create QuantitySelector component (stepper 1..min(10, stock_qty)) in `src/components/store/QuantitySelector.tsx`
- [ ] T015 [US2] Update ProductImages to accept activeVariantId prop and swap images when a variant with variant-specific images is selected
- [ ] T016 [US2] Update ProductInfo to accept activeVariant prop and reflect variant price/discount when a variant is selected

**Checkpoint**: User Stories 1 AND 2 complete — selecting a variant updates all related displays

---

## Phase 5: User Story 3 — Add to Cart (Priority: P1)

**Goal**: Add the selected product/variant with chosen quantity to the shopping cart with visual feedback

**Independent Test**: Select a quantity and click "Add to Cart" — verify button shows "Added!" animation, toast confirms success, and cart count badge increments

### Implementation for User Story 3

- [ ] T017 [US3] Create AddToCartButton component (API call to POST /api/cart, "Added!" button animation, error handling for stock conflict, disabled when OOS or no variant selected) in `src/components/store/AddToCartButton.tsx`

**Checkpoint**: User Stories 1, 2, AND 3 complete — core purchase flow works end-to-end

---

## Phase 6: User Story 4 — Toggle Wishlist (Priority: P2)

**Goal**: Authenticated customers can add/remove the product from their wishlist; unauthenticated customers are redirected to login

**Independent Test**: Click the heart icon when authenticated — verify it fills and the product appears in the wishlist; click again to remove; when unauthenticated, verify redirect to login

### Implementation for User Story 4

- [ ] T018 [US4] Create WishlistButton component (heart toggle using wishlist store, optimistic UI, auth redirect) in `src/components/store/WishlistButton.tsx`

**Checkpoint**: User Stories 1–4 complete

---

## Phase 7: User Story 5 — Apply Coupon (Priority: P2)

**Goal**: Customers can enter a coupon code and see the computed discount amount and expiry; invalid codes show an error

**Independent Test**: Enter a valid coupon code and click "Apply" — verify discount amount and expiry are shown; enter an invalid code and verify error message appears

### Implementation for User Story 5

- [ ] T019 [P] [US5] Create CouponInput component (code input + Apply button, validation result display with discount/expiry or error, re-validate on variant change) in `src/components/store/CouponInput.tsx`

**Checkpoint**: User Stories 1–5 complete

---

## Phase 8: User Story 6 — View Product Reviews (Priority: P2)

**Goal**: Display product rating distribution and individual review cards; show "No reviews yet" when empty

**Independent Test**: On a product with reviews, verify rating distribution bar chart, star display, and review cards with "Verified Purchase" badges are shown; on product with no reviews, verify empty state message

### Implementation for User Story 6

- [ ] T020 [P] [US6] Create ReviewList component (rating distribution bar chart, star display with average, individual review cards with "Verified Purchase" badge, empty state, load more pagination) in `src/components/store/ReviewList.tsx`

**Checkpoint**: All user stories complete

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Page assembly, Open Graph metadata, and final verification

- [ ] T021 Create product `[slug]` page route in `src/app/(store)/product/[slug]/page.tsx` — Server Component that fetches product by slug, generates OG metadata via generateMetadata(), composes all child components, and passes product data as props
- [ ] T022 Verify build passes with `npm run build`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup phase — BLOCKS all user stories
- **User Stories (Phases 3–8)**: All depend on Foundational phase completion
  - US1 (Phase 3) must complete before US2 (Phase 4) because US2 modifies US1 components
  - US2 (Phase 4) must complete before US3 (Phase 5) because AddToCartButton needs variant state
  - US4, US5, US6 are independent of each other and can proceed in parallel once stores exist
- **Polish (Phase 9)**: Depends on all user stories being complete — page component assembles everything

### User Story Dependencies

- **User Story 1 (P1)**: Types + API wrappers + stores → ProductImages, ProductInfo, StockStatus, ProductAttributes
- **User Story 2 (P1)**: US1 components → VariantSelector + QuantitySelector + updates to US1 components
- **User Story 3 (P1)**: US2 variant state → AddToCartButton
- **User Story 4 (P2)**: Wishlist store + API wrapper → WishlistButton (independent of other stories)
- **User Story 5 (P2)**: Coupon API wrapper → CouponInput (independent of other stories)
- **User Story 6 (P2)**: Review API wrapper → ReviewList (independent of other stories)

### Within Each User Story

- Model types before API wrappers
- API wrappers before components
- Individual components before page assembly
- Core implementation before cross-cutting concerns

### Parallel Opportunities

- T001 and T002 (types) can run in parallel
- T003–T006 (API wrappers) can all run in parallel
- T007 and T008 (stores) can run in parallel
- T009–T012 (US1 components) can all run in parallel
- US4, US5, US6 components can run in parallel (no cross-dependencies)

---

## Parallel Example: Setup Phase

```bash
# Launch all type definitions together:
Task: "Create product types in src/lib/types/product.ts"
Task: "Create review types in src/lib/types/review.ts"

# Launch all API wrappers together (after types):
Task: "Create getProductBySlug in src/lib/api/products.ts"
Task: "Create wishlist API in src/lib/api/wishlist.ts"
Task: "Create coupon API in src/lib/api/coupons.ts"
Task: "Create reviews API in src/lib/api/reviews.ts"
```

## Parallel Example: User Story 1

```bash
# Launch all US1 display components together:
Task: "Create ProductImages component in src/components/store/ProductImages.tsx"
Task: "Create ProductInfo component in src/components/store/ProductInfo.tsx"
Task: "Create StockStatus component in src/components/store/StockStatus.tsx"
Task: "Create ProductAttributes component in src/components/store/ProductAttributes.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (types + API wrappers)
2. Complete Phase 2: Foundational (stores)
3. Complete Phase 3: User Story 1 (static product display)
4. **STOP and VALIDATE**: Navigate to any product URL and verify all static product data renders
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 (static display) → Deploy/Demo (MVP — shows product info, no interaction)
3. Add US2 (variant selection) → Deploy/Demo
4. Add US3 (add to cart) → Deploy/Demo (core purchase flow complete)
5. Add US4 (wishlist) → Deploy/Demo
6. Add US5 (coupon) + US6 (reviews) → Deploy/Demo
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: US1 components (ProductImages, ProductInfo, StockStatus, ProductAttributes)
   - Developer B: US2 (VariantSelector, QuantitySelector)
   - Developer C (independent): US4 (WishlistButton) + US5 (CouponInput) + US6 (ReviewList)
3. Developer A finishes, picks up US3 (AddToCartButton)
4. Developer B updates US1 components for variant awareness
5. Team assembles page after all stories complete
