# Implementation Plan: Customer Reviews

**Status**: Draft
**Target Branch**: `005-product-detail-page` (continues on same branch)
**Dependencies**: Phase 5 (Product Detail Page) — ReviewList component, review types, review API wrapper exist

---

## Tasks

### Task 1: Update review types

**File**: `src/lib/types/review.ts`
**Estimate**: Small

Add `UserBrief`, `ReviewEligibilityResponse`, `CreateReviewRequest`, `UpdateReviewRequest` types. Add `user` field to `Review`.

**Validation**: TypeScript compilation passes for existing code that imports from review.ts.

---

### Task 2: Extend review API wrappers

**File**: `src/lib/api/reviews.ts`
**Estimate**: Small

Add four functions using the Request client:
- `checkReviewEligibility(productId: string): Promise<ReviewEligibilityResponse>`
- `createReview(productId: string, data: CreateReviewRequest): Promise<Review>`
- `updateReview(reviewId: string, data: UpdateReviewRequest): Promise<Review>`
- `deleteReview(reviewId: string): Promise<{ message: string }>`

**Validation**: Functions compile and match API contracts in `contracts/review-api.md`.

---

### Task 3: Build star rating selector

**File**: `src/components/store/ReviewList.tsx`
**Estimate**: Medium

Create an inline `StarRatingSelector` component within ReviewList.tsx (or import a shared utility). Must support:
- Visual feedback on hover (highlight stars up to hovered position)
- Click to set a value (1–5)
- Display current value visually (filled stars)
- Minimum 1 star before form submission is allowed
- RTL-aware (stars are still left-to-right by convention)

**Validation**: Hovering over stars highlights them; clicking sets the value; a value of 0 disables submit.

---

### Task 4: Add "Write a Review" form with optimistic creation

**File**: `src/components/store/ReviewList.tsx`
**Estimate**: Medium

Add a form section above the review list that:
- Appears when `can_review` is true (from eligibility check)
- Contains the star rating selector and a textarea for the review comment
- Submit button disabled until rating ≥ 1 and comment is non-empty
- On submit: optimistically adds a temporary review card to the list, calls `createReview()`
- On success: replaces temporary review with real data, adjusts pagination meta
- On failure: removes temporary review, shows error toast, re-enables form
- Hides form after successful creation (until eligibility re-check)

**Validation**: Submitting a valid review shows it immediately; a simulated API failure rolls back the addition.

---

### Task 5: Add inline edit mode

**File**: `src/components/store/ReviewList.tsx`
**Estimate**: Medium

For review cards where `user.id === authStore.user.id`:
- Show an "Edit" button on the card
- Clicking "Edit" transforms the card into an inline form pre-filled with current rating and comment
- Cancel button reverts to display mode without changes
- Save triggers `updateReview()` with optimistic in-place update
- On failure: reverts card to original content, shows error toast

**Validation**: Clicking edit shows pre-filled form; cancelling restores original; simulated API failure reverts content.

---

### Task 6: Add delete flow with confirmation

**File**: `src/components/store/ReviewList.tsx`
**Estimate**: Medium

For review cards where `user.id === authStore.user.id`:
- Show a "Delete" button on the card (positioned next to Edit)
- Clicking "Delete" opens a shadcn AlertDialog: "Are you sure you want to delete this review?"
- Confirm button and Cancel button in the dialog
- On confirm: optimistically removes the review card from the list, calls `deleteReview()`
- On failure: re-inserts the review card at its original position, shows error toast

**Validation**: Deleting removes the card immediately; simulated API failure restores it.

---

### Task 7: Integrate eligibility check

**File**: `src/components/store/ReviewList.tsx`
**Estimate**: Small

- On component mount, if authenticated, call `checkReviewEligibility(productId)`
- Store result in component state
- When `can_review` is true: show "Write a Review" form
- When `can_review` is false with a reason: display the reason text instead of the form
- When not authenticated: show nothing (no form, no reason)
- After successful review creation, re-check or immediately hide form

**Validation**: Authenticated non-purchaser sees "You need to purchase..." text; non-authenticated user sees no form.

---

### Task 8: Final verification

**Command**: `npm run build`
**Estimate**: Small

Ensure TypeScript compilation, linting, and all imports are correct. Verify no regressions in product detail page or other features.

**Validation**: Build exits with code 0.

---

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Eligibility endpoint not available yet | Medium | Gate form display behind the API call; graceful degradation (no form if endpoint fails) |
| Review API returns pagination meta with different field names | Low | Review Postman contracts already confirmed; update types if needed |
| Optimistic update timestamp mismatch | Low | Use local `Date.now()` for temporary review card display order; refresh on pagination |
| AlertDialog not available in project | Low | shadcn/ui is project standard; install `@radix-ui/react-alert-dialog` if needed |
