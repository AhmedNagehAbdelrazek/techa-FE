---
description: "Task list for Layout, Navigation & Design System"
---

# Tasks: Layout, Navigation & Design System

**Input**: Design documents from `/specs/002-layout-navigation-design/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/layout-api.md, quickstart.md

**Tests**: Not requested in spec — no test tasks included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Single Next.js project with App Router. Source under `src/`, components under `src/components/`, stores under `src/lib/stores/`.

---

## Phase 1: Setup

**Purpose**: Add shadcn components needed by all phases

- [ ] T001 Add shadcn Sheet, Avatar, DropdownMenu, Separator, Input components via `npx shadcn@latest add sheet avatar dropdown-menu separator input`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Zustand stores and shared components that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T002 [P] Create settings store in src/lib/stores/settings.store.ts with siteName, logoUrl, currencyCode, currencySymbol, socialLinks, supportEmail, supportPhone, isLoading, error, and setSettings action
- [ ] T003 [P] Create cart store in src/lib/stores/cart.store.ts with itemCount, isLoading, fetchCart (calls GET /api/cart), and setItemCount action
- [ ] T004 [P] Create wishlist store in src/lib/stores/wishlist.store.ts with itemCount, isLoading, fetchWishlist (calls GET /api/wishlist), and setItemCount action
- [ ] T005 [P] Create Logo component in src/components/layout/Logo.tsx that renders site logo image (from logoUrl) or text fallback, links to `/`

**Checkpoint**: Foundation ready — user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Storefront Header & Footer Shell (Priority: P1) 🎯 MVP

**Goal**: A visitor can navigate the store via header and footer on desktop and mobile.

**Independent Test**: Navigate to the homepage. Header shows logo, search bar, cart badge (0), wishlist badge (0). Footer shows site links and copyright. Cart/wishlist badges update after mutations.

### Implementation for User Story 1

- [ ] T006 [P] [US1] Create Header component in src/components/layout/Header.tsx with logo (Logo component), search bar (navigates to /search?q=), cart icon with badge from cartStore, wishlist icon with badge from wishlistStore, and auth-aware controls (login/register buttons when unauthenticated, avatar dropdown with My Orders/My Account/Logout when authenticated)
- [ ] T007 [P] [US1] Create Footer component in src/components/layout/Footer.tsx with site name/tagline, static nav links (About, Contact, FAQs, Privacy Policy, Terms), social links from settingsStore, and copyright line
- [ ] T008 [US1] Create SettingsHydrator component in src/components/stores/SettingsHydrator.tsx that receives settings from server props and hydrates the settingsStore on mount
- [ ] T009 [US1] Create storefront layout shell in src/app/(store)/layout.tsx that fetches GET /api/settings/public on the server, passes settings to SettingsHydrator, and renders Header + Footer wrapping {children} with main content area

**Checkpoint**: Storefront layout renders on all (store) routes — header with working badges, footer with dynamic content

---

## Phase 4: User Story 2 - Admin Panel Layout (Priority: P1)

**Goal**: An admin can navigate the admin panel via sidebar and top bar with breadcrumbs and auth gate.

**Independent Test**: Log into the admin panel. Sidebar shows 11 nav links. Clicking each navigates correctly. Top bar shows admin name and logout. Unauthenticated users redirected to /admin/login.

### Implementation for User Story 2

- [ ] T010 [P] [US2] Create AdminSidebar component in src/components/layout/AdminSidebar.tsx with 11 nav links (Dashboard, Products, Categories, Brands, Tags, Orders, Coupons, Banners, Delivery Zones, Settings, Admins), active link highlighting based on current route, and collapsible drawer on mobile
- [ ] T011 [P] [US2] Create AdminTopBar component in src/components/layout/AdminTopBar.tsx with admin name/role fetched from GET /api/admin/auth/me and logout button
- [ ] T012 [P] [US2] Create Breadcrumbs component in src/components/layout/Breadcrumbs.tsx that derives breadcrumb trail from the current route path
- [ ] T013 [US2] Create admin layout shell in src/app/(admin)/layout.tsx that checks admin auth (redirects to /admin/login if unauthenticated), renders AdminSidebar + AdminTopBar + Breadcrumbs wrapping {children} in a content area

**Checkpoint**: Admin panel renders on all /admin routes with full navigation, auth gate working

---

## Phase 5: User Story 3 - Mobile Navigation (Priority: P2)

**Goal**: A visitor on mobile can navigate via hamburger menu with full-screen overlay.

**Independent Test**: Resize browser to 375px. Header shows hamburger icon. Tapping opens full-screen overlay with nav links. Tapping a link navigates and closes overlay.

### Implementation for User Story 3

- [ ] T014 [US3] Create MobileNav component in src/components/layout/MobileNav.tsx with hamburger button (visible below 768px) that opens a full-screen shadcn Sheet overlay containing navigation links, search input, and auth state (login/register or user menu), with close-on-navigate and close-on-click-outside behavior

**Checkpoint**: Mobile hamburger menu functional across all storefront pages

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verification that prerequisites are met and final validation

- [ ] T015 Verify AuthProvider is uncommented and working in src/app/layout.tsx (prerequisite for auth-state-aware header controls)
- [ ] T016 [P] Run lint and typecheck across all new files
- [ ] T017 Validate quickstart.md steps end-to-end on a fresh checkout

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — can start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — BLOCKS all user stories
- **Phase 3 (US1)**: Depends on Phase 2 — No dependencies on other stories
- **Phase 4 (US2)**: Depends on Phase 2 — No dependencies on other stories
- **Phase 5 (US3)**: Depends on Phase 2 — Integrates with US1 header (hamburger replaces desktop nav links) but should be independently testable
- **Phase 6 (Polish)**: Depends on all desired stories complete

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 2 — No dependencies on other stories
- **US2 (P1)**: Can start after Phase 2 — Independent of US1, can run in parallel
- **US3 (P2)**: Can start after Phase 2 — Closely related to US1 header but independently implementable

### Within Each User Story

- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Phase 2 tasks marked [P] can run in parallel
- All tasks within US1 marked [P] can run in parallel
- All tasks within US2 marked [P] can run in parallel
- US1 and US2 can run in parallel (different files, different route groups)
- US3 can be started independently once Phase 2 is complete

---

## Parallel Example: User Story 1

```bash
# Launch all components for User Story 1 together:
Task: "Create Header in src/components/layout/Header.tsx"
Task: "Create Footer in src/components/layout/Footer.tsx"
# Then after both complete:
Task: "Create SettingsHydrator in src/components/stores/SettingsHydrator.tsx"
Task: "Create (store)/layout.tsx in src/app/(store)/layout.tsx"
```

## Parallel Example: User Story 2

```bash
# Launch all components for User Story 2 together:
Task: "Create AdminSidebar in src/components/layout/AdminSidebar.tsx"
Task: "Create AdminTopBar in src/components/layout/AdminTopBar.tsx"
Task: "Create Breadcrumbs in src/components/layout/Breadcrumbs.tsx"
# Then after all complete:
Task: "Create (admin)/layout.tsx in src/app/(admin)/layout.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (shadcn components)
2. Complete Phase 2: Foundational (stores + Logo)
3. Complete Phase 3: User Story 1 (Header + Footer + storefront layout)
4. **STOP and VALIDATE**: Navigate storefront pages — header/footer renders, badges work
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 (Header/Footer) → Test independently → **MVP!**
3. Add US2 (Admin layout) → Test independently → Deploy
4. Add US3 (Mobile nav) → Test independently → Deploy
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:
1. Team completes Phase 1 + Phase 2 together
2. Once Foundational is done:
   - Developer A: US1 (Storefront layout)
   - Developer B: US2 (Admin layout)
3. Developer C can pick up US3 independently after Phase 2
4. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
