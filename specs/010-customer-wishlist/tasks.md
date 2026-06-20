---

description: "Task list for Customer Wishlist feature implementation"
---

# Tasks: Customer Wishlist

**Input**: Design documents from `/specs/010-customer-wishlist/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md

**Tests**: Not requested — no test tasks included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify existing project scaffolding and dependencies

- [ ] T001 Verify existing dependencies and patterns are ready for wishlist feature (Zustand, shadcn/ui, lucide-react, sonner)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core type definitions and API wrapper enhancements that both user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T002 [P] Create `WishlistItemWithProduct` enriched type in `src/lib/types/wishlist.ts` (includes product name, slug, image, price, stock status alongside wishlist entry id/variant_id)
- [ ] T003 [P] Enhance `src/lib/api/wishlist.ts` — add `getWishlistDetail()` returning `WishlistItemWithProduct[]`, export new type, keep existing functions unchanged

**Checkpoint**: Foundation ready — user story implementation can now begin in parallel

---

## Phase 3: User Story 1 — View and Manage Wishlist (Priority: P1) 🎯 MVP

**Goal**: Customers can view all saved products on a dedicated `/wishlist` page, remove items, and add items to their cart directly from the wishlist.

**Independent Test**: A logged-in customer with saved products can visit `/wishlist`, see all items as product cards, remove one item (card disappears, badge decrements), and add another item to the cart (cart updates, toast shown).

### Implementation for User Story 1

- [ ] T004 [P] [US1] Create `WishlistCard` component in `src/components/store/WishlistCard.tsx` — renders product image, name, price, remove button (optimistic), add-to-cart button, out-of-stock state; follows ProductCard layout
- [ ] T005 [US1] Create `WishlistPageClient` component in `src/components/store/WishlistPageClient.tsx` — fetches wishlist detail via `getWishlistDetail()`, manages loading/empty/error states, renders WishlistCard grid, handles optimistic removal + add-to-cart + badge sync
- [ ] T006 [US1] Create wishlist page in `src/app/(store)/wishlist/page.tsx` — wrap `WishlistPageClient` with `<ProtectedRoute>` from existing pattern

**Checkpoint**: At this point, User Story 1 should be fully functional — customers can view, remove, and add-to-cart from `/wishlist`

---

## Phase 4: User Story 2 — Toggle Wishlist from Product Card (Priority: P1)

**Goal**: Customers can add or remove products from their wishlist directly from product cards and product detail pages via the heart icon toggle.

**Independent Test**: An unauthenticated customer clicks the heart icon and is redirected to `/login?next=<path>`. An authenticated customer toggles the heart — add fills immediately, remove shows confirmation dialog then empties immediately. Badge count updates reactively.

### Implementation for User Story 2

- [ ] T007 [P] [US2] Refactor `src/lib/stores/wishlist.store.ts` — replace direct `request.get` call with `getWishlist()` import from `@/lib/api/wishlist`; keep count-only persist behavior
- [ ] T008 [US2] Add confirmation dialog (shadcn AlertDialog) for wishlist removal in `src/components/store/WishlistButton.tsx` — clicking filled heart opens "Remove from wishlist?" confirmation; "Add to wishlist" (empty heart) works without confirmation per spec

**Checkpoint**: Both user stories should now be independently functional

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and edge case handling

- [ ] T009 Verify build passes with `npm run build`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Stories (Phase 3-4)**: All depend on Foundational phase completion
  - US1 and US2 can proceed in parallel after Foundation is complete
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) — No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) — No dependencies on other stories

### Within Each User Story

- Models/types before services/API
- Core components before page integration
- Story complete before moving to next

### Parallel Opportunities

- All Foundational tasks marked [P] can run in parallel
- Once Foundational phase completes, US1 and US2 can start in parallel
- Tasks within a story marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all components for User Story 1 together:
Task: "Create WishlistCard component in src/components/store/WishlistCard.tsx"
Task: "Create WishlistPageClient component in src/components/store/WishlistPageClient.tsx"
Task: "Create wishlist page in src/app/(store)/wishlist/page.tsx"
```

Note: T005 depends on T004 (WishlistPageClient uses WishlistCard), so T004 must complete before T005. T006 (page) depends on T005.

## Parallel Example: User Story 2

```bash
# Launch store refactor and button enhancement together:
Task: "Refactor src/lib/stores/wishlist.store.ts to use getWishlist() API wrapper"
Task: "Add confirmation dialog in src/components/store/WishlistButton.tsx"
```

Note: T007 and T008 are independent and can run in parallel.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 (Wishlist Page)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (Wishlist Page) → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 (Product Card Toggle with confirmation) → Test independently → Deploy/Demo
4. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Wishlist Page)
   - Developer B: User Story 2 (Product Card Toggle)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
