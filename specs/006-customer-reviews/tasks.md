---

description: "Task list for Customer Reviews feature implementation"
---

# Tasks: Customer Reviews

**Input**: Design documents from `specs/006-customer-reviews/`

**Prerequisites**: Phase 5 (Product Detail Page) complete — `src/lib/types/review.ts`, `src/lib/api/reviews.ts`, `src/components/store/ReviewList.tsx` exist

**Tests**: No test tasks — tests not requested in spec

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US2, US3, US4)
- Include exact file paths

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No project initialization needed — continuing on existing `005-product-detail-page` branch. All dependencies (sonner for toasts, lucide-react for icons, radix-ui with alert-dialog) already present.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core types and API wrappers that MUST be complete before ANY user story can be implemented.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T001 [P] Add `UserBrief`, `ReviewEligibilityResponse`, `CreateReviewRequest`, `UpdateReviewRequest` types and `user` field to `Review` in `src/lib/types/review.ts`
- [ ] T002 [P] Add `checkReviewEligibility(productId)`, `createReview(productId, data)`, `updateReview(reviewId, data)`, `deleteReview(reviewId)` API functions in `src/lib/api/reviews.ts`
- [ ] T003 [P] Create shadcn AlertDialog component in `src/components/ui/alert-dialog.tsx`

**Checkpoint**: Foundation ready — user story implementation can now begin in parallel.

---

## Phase 3: User Story 2 — Write a Review (Priority: P1) 🎯 MVP

**Goal**: An authenticated customer who has purchased and received a product can write a review with a star selector, textarea, and see it appear immediately via optimistic UI.

**Independent Test**: Log in as a customer who can review, navigate to a product page, verify the form appears with star selector and textarea. Submit a review and verify it appears in the list immediately. Simulate API failure and verify rollback.

- [ ] T004 [US2] Build `StarRatingSelector` component within `src/components/store/ReviewList.tsx` with hover/click visual feedback (1–5 stars, minimum 1 star enforced)
- [ ] T005 [US2] Call `checkReviewEligibility(productId)` on mount when authenticated, store result in state, and conditionally render "Write a Review" form (star selector + textarea) with validation and optimistic creation with rollback in `src/components/store/ReviewList.tsx`

**Checkpoint**: At this point, User Story 2 should be fully functional and testable independently.

---

## Phase 4: User Story 3 — Edit a Review (Priority: P2)

**Goal**: An authenticated customer can update their own existing review via an inline edit form with optimistic update.

**Independent Test**: Log in as a customer who has a review on a product, navigate to the product page, verify "Edit" button appears on their review card. Click to edit, change rating and comment, save, and verify the card updates in place. Click cancel and verify original content is restored.

- [ ] T006 [US3] Add "Edit" button on owned review cards (match `user.id` against `useAuthStore.user.id`), inline edit form pre-filled with current rating/comment, optimistic update with rollback, and cancel button in `src/components/store/ReviewList.tsx`

**Checkpoint**: At this point, User Stories 2 AND 3 should both work independently.

---

## Phase 5: User Story 4 — Delete a Review (Priority: P2)

**Goal**: An authenticated customer can delete their own review with confirmation dialog and optimistic removal.

**Independent Test**: Log in as a customer who has a review on a product, navigate to the product page, click "Delete", confirm in the alert dialog, and verify the review is removed. Simulate API failure and verify rollback.

- [ ] T007 [US4] Add "Delete" button on owned review cards, shadcn `AlertDialog` confirmation, optimistic removal with rollback on failure, and success/error toasts in `src/components/store/ReviewList.tsx`

**Checkpoint**: All user stories should now be independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Fix remaining issues across all user stories.

- [ ] T008 Fix "Load more" pagination error handling in `src/components/store/ReviewList.tsx` — replace `// silently fail` with error toast, keep existing reviews and "Load more" button enabled for retry
- [ ] T009 Verify build passes with `npm run build`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — already complete
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Stories (Phase 3–5)**: All depend on Foundational phase completion
  - User stories US2 (Write), US3 (Edit), US4 (Delete) can proceed sequentially in priority order
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 2 (P1)**: Can start after Foundational (Phase 2) — No dependencies on other stories
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) — Requires `user` field on Review for ownership detection (from T001); independently testable
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) — Requires `user` field on Review for ownership detection (from T001); requires AlertDialog component (from T003); independently testable

### Within Each User Story

- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- T001, T002, T003 can all run in parallel (different files, no cross-dependencies)
- T004 and the non-blocking parts of T005 can run in parallel if needed
- US2, US3, US4 can all theoretically start in parallel after Phase 2, but Edit/Delete depend on `user` field and auth store matching which is part of Phase 2

---

## Parallel Example: Phase 2 (Foundational)

```bash
Task: "Add UserBrief types to src/lib/types/review.ts"
Task: "Add API functions to src/lib/api/reviews.ts"
Task: "Create AlertDialog component in src/components/ui/alert-dialog.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 2 Only)

1. Complete Phase 2: Foundational (types, API wrappers, AlertDialog)
2. Complete Phase 3: User Story 2 (Write a Review)
3. **STOP and VALIDATE**: Test User Story 2 independently
4. Deploy/demo if ready

### Incremental Delivery

1. Complete Foundational → Foundation ready
2. Add User Story 2 (Write a Review) → Test independently → Deploy/Demo (MVP!)
3. Add User Story 3 (Edit a Review) → Test independently → Deploy/Demo
4. Add User Story 4 (Delete a Review) → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories
