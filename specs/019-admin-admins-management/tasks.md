# Tasks: Admin Admins & Roles Management

**Input**: Design documents from `specs/019-admin-admins-management/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not requested in spec — no test tasks generated.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/` at repository root (Next.js App Router)
- All paths relative to repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No project initialization needed — existing Next.js project with all dependencies already in package.json.

- No tasks required in this phase.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: API layer shared by both User Stories — MUST be complete before either story can be implemented.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T001 Create API wrappers and inline types for admins & roles CRUD in `src/lib/api/admin-admins-roles.ts`

  **Details**: Implement `adminAdminsRolesKeys` React Query keys, `getAdmins()`, `createAdmin()`, `updateAdmin()`, `deactivateAdmin()`, `reactivateAdmin()`, `getRoles()`, `createRole()`, `updateRole()`, `deactivateRole()`. All use `adminRequest`. Inline TypeScript types: `AdminAccount`, `AdminRole`, `AdminAccountFormData`, `AdminRoleFormData`. Handle `role` field shape difference (string in list vs object in create/update). Handle `createdat`/`updatedat` lowercase camelCase from roles API.

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 — Super-Admin Manages Admin Accounts (Priority: P1) 🎯 MVP

**Goal**: Paginated table of all admin accounts with create/edit dialog, deactivate/reactivate toggle, self-deactivation handling, and permission gating via `"admins"` resource key.

**Independent Test**: Open `/admin/admins` as a super-admin → see table with all admins → create a new admin → verify it appears → edit the role → deactivate → reactivate → verify self-deactivation shows error toast.

### Implementation for User Story 1

- [ ] T002 [P] [US1] Create AdminAdminsTable component in `src/components/admin/AdminAdminsTable.tsx`

  **Details**: Data table with columns: name, email, role label (normalize string vs object), status badge (green "Active" / gray "Inactive" based on `is_active`), created date. Deactivate/Reactivate button per row with AlertDialog confirmation. Action columns gated by `permissions["admins"]?.includes("update")` / `"delete"`. Self-deactivation: compare logged-in admin ID, show warning in AlertDialog. Export `AdminAdminsTableSkeleton`. Pass `canUpdate`/`canDelete`/`currentAdminId` as props.

- [ ] T003 [US1] Create AdminFormDialog component in `src/components/admin/AdminFormDialog.tsx`

  **Details**: Dialog form using react-hook-form + zod. Fields: name (text, required), email (email, required), password (password, required on create / optional on edit, min 8 chars), role_id (dropdown, required — fetch roles from `GET /api/admin/roles` via React Query). On create: `POST /api/admin/admins`. On edit: `PUT /api/admin/admins/:id`. Password blank on edit = keep unchanged. Handle 409 duplicate email → inline field error. Handle roles fetch failure → disable dropdown + error toast + retry. Export `AdminFormDialogSkeleton`.

- [ ] T004 [US1] Create admin admins page in `src/app/admin/(protected)/admins/page.tsx`

  **Details**: Page wrapper that renders `AdminAdminsTable` + `AdminFormDialog`. Permission gate: redirect or show unauthorized state if `permissions["admins"]` lacks `"read"` and no `"all"`. Fetch admins list via React Query. Manage dialog open/close state and selected admin for edit.

---

## Phase 4: User Story 2 — Super-Admin Manages Roles (Priority: P2)

**Goal**: Table of all roles with create/edit dialog (grouped permission checkboxes), soft-delete deactivation with 409 conflict handling, sidebar link, and breadcrumb.

**Independent Test**: Open `/admin/roles` as a super-admin → see table with all roles → create a new role with specific permissions → edit the name/permissions → deactivate a role with no admins → verify it disappears → attempt to deactivate a role with admins → verify 409 error toast.

### Implementation for User Story 2

- [ ] T005 [P] [US2] Create AdminRolesTable component in `src/components/admin/AdminRolesTable.tsx`

  **Details**: Data table with columns: role name, permission count (count of all resource keys × actions), assigned admin count (N/A for now — display "—" or omit). Edit and Delete buttons per row. Edit opens RoleFormDialog in edit mode. Delete triggers AlertDialog confirmation, then calls `deactivateRole()`. Handle 409 conflict on deactivate → show error toast, keep item in grid. Export `AdminRolesTableSkeleton`.

- [ ] T006 [US2] Create RoleFormDialog component in `src/components/admin/RoleFormDialog.tsx`

  **Details**: Dialog form using controlled state (useState). Fields: name (text input, required). Permissions: grouped checkboxes. Each group is a resource key (products, orders, categories, brands, tags, coupons, zones, content, settings, media, admins). Each group has read/create/update/delete checkboxes. Pre-fill from existing role on edit. On create: `POST /api/admin/roles`. On edit: `PUT /api/admin/roles/:id`. Export `RoleFormDialogSkeleton`.

- [ ] T007 [US2] Create admin roles page in `src/app/admin/(protected)/roles/page.tsx`

  **Details**: Page wrapper that renders `AdminRolesTable` + `RoleFormDialog`. Permission gate: same as admins page (`"admins"` resource key). Fetch roles list via React Query. Manage dialog open/close state and selected role for edit.

- [ ] T008 [P] [US2] Add Roles link to admin sidebar in `src/components/layout/AdminSidebar.tsx`

  **Details**: Import `Shield` icon from lucide-react. Add `{ label: "Roles", href: "/admin/roles", icon: Shield }` to `navLinks` array (below the existing "Admins" link).

- [ ] T009 [P] [US2] Add roles segment label in `src/components/layout/Breadcrumbs.tsx`

  **Details**: Add `roles: "Roles"` entry to `segmentLabels` record.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final review, tree-shaking, and build verification.

- [ ] T010 Tree-shake and review all new files for unused imports, missing skeleton exports, consistent patterns
- [ ] T011 Build verification: run `pnpm run build` and fix any errors

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — nothing needed (existing project)
- **Foundational (Phase 2)**: T001 must complete — BLOCKS all user stories
- **User Stories (Phase 3+4)**: Both depend on T001 (Foundational) completion
  - US1 and US2 can proceed in parallel after T001
- **Polish (Phase 5)**: Depends on US1 and US2 being complete

### User Story Dependencies

- **User Story 1 (P1)**: Depends on T001 only — no dependency on US2
- **User Story 2 (P2)**: Depends on T001 only — no dependency on US1

### Within Each User Story

- Components first (table + dialog) → page assembly
- Sidebar/breadcrumbs last within US2 (conceptual dependency on page route existing)
- No test tasks (not requested)

### Parallel Opportunities

- T002 and T003 can run in parallel (different files, no dependencies on each other)
- T005 and T006 can run in parallel (different files, no dependencies on each other)
- T008 and T009 can run in parallel (different files, no dependencies)
- T002+T003 (US1) and T005+T006+T008+T009 (US2) can run in parallel after T001

---

## Parallel Example: User Story 1

```bash
# Run these in parallel:
Task: "Create AdminAdminsTable component in src/components/admin/AdminAdminsTable.tsx"
Task: "Create AdminFormDialog component in src/components/admin/AdminFormDialog.tsx"

# Then:
Task: "Create admin admins page in src/app/admin/(protected)/admins/page.tsx"
```

## Parallel Example: User Story 2

```bash
# Run these in parallel:
Task: "Create AdminRolesTable component in src/components/admin/AdminRolesTable.tsx"
Task: "Create RoleFormDialog component in src/components/admin/RoleFormDialog.tsx"
Task: "Add Roles link to admin sidebar in src/components/layout/AdminSidebar.tsx"
Task: "Add roles segment label in src/components/layout/Breadcrumbs.tsx"

# Then:
Task: "Create admin roles page in src/app/admin/(protected)/roles/page.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: T001 — API wrappers (Foundational)
2. Complete Phase 3: T002–T004 — Admin Accounts (US1 / P1)
3. **STOP and VALIDATE**: Test User Story 1 independently
4. Deploy/demo if ready

### Incremental Delivery

1. Complete Foundational (T001) → Foundation ready
2. Add US1 (Admin Accounts) → Test independently → Deploy/Demo (MVP!)
3. Add US2 (Roles) → Test independently → Deploy/Demo
4. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Single dev completes T001 (Foundational)
2. Once T001 is done:
   - Developer A: Phase 3 (US1 — Admin Accounts)
   - Developer B: Phase 4 (US2 — Roles)
3. Both stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
