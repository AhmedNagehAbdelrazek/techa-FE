---

description: "Task list for Admin Panel — Products (Phase 14)"
---

# Tasks: Admin Panel — Products

**Input**: Design documents from `specs/014-admin-products/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not requested — testing deferred per plan.md ("Vitest + @testing-library/react not used in this phase").

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/` at repository root
- Paths shown below assume single project — adjust based on plan.md structure

## Phase 1: Setup — Shared Infrastructure

**Purpose**: Create 9 shadcn UI wrappers and install any missing npm packages needed by all user stories.

- [ ] T001 Install missing radix packages: `pnpm add @radix-ui/react-checkbox @radix-ui/react-popover cmdk`
- [ ] T002 [P] Create shadcn Tabs wrapper in `src/components/ui/tabs.tsx` using `@radix-ui/react-tabs`
- [ ] T003 [P] Create shadcn Dialog wrapper in `src/components/ui/dialog.tsx` using `@radix-ui/react-dialog`
- [ ] T004 [P] Create shadcn Table wrapper in `src/components/ui/table.tsx` (native `<table>` with Tailwind styling)
- [ ] T005 [P] Create shadcn Checkbox wrapper in `src/components/ui/checkbox.tsx` using `@radix-ui/react-checkbox`
- [ ] T006 [P] Create shadcn Textarea wrapper in `src/components/ui/textarea.tsx` (native `<textarea>` with Tailwind, mirrors Input.tsx pattern)
- [ ] T007 [P] Create shadcn Label wrapper in `src/components/ui/label.tsx` using `@radix-ui/react-label`
- [ ] T008 [P] Create shadcn Command wrapper in `src/components/ui/command.tsx` using `cmdk`
- [ ] T009 [P] Create shadcn Popover wrapper in `src/components/ui/popover.tsx` using `@radix-ui/react-popover`
- [ ] T010 [P] Create shadcn Form wrapper in `src/components/ui/form.tsx` using react-hook-form `useFormContext` + `@radix-ui/react-label`

**Checkpoint**: All shadcn UI wrappers exist and are importable. Build should pass.

---

## Phase 2: Foundational — Blocking Prerequisites

**Purpose**: API layer that MUST be complete before ANY user story can be implemented.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T011 Create `src/lib/api/admin-products.ts` — inline TypeScript types (ProductListItem, ProductDetail, ProductListResponse, ProductImage, ProductVariant, ProductAttribute, CreateProductPayload, UpdateProductPayload, AdminProductListParams, CategoryOption, BrandOption, TagOption)
- [ ] T012 Create API wrapper functions in `src/lib/api/admin-products.ts`: `getProducts`, `getProduct`, `createProduct`, `updateProduct`, `deleteProduct`, `bulkUpdateProducts`
- [ ] T013 [P] Create API wrapper functions in `src/lib/api/admin-products.ts`: `getCategoryOptions`, `getBrandOptions`, `getTagOptions`, `uploadMedia`
- [ ] T014 Create query key factory `adminProductsKeys` in `src/lib/api/admin-products.ts` for React Query cache management

**Checkpoint**: API wrappers are importable and typed. Foundation ready — user stories can now begin.

---

## Phase 3: User Story 1 — Browse and Manage Products List (Priority: P1) 🎯 MVP

**Goal**: An admin lands on `/admin/products` and sees a searchable, filterable, paginated data table of all products with bulk actions and permission-gated controls.

**Independent Test**: Navigate to `/admin/products` — table renders with products, search/filter updates results, pagination works, bulk activate/deactivate completes with toast.

### Implementation for User Story 1

- [ ] T015 [US1] Create `src/components/admin/ProductsTable.tsx` — paginated data table with columns: checkbox, thumbnail, name, category, brand, price, stock, status, actions
- [ ] T016 [US1] Implement search bar with 300ms debounce in `ProductsTable.tsx` — syncs `?search=` to URL via `useRouter.replace`
- [ ] T017 [P] [US1] Implement category/brand/status filter dropdowns in `ProductsTable.tsx` — preload options via React Query with `staleTime: Infinity`
- [ ] T018 [US1] Implement checkbox multi-select with select-all in `ProductsTable.tsx` — `Set<string>` state for selected IDs
- [ ] T019 [US1] Implement bulk action bar (Activate/Deactivate) in `ProductsTable.tsx` — calls `bulkUpdateProducts` mutation, invalidates list, shows toast
- [ ] T020 [US1] Implement pagination with page buttons, prev/next, ellipsis in `ProductsTable.tsx`
- [ ] T021 [US1] Create loading skeleton `ProductsTableSkeleton` exported from `ProductsTable.tsx`
- [ ] T022 [P] [US1] Add permission gating in `ProductsTable.tsx` — gated by `products.read/update/delete` from `useAdminStore`
- [ ] T023 [US1] Create `src/app/admin/(protected)/products/page.tsx` — products list page with Suspense wrapper for `useSearchParams`
- [ ] T024 [US1] Create `ProductsPageContent` component in the page file: reads URL search params, renders `<ProductsTable />` with React Query, shows "Add Product" button gated by `products.create`

**Checkpoint**: Products list is functional — search, filters, pagination, bulk actions all work independently of the form pages.

---

## Phase 4: User Story 2 — Create a New Product (Priority: P1) 🎯 MVP

**Goal**: An admin clicks "Add Product" and fills a multi-tab form (Basic Info, Attributes, Images, Tags, Variants) to create a new product.

**Independent Test**: Fill form with required fields (name, category, base_price) and submit — product appears in the list with a success toast.

### Implementation for User Story 2

- [ ] T025 [US2] Create `src/components/admin/ProductFormBasicInfo.tsx` — name (required), slug (auto-generated), description, category (required), brand, base_price (required), discount_percent, is_featured, is_active
- [ ] T026 [US2] Implement slug auto-generation in `ProductFormBasicInfo.tsx` — sluggify from name, stop auto-gen after manual edit (track via ref)
- [ ] T027 [US2] Create `src/components/admin/ProductFormAttributes.tsx` — two `useFieldArray` sections: "Details" and "Specs" key-value pairs, each max 20 items, add/remove buttons
- [ ] T028 [US2] Create `src/components/admin/ProductFormImages.tsx` — file input, upload via `uploadMedia`, thumbnail previews, primary toggle, sort order, remove button
- [ ] T029 [US2] Create `src/components/admin/ProductFormTags.tsx` — multi-select combobox using Command + Popover, search existing tags, inline tag creation, selected tags shown as badges
- [ ] T030 [US2] Create `src/components/admin/ProductFormVariants.tsx` — `useFieldArray` for variants, each with option key-value pairs, SKU, price, stock, discount, images, remove button, duplicate detection
- [ ] T031 [US2] Create `src/components/admin/ProductForm.tsx` — tab container with Tabs (5 tabs), single `useForm` + `zodResolver`, validates name (required), base_price (required, positive), category_id (required)
- [ ] T032 [US2] Implement submit logic in `ProductForm.tsx` — `useMutation(createProduct)`, invalidate list query, redirect to `/admin/products`, success toast
- [ ] T033 [US2] Implement unsaved changes warning in `ProductForm.tsx` — `formState.isDirty` + `beforeunload` event + route change intercept
- [ ] T034 [US2] Create `src/app/admin/(protected)/products/new/page.tsx` — renders `<ProductForm mode="create" />` with page title "Add Product"

**Checkpoint**: Product creation is fully functional — can create a product with all 5 tabs filled, see it in the list.

---

## Phase 5: User Story 3 — Edit an Existing Product (Priority: P2)

**Goal**: An admin clicks "Edit" on a product and sees the same multi-tab form pre-populated with existing data. They can modify fields, manage variants (add/update/remove with `_destroy`), soft-delete the product.

**Independent Test**: Navigate to edit page of a product, modify a field, save — change reflected in the product list. Deactivate a product — status changes to inactive.

### Implementation for User Story 3

- [ ] T035 [US3] Create `src/app/admin/(protected)/products/[id]/edit/page.tsx` — fetch product via `useQuery(getProduct)`, pass `initialData` to `<ProductForm mode="edit" />`, loading skeleton, error state with retry
- [ ] T036 [US3] Implement edit mode in `ProductForm.tsx` — pre-populate `defaultValues` from `initialData`, pass `productId` to mutation
- [ ] T037 [US3] Implement edit submit logic in `ProductForm.tsx` — `useMutation(updateProduct)` with `productId`, `version` in payload, invalidate list + detail queries
- [ ] T038 [US3] Implement variant `_destroy` in edit mode — track removed variants client-side, include `{ id, version, _destroy: true }` on submit
- [ ] T039 [US3] Implement deactivation in `ProductsTable.tsx` — "Deactivate" button per row, confirmation dialog via AlertDialog, calls `deleteProduct` mutation
- [ ] T040 [US3] Handle optimistic locking conflict (HTTP 409) in edit mode — toast "modified by another admin" on version mismatch
- [ ] T041 [US3] Add edit link to product name and "Edit" button in `ProductsTable.tsx` — link to `/admin/products/[id]/edit`, gated by `products.update`

**Checkpoint**: Product editing is fully functional — can edit any field, add/update/remove variants, deactivate product. All 3 user stories complete.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Sidebar link, error/empty states, build verification, final review.

- [ ] T042 Add "Products" link to admin sidebar navigation in the existing sidebar component — links to `/admin/products`, gated by `products.read` permission
- [ ] T043 Add empty state to `ProductsTable.tsx` — `<EmptyState>` with "No products found" + "Clear Filters" button when filters active
- [ ] T044 Add error state to `ProductsTable.tsx` — `<ErrorState>` with retry button when API fails
- [ ] T045 Add error/loading states to `ProductForm.tsx` — loading spinner on submit, toast on API error, disabled fields during submission
- [ ] T046 Tree-shake / final review — remove unused imports, verify all files export correctly, confirm no dead code
- [ ] T047 Build verification — run `pnpm run lint` and `pnpm run build`, fix any errors

**Checkpoint**: Feature complete — all user stories implemented, lint passes, build succeeds.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational completion — No dependencies on other stories
- **User Story 2 (Phase 4)**: Depends on Foundational completion — No dependencies on US1 (independent form)
- **User Story 3 (Phase 5)**: Depends on Foundational + US2 completion (reuses ProductForm from US2) — US1 not blocking
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) — No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) — No dependencies on other stories
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) — Depends on ProductForm component from US2; ProductsTable changes are additive

### Within Each User Story

- Models (types) before API wrappers
- API wrappers before components
- Components before pages
- Core implementation before integration

### Parallel Opportunities

- All Phase 1 shadcn wrapper tasks (T002–T010) can run in parallel
- Phase 2 API tasks T012 and T013 can run in parallel (same file but different wrappers)
- Phase 3 filter dropdowns (T017) can run in parallel with search (T016)
- Phase 4 form tab components (T025–T030) can all run in parallel
- US1 and US2 can be implemented in parallel (no cross-dependencies)

---

## Parallel Example: User Story 1

```bash
# Launch all parallel tasks for US1 together:
Task: "Implement category/brand/status filter dropdowns in ProductsTable.tsx"
Task: "Create loading skeleton ProductsTableSkeleton exported from ProductsTable.tsx"
Task: "Add permission gating in ProductsTable.tsx"
```

## Parallel Example: User Story 2

```bash
# Launch all 6 form tab components in parallel:
Task: "Create ProductFormBasicInfo.tsx"
Task: "Create ProductFormAttributes.tsx"
Task: "Create ProductFormImages.tsx"
Task: "Create ProductFormTags.tsx"
Task: "Create ProductFormVariants.tsx"
Task: "Create ProductForm.tsx container"
```

---

## Implementation Strategy

### MVP First (User Story 1 + User Story 2)

1. Complete Phase 1: Setup — 9 shadcn wrappers + npm packages
2. Complete Phase 2: Foundational — API wrappers (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 — Products list table
4. Complete Phase 4: User Story 2 — Product creation form
5. **STOP and VALIDATE**: Create a product, see it in the list, search/filter/paginate
6. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add US1 (Products List) → Test independently → Can browse products
3. Add US2 (Create Product) → Test independently → Can create products (MVP!)
4. Add US3 (Edit Product) → Test independently → Full product lifecycle
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Products List)
   - Developer B: User Story 2 (Create Product) + all form tabs
3. Developer A can then help with User Story 3 (Edit Product)
4. Polish phase done together

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- No test tasks — testing deferred per spec (Vitest + @testing-library/react not used in this phase)
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
