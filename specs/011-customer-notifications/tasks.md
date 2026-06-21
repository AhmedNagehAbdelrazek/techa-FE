---

description: "Task list for Customer Notifications feature"

---

# Tasks: Customer Notifications

**Input**: Design documents from `specs/011-customer-notifications/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not explicitly requested in spec — tests omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

- Single Next.js project under `src/` at repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

No setup tasks required — project infrastructure is already in place (Next.js 15, TypeScript 5, shadcn/ui, etc.).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core types and API wrappers that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T001 Create notification types (`Notification`, `NotificationsListResponse`, `NotificationsQueryParams`, `Meta` with `unread_count`) in `src/lib/types/notification.ts`
- [x] T002 [P] Create notification API wrapper (`getNotifications`, `markAsRead`, `markAllAsRead`) in `src/lib/api/notifications.ts`

**Checkpoint**: Foundation ready — user story implementation can now begin in parallel

---

## Phase 3: User Story 1 — View Notifications from Header (Priority: P1) 🎯 MVP

**Goal**: Customers can see a notification bell icon in the header with an unread count badge, and view their 5 most recent notifications in a dropdown panel.

**Independent Test**: An authenticated customer with one unread notification sees the bell icon with a "1" badge. Clicking the bell opens a dropdown showing the notification. Opening the dropdown marks the notification as read (badge updates to 0).

### Implementation for User Story 1

- [x] T003 [P] [US1] Create `NotificationBell` component (bell icon + unread badge) in `src/components/store/NotificationBell.tsx`
- [x] T004 [US1] Create `NotificationDropdown` component (custom positioned panel with 5 most recent notifications, title, message preview, relative timestamp, read/unread indicator, "View all" link) in `src/components/store/NotificationDropdown.tsx`
- [x] T005 [US1] Integrate `NotificationBell` into header navigation in `src/components/layout/Header.tsx`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently.

---

## Phase 4: User Story 2 — Full Notifications List Page (Priority: P2)

**Goal**: Customers can view all their notifications on a dedicated `/notifications` page, mark individual notifications as read, and mark all as read at once.

**Independent Test**: An authenticated customer visits `/notifications`, sees a paginated list of all notifications. They click "Mark all as read" and all notifications show as read with the badge updating to zero.

### Implementation for User Story 2

- [x] T006 [P] [US2] Create `NotificationList` component (full paginated list with loading, error, empty states) in `src/components/store/NotificationList.tsx`
- [x] T007 [US2] Create notifications page with `ProtectedRoute`, pagination controls, and Mark all as read button in `src/app/(store)/notifications/page.tsx`

**Checkpoint**: Both user stories should now be independently functional.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories.

- [x] T008 [P] Run accessibility audit on all notification components — verify WCAG 2.1 Level AA compliance (aria labels, keyboard nav, focus management, screen reader announcements)
- [x] T009 [P] Verify RTL layout for notification dropdown and notifications page (Arabic-first positioning)
- [x] T010 Run `npm run build` to verify production build passes with no errors

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No work needed — project infrastructure already exists
- **Foundational (Phase 2)**: Blocks all user stories — types and API wrappers required by both US1 and US2
- **User Stories (Phase 3, 4)**: Both depend on Foundational phase completion
  - US1 (P1) → can proceed first as MVP
  - US2 (P2) → can proceed independently after foundational
- **Polish (Phase 5)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Phase 2 — no dependencies on US2
- **User Story 2 (P2)**: Can start after Phase 2 — no dependencies on US1
- Both stories are **independent** — they share types and API wrappers but do not share UI components

### Within Each User Story

- Types first → API wrappers next → components next → pages/integration last

### Parallel Opportunities

- T001 and T002 in Phase 2 can run in parallel (different files)
- T003 and T004 in Phase 3 can run in parallel (different files)
- T006 in Phase 4 is independent within its phase
- US1 and US2 can be implemented in parallel by different developers after Phase 2 completes
- T008 and T009 in Polish phase can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch bell and dropdown together:
Task: "Create NotificationBell component in src/components/store/NotificationBell.tsx"
Task: "Create NotificationDropdown component in src/components/store/NotificationDropdown.tsx"
```

## Parallel Example: Phase 2 Foundational

```bash
# Launch types and API wrapper together:
Task: "Create notification types in src/lib/types/notification.ts"
Task: "Create notification API wrapper in src/lib/api/notifications.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational (types + API wrappers)
2. Complete Phase 3: User Story 1 (bell + dropdown + header integration)
3. **STOP and VALIDATE**: Test User Story 1 independently — bell badge shows count, dropdown opens with notifications
4. Deploy/demo if ready

### Incremental Delivery

1. Complete Phase 2 → Foundation ready
2. Add User Story 1 → Test independently (MVP — bell + dropdown in header)
3. Add User Story 2 → Test independently (full notifications page)
4. Polish → accessibility, RTL, build verification

### Parallel Team Strategy

With multiple developers:
1. Developer A: T001 (types)
2. Developer B: T002 (API wrapper)
3. After Phase 2:
   - Developer A: T003 + T004 + T005 (US1 — bell, dropdown, header)
   - Developer B: T006 + T007 (US2 — notification list, page)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- No test tasks included per spec (no explicit testing requirements)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
