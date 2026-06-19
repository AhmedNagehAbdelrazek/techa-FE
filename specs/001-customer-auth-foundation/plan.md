# Implementation Plan: Customer Auth Foundation

**Branch**: `001-customer-auth-foundation` | **Date**: 2026-06-19 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-customer-auth-foundation/spec.md`

## Summary

Set up the customer authentication system including registration, email verification, login, password reset, profile management, and logout. Primary requirement: 6 form-based auth pages powered by a Zustand auth store and an API client layer for the backend auth endpoints. This is the foundation for all authenticated customer interactions (cart, orders, wishlist, checkout).

## Technical Context

**Language/Version**: TypeScript 5.x / Next.js 15 (App Router)

**Primary Dependencies**: Next.js 15, React 19, Zustand 5 (client state), axios 1.7 (HTTP), react-hook-form 7.76 + zod 3.25 (form validation), sonner 2.0 (toast notifications), shadcn/ui (Radix primitives for form elements)

**Storage**: N/A — auth state managed via httpOnly cookie (`access_token`) with Zustand client store for UI state. No database or persistent client storage needed.

**Testing**: vitest 2.x (unit/integration), @testing-library/react (component tests), Playwright (e2e). All auth form components and the auth store should have coverage.

**Target Platform**: Modern web browsers (Chrome, Firefox, Safari, Edge), mobile-first responsive down to 375px width. RTL layout (Arabic, `dir="rtl"`).

**Project Type**: Web application (Next.js frontend with REST API backend)

**Performance Goals**: Auth pages load in under 2 seconds (server-rendered). Form validation feedback within 500ms of interaction. Login redirect completes in under 1 second after successful API response.

**Constraints**: Mobile-first (375px minimum), keyboard-navigable, aria-labels on all interactive elements, RTL support, inline field errors from both client and server validation, no localStorage for tokens (httpOnly cookie only via existing `withCredentials` axios config).

**Scale/Scope**: Phase 1 delivers 6 pages, 1 Zustand store extension, 1 API module. Auth is foundational — all future phases depend on it.

**Technical unknowns resolved from codebase analysis**:
- Auth cookie name: `access_token` (confirmed in `src/lib/auth/constants.ts`)
- Token storage: httpOnly cookie, read via `document.cookie` in `src/lib/auth/getToken.ts`
- Form libraries: react-hook-form + zod + @hookform/resolvers already installed (confirmed in package.json)
- API client: `src/lib/api/Request.ts` (class-based axios wrapper) is available; also `src/services/client.ts` exists
- Toast: sonner is installed and wired in root layout as `<Toaster />`
- Auth provider: `src/components/providers/AuthProvider.tsx` exists but is commented out in layout
- Existing auth store: `src/lib/stores/auth.store.ts` has basic user state (id, email, name, role, avatarUrl) and will be extended
- No AGENTS.md exists — will be created

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The constitution file (`.specify/memory/constitution.md`) contains only template placeholders with no actual project rules, principles, or gates. No constitutional constraints apply to this feature.

**Gate status**: PASS (no violations)

## Project Structure

### Documentation (this feature)

```text
specs/001-customer-auth-foundation/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (API contract references)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── layout.tsx              # Root layout (existing, uncomment AuthProvider)
│   ├── (store)/
│   │   ├── login/
│   │   │   └── page.tsx        # Login form page
│   │   ├── register/
│   │   │   └── page.tsx        # Registration form page
│   │   ├── verify-email/
│   │   │   └── page.tsx        # Email verification code input page
│   │   ├── forgot-password/
│   │   │   └── page.tsx        # Forgot password email input page
│   │   ├── reset-password/
│   │   │   └── page.tsx        # Reset password code+password page
│   │   └── account/
│   │       └── page.tsx        # Profile view/edit page (protected)
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   ├── VerifyEmailForm.tsx
│   │   │   ├── ForgotPasswordForm.tsx
│   │   │   ├── ResetPasswordForm.tsx
│   │   │   ├── ProfileForm.tsx
│   │   │   └── ProtectedRoute.tsx  # Client component for auth redirect
│   │   └── ui/                 # Existing shadcn primitives (button, input, etc.)
│   ├── lib/
│   │   ├── api/
│   │   │   ├── Request.ts      # Existing axios wrapper (keep as-is)
│   │   │   ├── endpoints.ts    # Existing (add auth endpoint paths)
│   │   │   ├── interceptors/   # Existing
│   │   │   └── auth.ts         # NEW: typed auth API functions
│   │   ├── stores/
│   │   │   ├── auth.store.ts   # EXTEND: existing Zustand auth slice
│   │   │   └── ...             # Other existing stores
│   │   ├── types/
│   │   │   └── auth.ts         # NEW: TypeScript interfaces for auth API responses
│   │   ├── auth/               # Existing auth helpers (keep as-is)
│   │   └── utils.ts            # Existing (cn, formatPrice, formatDateTime)
│   └── middleware.ts           # EXISTING: add auth redirect logic for protected routes
```

**Structure Decision**: Single Next.js project with App Router route groups. Auth pages live under the existing root `app/` layout. API client layer in `lib/api/`, Zustand stores in `lib/stores/`, types in `lib/types/`, auth components in `components/auth/`.

## Complexity Tracking

> No violations to justify — Constitution Check passed.
