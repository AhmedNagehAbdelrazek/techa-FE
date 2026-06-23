# Tasks: Admin Categories, Brands & Tags

**Branch**: `016-admin-categories-brands-tags`
**Date**: 2026-06-23
**Spec**: `specs/016-admin-categories-brands-tags/spec.md`

## Phase 1: Setup

No project setup tasks required. All dependencies are already in `package.json`. No new shadcn wrappers needed.

## Phase 2: Foundational

- [ ] T001 Create `src/lib/api/admin-taxonomy.ts` — API wrappers and inline types for categories (list, create, update, deactivate), brands (list, create, update, deactivate), tags (list, create, update, delete). Use `adminRequest` from `AdminRequest.ts`. Export `adminTaxonomyKeys` React Query keys matching `adminProductsKeys`/`adminOrdersKeys` pattern. Permission checks via `useAdminStore` with granular `read`/`create`/`update`/`delete`.

## Phase 3: Admin Manages Categories — US1 (P1)

**Goal**: Category tree view with expand/collapse, create/edit via Dialog, deactivate with 409 handling.

**Independent Test**: An admin can open `/admin/categories`, add a new top-level category, verify it appears in the tree, edit its name, deactivate it, and confirm it disappears.

- [ ] T002 [P] [US1] Create `src/components/admin/CategoryTree.tsx` — recursive tree component rendering nested categories with expand/collapse via local `useState`, indentation per level (`padding-left`), edit/deactivate action buttons per node. Export `CategoryTreeSkeleton`. Use `useAdminStore` with `EMPTY_PERMISSIONS` for permission gating (`categories.update` for edit, `categories.delete` for deactivate). Handle 409 on deactivate with toast error (keep item visible).

- [ ] T003 [P] [US1] Create `src/components/admin/CategoryFormDialog.tsx` — create/edit Dialog for categories. Use `react-hook-form` + `zod` for validation. Fields: name (required), slug (auto-generated from name, manually editable), parent_id (dropdown of existing categories), image_url (text input), sort_order (number), is_active (toggle). Takes `initialData` prop (null for create, populated for edit) and `parentId` prop (pre-filled when adding subcategory from tree). On submit, calls create or update mutation; on success, invalidates `adminTaxonomyKeys.categories()`, closes Dialog, shows sonner toast; on error, shows toast with error.

- [ ] T004 [US1] Create `src/app/admin/(protected)/categories/page.tsx` — category management page. Uses `CategoryTree` and `CategoryFormDialog`. Adds "Add Category" button that opens the Dialog without a parent. Adds "Add Subcategory" button on tree nodes that opens the Dialog with `parentId` pre-filled. Uses `useAdminStore` granular permission gating (`categories.read` gates page, `categories.create` gates add, `categories.update` gates edit, `categories.delete` gates deactivate). Loading state uses `CategoryTreeSkeleton`. Empty state uses `EmptyState`.

## Phase 4: Admin Manages Brands — US2 (P1)

**Goal**: Paginated brands data table with create/edit via Dialog, deactivate with 409 handling.

**Independent Test**: An admin can open `/admin/brands`, create a new brand, verify it appears in the table, edit it, and deactivate it.

- [ ] T005 [P] [US2] Create `src/components/admin/BrandsTable.tsx` — paginated data table with columns: logo thumbnail (Image with fallback), name, slug, description, is_active (Badge), actions (Edit/Deactivate). Uses React Query with `adminTaxonomyKeys.brands()`. Pagination controls matching Phase 14 ProductsTable pattern. Export `BrandsTableSkeleton`. Permission gating via `useAdminStore`.

- [ ] T006 [P] [US2] Create `src/components/admin/BrandFormDialog.tsx` — create/edit Dialog for brands. Use `react-hook-form` + `zod`. Fields: name (required), slug (auto-generated), logo_url (text input with preview), description (textarea), is_active (toggle). Same mutation/invalidation/toast pattern as `CategoryFormDialog`.

- [ ] T007 [US2] Create `src/app/admin/(protected)/brands/page.tsx` — brand management page. Uses `BrandsTable` and `BrandFormDialog`. Permission gating (`brands.read/create/update/delete`). Loading/empty/error states.

## Phase 5: Admin Manages Tags — US3 (P2)

**Goal**: Flat tags list with inline edit and delete via AlertDialog.

**Independent Test**: An admin can open `/admin/tags`, add a new tag, edit its name inline, and delete it.

- [ ] T008 [P] [US3] Create `src/components/admin/TagsList.tsx` — flat list of tags. Each row shows name, slug, Edit/Delete buttons. Edit: click opens inline input (save on Enter/blur, cancel on Escape). Delete: AlertDialog confirmation then hard delete. Add tag: input at top of list with submit button. Uses React Query with `adminTaxonomyKeys.tags()`. Export `TagsListSkeleton`. Permission gating (`tags.read/create/update/delete`).

- [ ] T009 [US3] Create `src/app/admin/(protected)/tags/page.tsx` — tag management page. Uses `TagsList`. Permission gating. Loading/empty/error states.

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T010 Update `src/components/layout/AdminSidebar.tsx` — add sidebar nav links for Categories (`/admin/categories`, `FolderTree` icon), Brands (`/admin/brands`, `Tag` icon), Tags (`/admin/tags`, `Tags` icon). Maintain alphabetic ordering with existing links.

- [ ] T011 Tree-shake / final review — verify all imports are used, no dead code, all skeleton exports named correctly.

- [ ] T012 Build verification — `pnpm run build` passes with zero errors.

## Dependency Graph

```
Phase 2 (T001) ────────────────────┐
                                   │
                    ┌──────────────┼──────────────┐
                    ▼              ▼              ▼
             Phase 3 US1     Phase 4 US2     Phase 5 US3
             (T002-T004)     (T005-T007)     (T008-T009)
                    │              │              │
                    └──────────────┼──────────────┘
                                   ▼
                          Phase 6 (T010-T012)
```

## Parallel Execution Opportunities

| Story | Tasks | Parallelizes With | Notes |
|-------|-------|-------------------|-------|
| US1 Categories | T002-T004 | US2 (T005-T007), US3 (T008-T009) | After T001 completes |
| US2 Brands | T005-T007 | US1 (T002-T004), US3 (T008-T009) | After T001 completes |
| US3 Tags | T008-T009 | US1 (T002-T004), US2 (T005-T007) | After T001 completes |
| Within US1 | T002, T003 | Each other (different files) | T004 depends on T002+T003 |
| Within US2 | T005, T006 | Each other (different files) | T007 depends on T005+T006 |
| Within US3 | T008 | Alone | T009 depends on T008 |

## Implementation Strategy

**MVP Scope**: US1 (Categories) + US2 (Brands) — both are P1 and block product management.

**Incremental Delivery**:
1. T001 (API wrapper) — foundational
2. T002+T003 (Category components) — parallel
3. T004 (Categories page) — depends on T002+T003
4. T005+T006 (Brand components) — parallel with step 2
5. T007 (Brands page) — depends on T005+T006
6. T008 (Tags component) — parallel with steps 2-5
7. T009 (Tags page) — depends on T008
8. T010-T012 (Polish + build)

**Total tasks**: 12 (T001-T012)
