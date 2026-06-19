# Research: Customer Reviews

**Feature**: Customer Reviews — Display, write, edit, and delete reviews on the product detail page.
**Spec**: [spec.md](./spec.md)

---

## Decision 1: Review Ownership Detection

- **Decision**: Match `user.id` from the review response against the authenticated user's ID from the Zustand auth store.
- **Rationale**: The backend review list response includes a `user` object (`{ id, name, avatar_url }`). The frontend can compare `user.id` against `useAuthStore.getState().user.id` to determine if Edit/Delete buttons should appear. This avoids an extra API call and works for both initial page load and paginated loads.
- **Alternatives considered**:
  1. Backend adds `is_own: boolean` — functionally equivalent but requires backend change.
  2. LocalStorage tracking — fragile, breaks on cache clear or multi-device use.

---

## Decision 2: Review Eligibility API

- **Decision**: Use dedicated `GET /api/products/:productId/reviews/eligibility` endpoint.
- **Rationale**: Avoids expensive client-side order list traversal. The endpoint returns a simple boolean with a reason string, making it trivial to show/hide the review form and display the appropriate message (e.g., "You have already reviewed this product" or "You need to purchase this product before reviewing it").
- **Alternatives considered**:
  1. Client-side `GET /api/orders` filtering — potentially slow for customers with many orders; doesn't scale.
  2. Embed eligibility in product detail response — possible but couples unrelated concerns.

---

## Decision 3: Pagination Style

- **Decision**: "Load more" button appends reviews to the existing list.
- **Rationale**: Common pattern for review sections on product pages (Amazon, most e-commerce). Avoids page-to-page navigation, keeps the user in context. The button remains visible until all pages are exhausted.
- **Alternatives considered**:
  1. Numbered pagination — better for search results/lists but disruptive for continuous reading of reviews.
  2. Infinite scroll — harder to maintain position and can cause layout shift.

---

## Decision 4: Optimistic UI Strategy

- **Decision**: Create/edit/delete all use optimistic updates with rollback on failure.
- **Rationale**: Provides instant feedback for all user actions. The spec already requires this (FR-009, FR-012, FR-015) and it's the established pattern for interactive actions in the project.
- **Alternatives considered**: Pessimistic updates — simpler to implement but introduces perceived latency that contradicts success criteria SC-003 (200ms).

---

## Decision 5: Review Form Eligibility Check Timing

- **Decision**: Call eligibility endpoint once on page load (client-side, when authenticated).
- **Rationale**: Avoids redundant calls. The result is cached in component state for the page session. If the user writes a review, the form hides (optimistic) and the eligibility is re-checked if they somehow return to the page.
- **Alternatives considered**:
  1. Check on scroll-into-view — adds complexity without tangible benefit.
  2. Check on every mount — unnecessary; eligibility only changes when the user writes a review or receives a new order.
