# Tasks: Storefront Homepage

**Input**: Design documents from `specs/003-storefront-homepage/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- All paths use `@/` alias or relative paths within `src/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization — add missing shadcn component

- [ ] T001 Add shadcn skeleton component via `npx shadcn@latest add skeleton`

**Checkpoint**: Skeleton component available at `src/components/ui/skeleton.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Type definitions and API wrappers — MUST be complete before any user story

- [ ] T002 [P] Create Banner type interface in `src/lib/types/banner.ts`
- [ ] T003 [P] Create Product type interface in `src/lib/types/product.ts`
- [ ] T004 [P] Create Category type interface in `src/lib/types/category.ts`
- [ ] T005 Create Banner API wrapper functions in `src/lib/api/banners.ts` (depends on T002)
- [ ] T006 Create Product API wrapper functions in `src/lib/api/products.ts` (depends on T003)
- [ ] T007 Create Category API wrapper functions in `src/lib/api/categories.ts` (depends on T004)
- [ ] T008 Create SectionHeader component in `src/components/store/SectionHeader.tsx`

**Checkpoint**: Types, API wrappers, and shared SectionHeader ready — section components can now be built

---

## Phase 3: User Story 1 — Browse Homepage & Hero Banners (Priority: P1) 🎯 MVP

**Goal**: Hero banner carousel and the homepage shell — the most prominent section visible on first load

**Independent Test**: Visit `/` and verify hero carousel auto-plays through banners, manual prev/next and dot controls work, banners are clickable with correct links

### Implementation for User Story 1

- [ ] T009 [P] [US1] Create HeroBanner carousel component in `src/components/store/HeroBanner.tsx` (uses embla-carousel via shadcn carousel, fetches banners on server)
- [ ] T010 [US1] Create homepage server component at `src/app/(store)/page.tsx` composing HeroBanner with skeleton loading state

**Checkpoint**: Homepage at `/` displays hero carousel with live banner data. All other sections show skeletons or are hidden until implemented.

---

## Phase 4: User Story 2 — Browse Featured Products (Priority: P1)

**Goal**: Featured products section with reusable ProductCard — the primary conversion surface

**Independent Test**: Visit `/` and verify featured products section shows up to 8 product cards with image, name, brand, rating stars, price (discounted if applicable), and that clicking a card navigates to `/product/:slug`

### Implementation for User Story 2

- [ ] T011 [P] [US2] Create ProductCard component in `src/components/store/ProductCard.tsx` (displays image, name, brand, rating stars, price with discount badge and wishlist toggle)
- [ ] T012 [US2] Add Featured Products section to `src/app/(store)/page.tsx` (server fetch with `is_featured=true&limit=8`, compose ProductCard grid, skeleton while loading)

**Checkpoint**: Homepage now shows hero carousel AND featured products section with live data.

---

## Phase 5: User Story 3 — Browse Categories (Priority: P2)

**Goal**: Top-level category grid — the secondary discovery path

**Independent Test**: Visit `/` and verify category grid shows top-level categories with image and name, clicking navigates to `/category/:slug`

### Implementation for User Story 3

- [ ] T013 [P] [US3] Create CategoryCard component in `src/components/store/CategoryCard.tsx` (displays image, name, links to `/category/:slug`, placeholder fallback for missing images)
- [ ] T014 [US3] Add Category Grid section to `src/app/(store)/page.tsx` (server fetch from `/api/categories/tree`, extract top-level, compose CategoryCard grid, skeleton while loading)

**Checkpoint**: Homepage now shows hero carousel, featured products, AND category grid.

---

## Phase 6: User Story 4 — Browse New Arrivals (Priority: P2)

**Goal**: New arrivals section showcasing newest products

**Independent Test**: Visit `/` and verify new arrivals section shows up to 8 newest products sorted by most recent first, with same ProductCard UI and wishlist toggle

### Implementation for User Story 4

- [ ] T015 [US4] Add New Arrivals section to `src/app/(store)/page.tsx` (server fetch with `sort=newest&limit=8`, compose ProductCard grid, skeleton while loading)

**Checkpoint**: All five homepage sections rendering with live data.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final checks and verification

- [ ] T016 Add mid-page banner section to `src/app/(store)/page.tsx` (server fetch with `position=mid_page`, single banner or carousel)
- [ ] T017 Run `npm run build` and fix any build errors

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Foundational — can start immediately after
- **US2 (Phase 4)**: Depends on Foundational — modifies `page.tsx` so must run after or alongside US1
- **US3 (Phase 5)**: Depends on Foundational — modifies `page.tsx` so must run after US1/US2
- **US4 (Phase 6)**: Depends on Foundational — modifies `page.tsx` so must run after US3
- **Polish (Phase 7)**: Depends on all user stories complete

### User Story Dependencies

- **US1 (P1)**: HeroBanner — can start after Foundational
- **US2 (P1)**: ProductCard — standalone component [P], but page.tsx integration sequential
- **US3 (P2)**: CategoryCard — standalone component [P], but page.tsx integration sequential
- **US4 (P2)**: New Arrivals — reuses ProductCard, page.tsx integration sequential

### Within Each Phase

- Types before API wrappers
- Shared components (SectionHeader) before section components
- Section component [P] before page.tsx integration

### Parallel Opportunities

- **Phase 2**: All type files T002-T004 can run in parallel; all API wrappers T005-T007 can run in parallel
- **US1-US4**: Component files (HeroBanner, ProductCard, CategoryCard) marked [P] can run in parallel since they're different files with no interdependencies
- The `page.tsx` integration tasks (T010, T012, T014, T015) MUST be sequential since they modify the same file

---

## Parallel Example: Phase 2

```bash
Task: "Create Banner type in src/lib/types/banner.ts"
Task: "Create Product type in src/lib/types/product.ts"
Task: "Create Category type in src/lib/types/category.ts"
```

```bash
Task: "Create Banner API wrapper in src/lib/api/banners.ts"
Task: "Create Product API wrapper in src/lib/api/products.ts"
Task: "Create Category API wrapper in src/lib/api/categories.ts"
```

## Parallel Example: Components (US1-US4)

```bash
Task: "Create HeroBanner in src/components/store/HeroBanner.tsx"
Task: "Create ProductCard in src/components/store/ProductCard.tsx"
Task: "Create CategoryCard in src/components/store/CategoryCard.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: US1 (Hero carousel + page shell)
4. **STOP and VALIDATE**: Visit `/` — hero carousel works
5. Deploy/demo if needed

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 (Hero carousel) → Test → Deploy/Demo
3. Add US2 (Featured products) → Test → Deploy/Demo
4. Add US3 (Category grid) → Test → Deploy/Demo
5. Add US4 (New arrivals) → Test → Deploy/Demo
6. Each section adds value without breaking previous sections

### Sequential Strategy (Recommended)

Given that `page.tsx` is a single file, the most practical approach is sequential:

1. Phase 1 → Phase 2 → US1 → US2 → US3 → US4 → Polish

Component files (HeroBanner, ProductCard, CategoryCard) can be parallelized within their phases.

---

## Notes

- [P] tasks = different files, no dependencies
- [US1]-[US4] labels map tasks to specific user stories
- `page.tsx` is a server component — all data fetching happens server-side
- Each section independently handles its own loading (skeleton), error, and empty states
- Hero images use `priority` prop; all other images use lazy loading
- Star rating uses inline SVGs — no third-party rating library
- Build must pass (`npm run build`) before final checkpoint
