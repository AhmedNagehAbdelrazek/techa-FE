---

description: "Task list for Customer Auth Foundation implementation"

---

# Tasks: Customer Auth Foundation

**Input**: Design documents from `/specs/001-customer-auth-foundation/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/auth-api.md, quickstart.md

**Tests**: Tests are NOT explicitly requested in the feature spec. Focus on implementation tasks only.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Next.js App Router project at repository root
- Pages: `src/app/(store)/`
- Components: `src/components/auth/`
- API client: `src/lib/api/auth.ts`
- State: `src/lib/stores/auth.store.ts`
- Types: `src/lib/types/auth.ts`
- Middleware: `src/middleware.ts`
- UI primitives: `src/components/ui/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project directories and environment alignment

- [ ] T001 Create `src/app/(store)/` route group directories: login, register, verify-email, forgot-password, reset-password, account
- [ ] T002 Rename `NEXT_PUBLIC_BACKEND_URL` to `NEXT_PUBLIC_API_URL` in `.env.local` to match `src/lib/api/endpoints.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T003 [P] Create TypeScript auth interfaces in `src/lib/types/auth.ts` — AuthResponse, User, RegisterPayload, LoginPayload, VerifyEmailPayload, ResendVerificationPayload, ForgotPasswordPayload, ResetPasswordPayload, UpdateProfilePayload, ApiError
- [ ] T004 [P] Extend Zustand auth store in `src/lib/stores/auth.store.ts` — add `isAuthenticated`, `isLoading`, `error` state; add `setToken`, `hydrateFromStorage`, `logout` actions; remove `status` field in favor of `isAuthenticated` boolean
- [ ] T005 [P] Create typed auth API wrapper in `src/lib/api/auth.ts` — functions: register, verifyEmail, resendVerification, login, getMe, updateMe, logout, forgotPassword, resetPassword; all use existing `request` from `Request.ts`
- [ ] T006 Fix AuthProvider import path in `src/components/providers/AuthProvider.tsx` — change `@/stores/auth` to `@/lib/stores/auth`
- [ ] T007 Update AuthProvider in `src/components/providers/AuthProvider.tsx` — replace `setTokenGetter` with `hydrateFromStorage` call on mount; wire `onUnauthorized` callback to call `logout` action
- [ ] T008 Uncomment `<AuthProvider>` wrapper in `src/app/layout.tsx` to enable auth hydration on app boot
- [ ] T009 [P] Update Next.js middleware in `src/middleware.ts` — add auth redirect logic: check for `access_token` cookie, redirect unauthenticated users from `/account` to `/login?next=<path>`
- [ ] T010 [P] Wire sonner toast in `src/services/client.ts` response interceptor to show auth errors as toasts

**Checkpoint**: Foundation ready — user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Register a New Account (Priority: P1) 🎯 MVP

**Goal**: A first-time visitor can create an account with name, email, phone, and password

**Independent Test**: Navigate to `/register`, fill in all required fields, submit, verify success message and redirect to `/verify-email`

### Implementation for User Story 1

- [ ] T011 [US1] Create RegisterForm component in `src/components/auth/RegisterForm.tsx` — fields: full_name, email, phone, password, confirm_password; uses react-hook-form with zod validation schema; submits to `register()` API; shows inline field errors; disables button with spinner on submit
- [ ] T012 [US1] Create registration page in `src/app/(store)/register/page.tsx` — renders RegisterForm component, simple centered layout with branding
- [ ] T013 [US1] Handle server error responses in RegisterForm — map 409 (duplicate email) to inline email field error; show toast for 429 (rate limited) and network errors; handle 422 validation errors inline

**Checkpoint**: Registration flow works end-to-end — user fills form, submits, sees validation, succeeds with redirect to /verify-email

---

## Phase 4: User Story 2 - Verify Email Address (Priority: P1)

**Goal**: A newly registered customer verifies their email using a 6-digit code

**Independent Test**: Register a new account, get redirected to `/verify-email`, enter the 6-digit code, verify success and redirect to `/login`

### Implementation for User Story 2

- [ ] T014 [US2] Create VerifyEmailForm component in `src/components/auth/VerifyEmailForm.tsx` — 6-digit code input (single input or 6 individual digit inputs), "Resend code" button with 60s countdown timer; submits to `verifyEmail()` API; shows inline error for invalid/expired code
- [ ] T015 [US2] Create verify-email page in `src/app/(store)/verify-email/page.tsx` — renders VerifyEmailForm, includes email query param pre-fill from registration flow; redirect to `/login` on success
- [ ] T016 [US2] Handle resend verification flow — "Resend code" button calls `resendVerification()` API; 60s countdown disables button with visual timer; toast on success/error

**Checkpoint**: Email verification works end-to-end — user enters code, sees validation, succeeds with redirect to /login

---

## Phase 5: User Story 3 - Log In (Priority: P1)

**Goal**: A verified customer can log in with email and password

**Independent Test**: Register, verify email, navigate to `/login`, enter credentials, verify redirect to home page (or to a protected page via `?next=`)

### Implementation for User Story 3

- [ ] T017 [US3] Create LoginForm component in `src/components/auth/LoginForm.tsx` — fields: email, password; "Forgot password?" link below form; submits to `login()` API; reads `next` query param for post-login redirect; shows inline error for invalid credentials; distinguishes unverified email error (with link to /verify-email) from invalid credentials
- [ ] T018 [US3] Create login page in `src/app/(store)/login/page.tsx` — renders LoginForm, centered layout with branding; reads `next` query param from URL
- [ ] T019 [US3] Create ProtectedRoute component in `src/components/auth/ProtectedRoute.tsx` — client component that checks `useAuthStore.isAuthenticated`; if not authenticated, redirects to `/login?next=<current_path>`; renders children when authenticated; handles loading state during hydration

**Checkpoint**: Login flow works end-to-end — user enters credentials, sees validation, succeeds with redirect to target page

---

## Phase 6: User Story 4 - Forgot & Reset Password (Priority: P2)

**Goal**: A customer who forgot their password can request a reset code and set a new password

**Independent Test**: Navigate to `/forgot-password`, enter email, receive code, navigate to `/reset-password`, enter code and new password, verify redirect to `/login`

### Implementation for User Story 4

- [ ] T020 [US4] Create ForgotPasswordForm component in `src/components/auth/ForgotPasswordForm.tsx` — email input only; submits to `forgotPassword()` API; always shows success message (prevents email enumeration); "Back to login" link
- [ ] T021 [US4] Create forgot-password page in `src/app/(store)/forgot-password/page.tsx` — renders ForgotPasswordForm, centered layout
- [ ] T022 [US4] Create ResetPasswordForm component in `src/components/auth/ResetPasswordForm.tsx` — fields: 6-digit code input, new_password, confirm_password; submits to `resetPassword()` API; shows inline error for expired/incorrect code
- [ ] T023 [US4] Create reset-password page in `src/app/(store)/reset-password/page.tsx` — renders ResetPasswordForm, centered layout; accepts email query param to pre-fill

**Checkpoint**: Password reset flow works end-to-end — user requests reset, enters code and new password, succeeds with redirect to /login

---

## Phase 7: User Story 5 - View and Edit Profile (Priority: P2)

**Goal**: An authenticated customer can view and update their profile information

**Independent Test**: Log in, navigate to `/account`, view pre-populated profile, edit name/phone, verify changes persist on reload

### Implementation for User Story 5

- [ ] T024 [US5] Create ProfileForm component in `src/components/auth/ProfileForm.tsx` — pre-populated fields: full_name (mapped from `name`), phone, email (read-only), avatar display; submits to `updateMe()` API via PATCH; shows inline validation errors; loading state on save
- [ ] T025 [US5] Create account page in `src/app/(store)/account/page.tsx` — wraps content in ProtectedRoute; renders ProfileForm; fetches user data via `getMe()` API on mount if store isn't hydrated; handles session expiry (401 → redirect to login)

**Checkpoint**: Profile viewing and editing works — user sees data, edits fields, saves, and changes persist

---

## Phase 8: User Story 6 - Log Out (Priority: P3)

**Goal**: An authenticated customer can log out of their account

**Independent Test**: Log in, click "Logout", verify redirect to home page in unauthenticated state (protected pages redirect to /login)

### Implementation for User Story 6

- [ ] T026 [US6] Add logout action to auth store in `src/lib/stores/auth.store.ts` — clear `user`, set `isAuthenticated` to false, reset `isLoading`
- [ ] T027 [US6] Create logout handler — can be a simple button or link that calls `logout()` API then store's `logout()` action; redirects to `/` on success
- [ ] T028 [US6] Add logout button to ProtectedRoute or account page — visible only when authenticated; calls logout flow on click

**Checkpoint**: Logout works — authenticated user clicks logout, redirected to home, protected routes redirect to /login

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T029 Normalize email to lowercase before sending in all auth API calls (register, login, forgot-password, reset-password)
- [ ] T030 Add loading skeleton states to all auth pages while initial data loads
- [ ] T031 Ensure all auth pages are responsive at 375px width (test all form layouts)
- [ ] T032 Add aria-labels to all interactive elements in auth forms for accessibility
- [ ] T033 Run quickstart.md validation steps and fix any issues found

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Stories (Phase 3–8)**: All depend on Foundational phase completion
  - US1 (T011–T013): No user story dependencies
  - US2 (T014–T016): Depends on US1 (the registration flow feeds into verify-email redirect)
  - US3 (T017–T019): Depends on US1 and US2 (login requires a registered + verified user)
  - US4 (T020–T023): No dependency on US1–US3 (standalone flow, no auth required)
  - US5 (T024–T025): Depends on US3 (requires authentication; uses auth store)
  - US6 (T026–T028): Depends on US3 (requires authentication to test)
- **Polish (Phase 9)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 Register (P1)**: Can start after Foundational — No dependencies on other stories (server-side verification assumed)
- **US2 Verify Email (P1)**: Independent component — can be developed alongside US1 but requires US1 for end-to-end test
- **US3 Login (P1)**: Depends on US1 + US2 being complete for end-to-end testing, but the form component is independently buildable
- **US4 Forgot/Reset Password (P2)**: Completely independent of US1–US3 — can be developed in parallel
- **US5 Profile (P2)**: Depends on US3 — requires auth state/store
- **US6 Logout (P3)**: Depends on US3 — requires auth state/store

### Within Each User Story

- API wrapper functions (Phase 2) must exist before user story components
- Components before pages
- Validation and error handling within the same task
- Story complete before moving to next priority

### Parallel Opportunities

- All Phase 1 tasks marked [P] can run in parallel
- T003, T004, T005, T007, T008, T010 can run in parallel (Phase 2)
- T009 (middleware) is independent of other Phase 2 tasks
- US4 can be developed in parallel with US1, US2, US3 since it has no dependencies
- All tasks within the same phase marked [P] can run in parallel

---

## Parallel Example: Phase 2 Foundational

```bash
# Launch all foundational parallel tasks together:
Task: "T003 Create TypeScript auth interfaces"
Task: "T004 Extend Zustand auth store"
Task: "T005 Create typed auth API wrapper"
Task: "T007 Update middleware with auth redirect"
Task: "T010 Wire sonner toast in API client"

# After those complete, run dependent tasks:
Task: "T006 Fix AuthProvider import path"
Task: "T008 Uncomment AuthProvider in layout"
```

## Parallel Example: User Stories

```bash
# US4 is independent — can run alongside any other story:
Task: "T020 Create ForgotPasswordForm"
Task: "T022 Create ResetPasswordForm"

# US1 components (no cross-dependencies within story):
Task: "T011 Create RegisterForm component"
Task: "T013 Handle server error responses"
```

---

## Implementation Strategy

### MVP First (US1 + US2 + US3 — All P1 Stories)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 (Register)
4. Complete Phase 4: User Story 2 (Verify Email)
5. Complete Phase 5: User Story 3 (Login)
6. **STOP and VALIDATE**: Complete auth cycle: register → verify → login
7. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add US1 Register + US2 Verify + US3 Login → Auth cycle complete → Deploy/Demo (MVP!)
3. Add US4 Forgot/Reset Password → Password recovery ready → Deploy/Demo
4. Add US5 Profile → Profile management ready → Deploy/Demo
5. Add US6 Logout → Logout ready → Deploy/Demo
6. Polish all auth pages → Production-ready auth

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: US1 Register + US2 Verify + US3 Login (P1 stories — auth core)
   - Developer B: US4 Forgot/Reset Password (independent, can be done in parallel)
3. After P1 stories complete:
   - Developer A: US5 Profile
   - Developer B: US6 Logout
4. Team completes Polish phase together

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- Tests are not included in this task list (spec does not explicitly request them); add test tasks if TDD is required later
