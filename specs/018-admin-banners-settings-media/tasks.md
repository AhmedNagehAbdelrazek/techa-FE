---

description: "Implementation tasks for Admin Banners, Settings & Media"
---

# Tasks: Admin Banners, Settings & Media

**Input**: Design documents from `specs/018-admin-banners-settings-media/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not included in this phase (testing deferred per plan.md).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Project root**: `src/` at repository root
- Paths reflect the existing Next.js App Router structure

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No project initialization needed — existing Next.js project. Verify dependencies.

- [ ] T001 Verify all required shadcn/ui components are installed (Table, Dialog, AlertDialog, Badge, Button, Input, Textarea, Switch, Select, Calendar, Skeleton) — install any missing via `npx shadcn@latest add <component>`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: API layer that all three user stories depend on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T002 Create API wrappers in `src/lib/api/admin-banners-settings-media.ts` with: `adminBannerSettingsKeys` (React Query keys), types (`AdminBanner`, `Setting`, `AdminMediaFile`, `PaginationMeta`), and functions (`getBanners`, `createBanner`, `updateBanner`, `deleteBanner`, `getSettings`, `updateSettings`, `getMedia`, `uploadMedia`, `deleteMedia`). All use `adminRequest`.

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 — Admin Manages Banners (Priority: P1) 🎯 MVP

**Goal**: Admin can view, create, edit, and delete banners from `/admin/banners`.

**Independent Test**: Admin opens `/admin/banners`, sees empty state (no banners), clicks "Add Banner", fills form with title, image_url, position, starts_at, clicks save — banner appears in table with thumbnail and status badge.

### Implementation for User Story 1

- [ ] T003 [P] [US1] Create `src/components/admin/BannersTable.tsx` — data table with columns: image thumbnail (80x40px `<img>`), title, position, active period (`starts_at` → `ends_at`), sort_order, status badge (Active/Expired/Inactive). Empty state when no banners. Exports `BannersTableSkeleton`.
- [ ] T004 [P] [US1] Create `src/components/admin/BannerFormDialog.tsx` — Dialog with react-hook-form + zod form containing: title (Input), description (Textarea optional), image_url (Input with preview), link_url (Input optional), position (Select: hero/promo/sidebar/bottom), sort_order (Number Input), starts_at (date picker), ends_at (date picker optional — null = never expires), is_active (Switch). Exports `BannerFormDialogSkeleton`.
- [ ] T005 [US1] Create `src/app/admin/(protected)/banners/page.tsx` — page component using `BannersTable` with `BannerFormDialog`. Permission-gated: `content.read` for table access, `content.create` for add button, `content.update` for edit, `content.delete` for delete with AlertDialog.

**Checkpoint**: Banners page fully functional — admin can create, view, edit, and delete banners

---

## Phase 4: User Story 2 — Admin Manages Settings (Priority: P1)

**Goal**: Admin can view and update grouped settings from `/admin/settings`.

**Independent Test**: Admin opens `/admin/settings`, sees grouped form sections (General, Appearance, SEO, Payment, Social), modifies a `string` setting in General group, clicks "Save" for that group — toast confirms success, value persists on reload.

### Implementation for User Story 2

- [ ] T006 [P] [US2] Create `src/components/admin/SettingsGroup.tsx` — renders a single settings group with: group heading, per-setting row with dynamic input based on `type` (string→Input, textarea→Textarea, boolean→Switch, image→URL input + inline upload button, color→color picker, number→Number Input), "Save" button per group. Inactive settings (`is_active: false`) rendered dimmed with tooltip "Inactive setting". Exports `SettingsGroupSkeleton`.
- [ ] T007 [P] [US2] Create `src/components/admin/SettingsPage.tsx` — loads settings from API, groups them by `group` key, renders `SettingsGroup` for each. Exports `SettingsPageSkeleton`.
- [ ] T008 [US2] Create `src/app/admin/(protected)/settings/page.tsx` — page component using `SettingsPage`. Permission-gated: `settings.read` for page access, `settings.update` for save buttons.

**Checkpoint**: Settings page fully functional — admin can view and update all setting groups

---

## Phase 5: User Story 3 — Admin Manages Media Library (Priority: P2)

**Goal**: Admin can view, upload, copy URLs, and delete media files from `/admin/media`.

**Independent Test**: Admin opens `/admin/media`, sees paginated grid, drags a JPEG file onto upload zone — file appears in grid with thumbnail. Admin clicks "Copy URL" — URL copied to clipboard. Admin clicks delete on unused file — file removed from grid.

### Implementation for User Story 3

- [ ] T009 [P] [US3] Create `src/components/admin/MediaUploadZone.tsx` — drag-and-drop upload area with "Browse" button. Accepts JPEG, PNG, WebP, GIF (max 20MB). Supports multiple file selection. On drop/select, calls `uploadMedia` with `files[]` form field. Shows upload progress/status. Exports `MediaUploadZoneSkeleton`.
- [ ] T010 [P] [US3] Create `src/components/admin/MediaGrid.tsx` — paginated grid of `AdminMediaFile` with per-item: thumbnail (via `url`), filename, mime_type, file_size (human-readable), "Copy URL" button (`navigator.clipboard.writeText`), "Delete" button. Delete: calls `deleteMedia`, on 409 shows AlertDialog with error, on 200 refetches list. Exports `MediaGridSkeleton`.
- [ ] T011 [US3] Create `src/app/admin/(protected)/media/page.tsx` — page component using `MediaGrid` + `MediaUploadZone`. Permission-gated: `media.read` for grid, `media.create` for upload, `media.delete` for delete buttons.

**Checkpoint**: Media page fully functional — admin can list, upload, copy URLs, and delete media files

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Sidebar navigation and breadcrumb integration.

- [ ] T012 [P] Add "Media" link to `src/components/layout/AdminSidebar.tsx` in `navLinks` array with `Image` icon from `lucide-react` (Banners and Settings links already exist)
- [ ] T013 [P] Add `media: "Media"` entry to `segmentLabels` in `src/components/layout/Breadcrumbs.tsx` (banners and settings entries already exist)
- [ ] T014 Run `pnpm run build` to verify no type errors or build failures

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **Banners (Phase 3)**: Depends on Foundational — No dependency on other stories
- **Settings (Phase 4)**: Depends on Foundational — No dependency on other stories (standalone)
- **Media (Phase 5)**: Depends on Foundational — No dependency on other stories (standalone)
- **Polish (Phase 6)**: Depends on Media (needs Media link) — independent otherwise

### User Story Dependencies

- **US1 (Banners — P1)**: Can start after Foundational — Completely independent
- **US2 (Settings — P1)**: Can start after Foundational — Completely independent (separate API, separate page)
- **US3 (Media — P2)**: Can start after Foundational — Completely independent (separate API, separate page)

### Within Each User Story

- API wrappers exist in Foundational phase
- Components before pages
- Core implementation before integration with sidebar/breadcrumbs

### Parallel Opportunities

- T003 (BannersTable) and T004 (BannerFormDialog) can run in parallel within US1
- T006 (SettingsGroup) and T007 (SettingsPage) can run consecutively (SettingsPage depends on SettingsGroup)
- T009 (MediaUploadZone) and T010 (MediaGrid) can run in parallel within US3
- T012 (Sidebar) and T013 (Breadcrumbs) can run in parallel
- US1, US2, and US3 can be implemented in parallel by different developers (no cross-dependencies)

---

## Parallel Example: User Story 1 (Banners)

```bash
# Launch components together:
Task: "Create BannersTable.tsx"
Task: "Create BannerFormDialog.tsx"

# Then page (depends on components):
Task: "Create banner/page.tsx"
```

---

## Parallel Example: User Story 3 (Media)

```bash
# Launch both components together:
Task: "Create MediaUploadZone.tsx"
Task: "Create MediaGrid.tsx"

# Then page (depends on components):
Task: "Create media/page.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (API layer)
3. Complete Phase 3: User Story 1 (Banners)
4. **STOP and VALIDATE**: Test Banners independently
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add Banners (US1) → Test independently → Deploy/Demo (MVP!)
3. Add Settings (US2) → Test independently → Deploy/Demo
4. Add Media (US3) → Test independently → Deploy/Demo
5. Add Polish (sidebar, breadcrumbs) → Finalize

### Parallel Team Strategy

With multiple developers:

1. Complete Setup + Foundational together
2. Once Foundational is done:
   - Developer A: Banners (US1)
   - Developer B: Settings (US2)
   - Developer C: Media (US3)
3. Polish can be done by anyone after Media is done

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story
- Each user story is independently completable and testable
- No test tasks included (testing deferred per plan.md)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- 0 new npm packages needed — all dependencies already in package.json
