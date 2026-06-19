# Quick Start: Customer Reviews

## Prerequisites

- Phase 5 (Product Detail Page) complete and `npm run build` passing
- `src/lib/types/review.ts` exists with `Review`, `ReviewListResponse`, `RatingDistribution`, `PaginationMeta`
- `src/lib/api/reviews.ts` exists with `getProductReviews()`
- `src/components/store/ReviewList.tsx` exists as display-only component
- `src/app/(store)/product/[slug]/page.tsx` renders review section

## Steps

1. **Update types** — Add `UserBrief` and `ReviewEligibilityResponse` types; add `user` field to `Review`
2. **Extend API wrappers** — Add `createReview()`, `updateReview()`, `deleteReview()`, `checkReviewEligibility()` to `src/lib/api/reviews.ts`
3. **Create review form** — Build star rating selector, textarea, submit validation in `ReviewList.tsx`
4. **Add write mode** — Conditional form that appears based on eligibility check, with optimistic creation
5. **Add edit mode** — Inline editing on owned reviews with pre-filled form and optimistic update
6. **Add delete flow** — shadcn AlertDialog confirmation with optimistic removal
7. **Integrate eligibility** — Call eligibility endpoint on page load (when authenticated)
8. **Verify** — `npm run build` passes

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/types/review.ts` | Review, ReviewListResponse, RatingDistribution, PaginationMeta, UserBrief, ReviewEligibilityResponse |
| `src/lib/api/reviews.ts` | getProductReviews, createReview, updateReview, deleteReview, checkReviewEligibility |
| `src/components/store/ReviewList.tsx` | Main review component with display, write, edit, delete, and eligibility |
| `src/app/(store)/product/[slug]/page.tsx` | Product detail page (renders ReviewList) |
| `src/lib/stores/auth.store.ts` | Zustand auth store for user ID matching (pre-existing) |

## CLI Commands

```bash
# Verify build
npm run build

# Lint
npm run lint
```
