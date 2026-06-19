<!-- SPECKIT START -->

## Current Plan

**Feature**: Customer Auth Foundation
**Branch**: `001-customer-auth-foundation`
**Plan file**: `specs/001-customer-auth-foundation/plan.md`
**Spec file**: `specs/001-customer-auth-foundation/spec.md`

### Key Artifacts

- [spec.md](specs/001-customer-auth-foundation/spec.md) — Feature specification
- [plan.md](specs/001-customer-auth-foundation/plan.md) — Implementation plan
- [research.md](specs/001-customer-auth-foundation/research.md) — Research decisions
- [data-model.md](specs/001-customer-auth-foundation/data-model.md) — Data model
- [quickstart.md](specs/001-customer-auth-foundation/quickstart.md) — Setup guide
- [contracts/auth-api.md](specs/001-customer-auth-foundation/contracts/auth-api.md) — API contracts

### Implementation Order

1. Extend `src/lib/stores/auth.store.ts` with auth state and actions
2. Create `src/lib/types/auth.ts` with TypeScript interfaces
3. Create `src/lib/api/auth.ts` with typed API wrapper functions
4. Build auth components: LoginForm, RegisterForm, VerifyEmailForm, ForgotPasswordForm, ResetPasswordForm, ProfileForm, ProtectedRoute
5. Create route pages under `src/app/(store)/login|register|verify-email|forgot-password|reset-password|account`
6. Fix AuthProvider import path in `src/components/providers/AuthProvider.tsx`
7. Uncomment AuthProvider in `src/app/layout.tsx`
8. Update `src/middleware.ts` with auth redirect logic for protected routes
9. Align `.env.local` variable name (`NEXT_PUBLIC_BACKEND_URL` → `NEXT_PUBLIC_API_URL`)

<!-- SPECKIT END -->
