# Tasks: Product Listing & Search

**Input**: Design documents from `specs/004-product-listing-search/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not requested in feature specification — no test tasks are generated.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Web app: `src/` at repository root
- Paths follow the existing project convention: pages in `app/(store)/`, components in `components/store/`, API wrappers in `lib/api/`, types in `lib/types/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

No setup tasks needed — the Next.js project is already initialized, all dependencies are installed (shadcn/ui, TanStack Query, axios, sonner, lucide-react, etc.), and the project structure already exists from previous phases.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Types and API wrappers needed by ALL user stories

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T001 [P] Create Product list/search response types in `src/lib/types/product.ts`
- [ ] T002 [P] Create Category tree TypeScript interface in `src/lib/types/category.ts`
- [ ] T003 [P] Create Brand TypeScript interface in `src/lib/types/brand.ts`
- [ ] T004 [P] Create Product API wrapper (listProducts with filter params) in `src/lib/api/products.ts`
- [ ] T005 [P] Create Category tree API wrapper in `src/lib/api/categories.ts`
- [ ] T006 [P] Create Brand list API wrapper in `src/lib/api/brands.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 3 – Filter and Sort Products (Priority: P1) 🎯 MVP

**Goal**: Build all filter components, sort dropdown, pagination, filter chips, desktop sidebar, and the ProductGrid that composes them — the shared core of both listing pages.

**Independent Test**: Render the ProductGrid with mock data (no page needed) and verify that brand checkboxes, price inputs, rating selector, sort dropdown, pagination, and filter chips all render and update internal state correctly.

### Implementation for User Story 3

- [ ] T007 [P] [US3] Create numbered Pagination component in `src/components/store/Pagination.tsx`
- [ ] T008 [P] [US3] Create SortDropdown component in `src/components/store/SortDropdown.tsx`
- [ ] T009 [P] [US3] Create BrandFilter multi-select checkboxes in `src/components/store/BrandFilter.tsx`
- [ ] T010 [P] [US3] Create PriceRangeFilter component in `src/components/store/PriceRangeFilter.tsx`
- [ ] T011 [P] [US3] Create RatingFilter star selector in `src/components/store/RatingFilter.tsx`
- [ ] T012 [P] [US3] Create FilterChips component in `src/components/store/FilterChips.tsx`
- [ ] T013 [US3] Create FilterSidebar desktop layout composing BrandFilter, PriceRangeFilter, RatingFilter, and in-stock toggle in `src/components/store/FilterSidebar.tsx`
- [ ] T014 [US3] Create ProductGrid component with URL-driven filter state, composing FilterSidebar, SortDropdown, FilterChips, product cards, and Pagination in `src/components/store/ProductGrid.tsx`

**Checkpoint**: At this point, ProductGrid should be fully functional and embeddable

---

## Phase 4: User Story 1 — Browse Products by Category (Priority: P1)

**Goal**: Build the category listing page using ProductGrid.

**Independent Test**: Visit `/category/electronics` with known products and verify products are listed, the category name is the page title, pagination works, and empty state shows when no products exist.

### Implementation for User Story 1

- [ ] T015 [US1] Create category listing page server component that fetches category tree, resolves slug to ID, then renders ProductGrid in `src/app/(store)/category/[slug]/page.tsx`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 5: User Story 2 — Search Products (Priority: P1)

**Goal**: Build the search results page using ProductGrid.

**Independent Test**: Type a known product name in the search bar and verify the search results page shows matching products with the query in the page title.

### Implementation for User Story 2

- [ ] T016 [US2] Create search results page server component that reads `?search=` param and renders ProductGrid with search prop in `src/app/(store)/search/page.tsx`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 6: User Story 4 — Mobile Filtering (Priority: P2)

**Goal**: Add mobile filter slide-over sheet so all filter controls are accessible on small screens.

**Independent Test**: On a 375px viewport, verify no filter sidebar is visible and a "Filters" button opens a sheet containing all filter options.

### Implementation for User Story 4

- [ ] T017 [US4] Create FilterSheet mobile slide-over component using shadcn Sheet in `src/components/store/FilterSheet.tsx`
- [ ] T018 [US4] Integrate FilterSheet into ProductGrid — show sheet on mobile, hide desktop sidebar

**Checkpoint**: All user stories should now be independently functional

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T019 [P] Add error states and loading skeletons to ProductGrid for all filter sections
- [ ] T020 [P] Add empty state with "Clear all filters" button to ProductGrid
- [ ] T021 Verify: build passes with `npm run build`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — nothing needed
- **Foundational (Phase 2)**: No dependencies — BLOCKS all user stories
- **US3 (Phase 3, P1)**: Depends on Foundational — BLOCKS US1 and US2
- **US1 (Phase 4, P1)**: Depends on US3 (ProductGrid + filters) completion
- **US2 (Phase 5, P1)**: Depends on US3 (ProductGrid + filters) completion — can be done in parallel with US1
- **US4 (Phase 6, P2)**: Depends on US3 completion — can be done in parallel with US1/US2
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 3 (P1)**: Can start after Foundational (Phase 2) — No dependencies on other stories
- **User Story 1 (P1)**: Depends on US3 — independently testable once US3 complete
- **User Story 2 (P1)**: Depends on US3 — independently testable once US3 complete
- **User Story 4 (P2)**: Depends on US3 — independently testable once US3 complete

### Within Each User Story

- Types before API wrappers
- Individual filter components before FilterSidebar
- FilterSidebar before ProductGrid
- ProductGrid before page integration
- Story complete before moving to next

### Parallel Opportunities

- All Foundational tasks (T001-T006) marked [P] can run in parallel
- All US3 filter component tasks (T007-T012) marked [P] can run in parallel
- US1 (T015) and US2 (T016) can run in parallel with each other and with US4 (T017-T018)
- Polish tasks (T019-T021) marked [P] can run in parallel

---

## Parallel Example: User Story 3

```bash
# Launch all filter components for US3 together:
Task: "Create Pagination in src/components/store/Pagination.tsx"
Task: "Create SortDropdown in src/components/store/SortDropdown.tsx"
Task: "Create BrandFilter in src/components/store/BrandFilter.tsx"
Task: "Create PriceRangeFilter in src/components/store/PriceRangeFilter.tsx"
Task: "Create RatingFilter in src/components/store/RatingFilter.tsx"
Task: "Create FilterChips in src/components/store/FilterChips.tsx"

# Then sequentially:
Task: "Create FilterSidebar (depends on all filter components)"
Task: "Create ProductGrid (depends on FilterSidebar + SortDropdown + Pagination + FilterChips)"
```

---

## Implementation Strategy

### MVP First (User Story 3 + User Story 1)

1. Complete Phase 2: Foundational (types + API wrappers)
2. Complete Phase 3: US3 — ProductGrid with full filter/sort/pagination
3. Complete Phase 4: US1 — Category page
4. **STOP and VALIDATE**: Test category browsing with filters and pagination
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Foundational (Phase 2) → Foundation ready
2. Add US3 (filter/sort/pagination) → Core grid infrastructure ready (MVP foundation!)
3. Add US1 (category page) → Test independently → Deploy/Demo (**MVP!**)
4. Add US2 (search page) → Test independently → Deploy/Demo
5. Add US4 (mobile filter sheet) → Test independently → Deploy/Demo
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Foundational (Phase 2) together
2. Once Foundational is done:
   - Developer A: All US3 filter components (T007-T012)
   - Developer B: FilterSidebar (T013) + ProductGrid (T014) after filter components ready
3. Once US3 is done:
   - Developer A: US1 (T015)
   - Developer B: US2 (T016) + US4 (T017-T018)
4. Stories complete and integrate independently
