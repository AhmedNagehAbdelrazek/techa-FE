# Feature Specification: Customer Reviews

**Feature Branch**: `006-customer-reviews`

**Created**: 2026-06-19

**Status**: Draft

**Input**: Phase 6 from frontend-spec.md — Display, write, edit, and delete reviews on the product detail page.

### Out of Scope

- Admin review management (covered by admin panel phases)
- Photo/video attachments in reviews
- Review helpfulness voting
- Review reporting/flagging
- Sorting reviews (newest/oldest/highest/lowest) — only chronological order

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — View Product Reviews (Priority: P1)

A customer visits a product page and reads existing reviews to inform their purchase decision.

**Why this priority**: Review display is the minimum viable feature — customers need to see reviews before deciding to buy.

**Independent Test**: Navigate to any product with reviews and verify the rating distribution chart, average rating display, and individual review cards are all rendered correctly.

**Acceptance Scenarios**:

1. **Given** a customer is on a product detail page **When** the page loads, **Then** the average rating (with large star display), total review count, and rating distribution bar chart (count per star level) are displayed
2. **Given** a product has reviews **When** the customer scrolls to the reviews section, **Then** individual review cards show: star rating, reviewer name, relative date, comment body, and "Verified Purchase" badge (when applicable)
3. **Given** a product has more reviews than the initial page limit **When** the customer clicks "Load more reviews", **Then** additional reviews are appended and the button remains until all reviews are loaded
4. **Given** a product has no reviews **When** the product page loads, **Then** a "No reviews yet" message is displayed in the reviews section

---

### User Story 2 — Write a Review (Priority: P1)

An authenticated customer who has purchased and received this product writes a review.

**Why this priority**: Writing reviews is the primary user-generated content action — without it, the review section remains empty.

**Independent Test**: Log in as a customer who has a delivered order containing this product, navigate to the product page, and verify the review form appears with a star selector and text field. Submit and verify the new review card appears immediately.

**Acceptance Scenarios**:

1. **Given** an authenticated customer has a delivered order containing this product **When** they view the product page, **Then** a "Write a Review" form is displayed with a star rating selector (1-5), a comment textarea, and a submit button
2. **Given** the customer submits a valid review **When** the API call succeeds, **Then** the review is added to the list optimistically with an "is_verified" badge, and a success toast is shown
3. **Given** the customer submits a review and the API call fails **When** the error occurs, **Then** the optimistic addition is rolled back, and an error toast is displayed
4. **Given** a customer has not purchased this product **When** they view the product page, **Then** no review form is shown
5. **Given** a customer is not authenticated **When** they view the product page, **Then** no review form is shown

---

### User Story 3 — Edit a Review (Priority: P2)

An authenticated customer updates their existing review.

**Why this priority**: Editing allows customers to correct or update their feedback without deleting and recreating.

**Independent Test**: Log in as a customer who has an existing review on a product, navigate to the product page, and verify the review card shows an "Edit" button. Click to edit, change the rating and comment, save, and verify the card updates in place.

**Acceptance Scenarios**:

1. **Given** a customer is viewing a product page and they own an existing review **When** they click "Edit" on their review card, **Then** the card transforms into an inline form pre-filled with their current rating and comment
2. **Given** the customer submits the edit **When** the API call succeeds, **Then** the review card updates in place with the new content without a page reload
3. **Given** the customer submits an edit and the API call fails **When** the error occurs, **Then** the card reverts to its original content and an error toast is shown
4. **Given** a customer is editing **When** they click "Cancel", **Then** the edit mode is dismissed and the original content is restored

---

### User Story 4 — Delete a Review (Priority: P2)

An authenticated customer removes their own review.

**Why this priority**: Deleting gives customers control over their content without needing admin intervention.

**Independent Test**: Log in as a customer who has a review on a product, navigate to the product page, click "Delete", confirm in the dialog, and verify the review is removed from the list.

**Acceptance Scenarios**:

1. **Given** a customer is viewing a product page and they own an existing review **When** they click "Delete", **Then** a confirmation dialog (using AlertDialog) is shown asking "Are you sure you want to delete this review?"
2. **Given** the customer confirms deletion **When** the API call succeeds, **Then** the review card is removed from the list and a success toast is shown
3. **Given** the customer confirms deletion but the API call fails **When** the error occurs, **Then** the review card remains and an error toast is shown
4. **Given** the customer clicks "Cancel" on the confirmation dialog **When** the dialog closes, **Then** the review card remains unchanged

---

## Clarifications *(optional)*

### Session 2026-06-19

- Q: How does the frontend identify which reviews belong to the authenticated user to show Edit/Delete buttons? → A: The backend includes a `user` object (`{ id, name, avatar_url }`) in each review's response. The frontend matches `user.id` against the authenticated user's ID from the auth store.
- Q: How should the frontend check if the current user can review this product? → A: A dedicated endpoint `GET /api/products/:productId/reviews/eligibility` (auth required) returns `{ can_review: bool, reason?: string }`. The frontend calls this endpoint — no client-side order filtering needed.

## Edge Cases *(mandatory)*

- What happens when the customer has multiple delivered orders containing this product? → Show the review form once, using the first eligible `order_item_id` found. Only one review per product per customer.
- What happens when the customer already has a review but navigates away mid-edit? → Unsaved changes are lost (standard browser behavior, no draft persistence).
- What happens when a review is written for a product, then the product is deleted? → The review remains visible on the API side but the product detail page shows a 404. Reviews of deleted products are not rendered.
- What happens when a verified review's `order_item_id` references an order that is later cancelled? → The `is_verified` badge should remain as-is — verification is based on the delivery at time of writing.
- What happens when the API returns an error during "Load more reviews"? → Show a "Failed to load reviews" toast. The existing reviews and the "Load more" button remain so the user can retry.
- What happens when a customer tries to submit a review with a rating of 0? → Rating 1–5 is enforced on the client side; the star selector requires at least 1 star before the form can be submitted.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display the average rating with large star icons (filled/half/empty), numeric average, and total review count at the top of the reviews section
- **FR-002**: System MUST render a rating distribution bar chart showing the count of reviews for each star level (5★, 4★, 3★, 2★, 1★)
- **FR-003**: System MUST display individual review cards containing: star rating (mini stars), reviewer name, relative date, comment text, and a "Verified Purchase" badge when `is_verified` is true
- **FR-004**: System MUST paginate reviews using a "Load more" button that appends the next page of reviews to the existing list
- **FR-005**: System MUST show a "No reviews yet" message when a product has zero reviews
- **FR-006**: System MUST call `GET /api/products/:productId/reviews/eligibility` on page load (when authenticated) and show the "Write a Review" form only when `can_review` is true; if `can_review` is false with a reason, display the reason text (e.g., "You have already reviewed this product.")
- **FR-007**: System MUST provide a star rating selector (1–5) in the "Write a Review" form that updates visually as the user hovers and clicks
- **FR-008**: System MUST require at least 1 star and a non-empty comment before the review submit button is enabled
- **FR-009**: System MUST use optimistic UI when creating a review: add the review card to the list immediately on submit, and roll back with an error toast if the API call fails
- **FR-010**: System MUST show an "Edit" button on a customer's own review card (only visible to the review author)
- **FR-011**: System MUST transform the review card into an inline edit form on clicking "Edit", pre-filled with the current rating and comment
- **FR-012**: System MUST save edits in place without a page reload, rolling back with an error toast on API failure
- **FR-013**: System MUST show a "Delete" button on a customer's own review card (only visible to the review author)
- **FR-014**: System MUST show a shadcn AlertDialog confirmation before deleting a review
- **FR-015**: System MUST remove the review card from the list optimistically on deletion, rolling back with an error toast on API failure
- **FR-016**: System MUST display a loading skeleton in the reviews section while the initial batch of reviews is being fetched
- **FR-017**: System MUST show a "Load more reviews" loading spinner while additional reviews are being fetched
- **FR-018**: System MUST disable the "Load more" button while loading and re-enable it when the request completes (or hide it when no more pages exist)

### Key Entities *(include if feature involves data)*

- **Review**: A customer's rating and comment on a product. Contains `id`, `product_id`, `rating` (1–5), `comment` (string), `reviewer_name` (string), `relative_date` (string), `is_verified` (boolean), `user` (object with `id`, `name`, `avatar_url`), `created_at` (timestamp). Soft-deleted (`is_active: false`) on deletion.
- **ReviewListResponse**: Paginated wrapper containing `data` (Review[]) and `meta` (pagination metadata: page, limit, total, totalPages).
- **RatingDistribution**: Computed from reviews — count of reviews per star level (5 through 1).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Customers can read all reviews for a product within 2 seconds of the product page loading
- **SC-002**: Writing a review takes 3 steps or fewer (open form → select rating → type comment → submit)
- **SC-003**: Optimistic UI updates for create/edit/delete reflect in the list within 200ms of the user action
- **SC-004**: 99% of review API calls (list, create, update, delete) complete without client-side errors
- **SC-005**: The review form is correctly shown/hidden based on the customer's purchase history with 100% accuracy (no false positives where a non-buyer sees the form)
- **SC-006**: The "Load more reviews" pagination works for up to 100 pages without performance degradation

## Assumptions *(mandatory)*

- The product detail API (`GET /api/products/:slug`) embeds the first page of reviews in the response, so the initial review list is available on page load without a separate API call (as implemented in Phase 5)
- Additional reviews are fetched via `GET /api/products/:productId/reviews?page=N&limit=10` when the user clicks "Load more"
- Review eligibility is determined via `GET /api/products/:productId/reviews/eligibility` (auth required) — no client-side order filtering needed
- The eligibility endpoint also handles the "already reviewed" case by returning `can_review: false` with an appropriate reason
- Review authors are identified by matching the auth store's user ID against `user.id` in each review object
- The backend returns reviews in chronological order (newest first)
