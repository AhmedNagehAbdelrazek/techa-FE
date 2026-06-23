---

description: "Task list for Admin Coupons & Delivery Zones"
---

# Tasks: Admin Coupons & Delivery Zones

**Input**: Design documents from `specs/017-admin-coupons-delivery-zones/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not requested in spec — no test tasks generated.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

- **Next.js App Router project**: `src/` at repository root
- All paths use `@/` import alias

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No project setup needed — Phase 17 builds on existing admin infrastructure

No setup tasks required. All dependencies already in `package.json`. Admin patterns (adminRequest, useAdminStore, ErrorState/EmptyState, React Query) already established in Phases 13-16.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: API wrapper layer that both user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T001 Create API wrappers and TypeScript types for coupons, zones, and rates in `src/lib/api/admin-coupons-zones.ts`

**Checkpoint**: Foundation ready — user story implementation can now begin in parallel

---

## Phase 3: User Story 1 — Admin Manages Coupons (Priority: P1) 🎯 MVP

**Goal**: Admin can view, create, edit, and deactivate discount coupons via a paginated data table with Dialog-based forms and a searchable product combobox.

**Independent Test**: An admin can open `/admin/coupons`, see the paginated coupon table, click "Add Coupon", fill in the form, verify the coupon appears, edit its value, deactivate it, and confirm the status badge updates.

### Implementation for User Story 1

- [ ] T002 [P] [US1] Create `CouponsTable` component with paginated data table, columns (code, product, type, value, usage, expiry, status badge with Inactive > Expired > Active precedence), skeleton loading, empty state, and error state in `src/components/admin/CouponsTable.tsx`
- [ ] T003 [P] [US1] Create `CouponFormDialog` component with react-hook-form + zod validation, searchable product combobox (debounced fetch via React Query), is_active toggle, and shared create/edit mode in `src/components/admin/CouponFormDialog.tsx`
- [ ] T004 [US1] Create coupon management page combining `CouponsTable` and `CouponFormDialog` with permission gating (`coupons.read/create/update/delete`) in `src/app/admin/(protected)/coupons/page.tsx`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 — Admin Manages Delivery Zones (Priority: P1)

**Goal**: Admin can view, create, edit, and deactivate delivery zones with expandable rows showing shipping rates, plus Add/Edit Rate Dialogs per zone.

**Independent Test**: An admin can open `/admin/delivery-zones`, see the zones table, create a zone, expand it to see empty rates, add a rate, confirm the rate appears, deactivate the zone with warning, and verify both zone and rates show inactive.

### Implementation for User Story 2

- [ ] T005 [P] [US2] Create `ZonesTable` component with zones table, expandable rows (local useState toggle), rates fetched on expand via React Query, skeleton loading, empty state, and error state in `src/components/admin/ZonesTable.tsx`
- [ ] T006 [P] [US2] Create `ZoneFormDialog` component with react-hook-form + zod validation, name input, regions multi-tag chip input (removable badges), is_active toggle, and shared create/edit mode in `src/components/admin/ZoneFormDialog.tsx`
- [ ] T007 [P] [US2] Create `RateFormDialog` component with react-hook-form + zod validation, charge, estimated_days_min/max, free_above_amount, min/max_order_amount, and shared create/edit mode in `src/components/admin/RateFormDialog.tsx`
- [ ] T008 [US2] Create delivery zone management page combining `ZonesTable`, `ZoneFormDialog`, and `RateFormDialog` with permission gating (`zones.read/create/update/delete`) in `src/app/admin/(protected)/delivery-zones/page.tsx`

**Checkpoint**: Both user stories should now be independently functional

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T009 Verify sidebar navigation links exist for `/admin/coupons` (`Percent` icon) and `/admin/delivery-zones` (`MapPin` icon) in `src/components/layout/AdminSidebar.tsx` — both already present, verify only
- [ ] T010 [P] Final review — tree-shake unused imports, check permission gating on all action buttons, verify error/empty/loading states on both pages
- [ ] T011 Build verification — run `pnpm run build` and fix any type/lint errors

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 2)**: T001 must finish before any user story tasks
- **User Stories (Phase 3-4)**: Both depend on T001 completion
  - T002 and T003 can run in parallel within US1
  - T005, T006, T007 can run in parallel within US2
  - US1 and US2 pages (T004, T008) depend on their respective components
  - US1 and US2 can proceed in parallel (no cross-dependencies)
- **Polish (Phase 5)**: Depends on both user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Depends on T001; no dependencies on US2
- **User Story 2 (P1)**: Depends on T001; no dependencies on US1

### Within Each User Story

- Components ([P]) can run in parallel
- Page task depends on all components for that story

### Parallel Opportunities

- T002/T003 (US1 components) can run in parallel
- T005/T006/T007 (US2 components) can run in parallel
- US1 and US2 component groups can run in parallel (T002/T003 with T005/T006/T007)
- T010 (tree-shake) and T011 (build) can run in parallel once code is done

---

## Parallel Example: All Components

```bash
# Launch all US1 component tasks together:
Task: "T002 [P] [US1] Create CouponsTable..."
Task: "T003 [P] [US1] Create CouponFormDialog..."

# Launch all US2 component tasks together:
Task: "T005 [P] [US2] Create ZonesTable..."
Task: "T006 [P] [US2] Create ZoneFormDialog..."
Task: "T007 [P] [US2] Create RateFormDialog..."
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete T001 (foundational API wrappers)
2. Complete T002, T003, T004 (US1 — Coupons)
3. **STOP and VALIDATE**: `/admin/coupons` is fully functional
4. Deploy/demo if ready

### Incremental Delivery

1. T001 → Foundation ready
2. T002 + T003 + T004 → US1: Coupons management → Deploy/Demo (MVP!)
3. T005 + T006 + T007 + T008 → US2: Delivery Zones → Deploy/Demo
4. T009 + T010 + T011 → Polish and verify

### Sequential Team Strategy

With a single developer (default for this feature):

1. T001 (API wrappers — blocking for all)
2. T002 + T003 (US1 components — parallel)
3. T004 (US1 page — depends on T002, T003)
4. T005 + T006 + T007 (US2 components — parallel)
5. T008 (US2 page — depends on T005, T006, T007)
6. T009 + T010 + T011 (Polish & build)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- No new npm packages needed — all dependencies already in `package.json`
- Commit after each task or logical group (optional per user preference)
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
