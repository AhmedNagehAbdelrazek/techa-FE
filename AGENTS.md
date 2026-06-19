<!-- SPECKIT START -->

## Current Plan

**Feature**: Customer Reviews
**Branch**: `005-product-detail-page` (continues on same branch)
**Plan file**: `specs/006-customer-reviews/plan.md`
**Spec file**: `specs/006-customer-reviews/spec.md`

### Key Artifacts

- [spec.md](specs/006-customer-reviews/spec.md) — Feature specification
- [plan.md](specs/006-customer-reviews/plan.md) — Implementation plan
- [research.md](specs/006-customer-reviews/research.md) — Research decisions
- [data-model.md](specs/006-customer-reviews/data-model.md) — Data model
- [quickstart.md](specs/006-customer-reviews/quickstart.md) — Setup guide
- [contracts/review-api.md](specs/006-customer-reviews/contracts/review-api.md) — API contracts

### Implementation Order

1. Update `src/lib/types/review.ts` — Add `UserBrief`, `ReviewEligibilityResponse`, `CreateReviewRequest`, `UpdateReviewRequest`; add `user` field to `Review`
2. Extend `src/lib/api/reviews.ts` — Add `checkReviewEligibility(productId)`, `createReview(productId, data)`, `updateReview(reviewId, data)`, `deleteReview(reviewId)`
3. Update `src/components/store/ReviewList.tsx` — Add star rating selector component (hover/click visual feedback, 1-5)
4. Update `src/components/store/ReviewList.tsx` — Add "Write a Review" form with rating + comment, submit validation, optimistic creation with rollback
5. Update `src/components/store/ReviewList.tsx` — Add inline edit mode on owned reviews (pre-filled form, optimistic update with rollback, cancel button)
6. Update `src/components/store/ReviewList.tsx` — Add delete button on owned reviews with AlertDialog confirmation and optimistic removal
7. Update `src/components/store/ReviewList.tsx` — Integrate eligibility endpoint call on page load (when authenticated); conditionally show form or reason text
8. Update `src/components/store/ReviewList.tsx` — Ensure loading skeleton, "Load more" spinner, disabled state, and rollback for pagination errors
9. Verify: build passes with `npm run build`

### Completed (Phase 5)

- Product detail page: types, API wrappers, all 10 components, product page composition, build verification

<!-- SPECKIT END -->
