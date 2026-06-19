# Quickstart: Customer Auth Foundation

## Prerequisites

- Backend API running at the URL configured in `NEXT_PUBLIC_API_URL`
- The backend must set the `access_token` httpOnly cookie on login
- The backend must expose all auth endpoints listed in [contracts/auth-api.md](contracts/auth-api.md)

## Setup Steps

### 1. Environment Configuration

Ensure `.env.local` has the correct variable:
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```
(The file currently has `NEXT_PUBLIC_BACKEND_URL` — rename to `NEXT_PUBLIC_API_URL` to match `src/lib/api/endpoints.ts`.)

### 2. Verify Dependencies

All required packages are already installed. Run to confirm:
```bash
npm ls react-hook-form zod @hookform/resolvers axios zustand sonner
```

### 3. Initialize Missing shadcn Components

The following shadcn components may need to be added if not present:
```bash
npx shadcn@latest add form label
```

### 4. Uncomment AuthProvider

In `src/app/layout.tsx`, uncomment the `<AuthProvider>` wrapper:
```tsx
// Change from:
{/* <AuthProvider> */}
  {children}
  <Toaster />
{/* </AuthProvider> */}

// To:
<AuthProvider>
  {children}
  <Toaster />
</AuthProvider>
```

### 5. Verify AuthProvider Import Path

`src/components/providers/AuthProvider.tsx` imports `@/stores/auth` — change to `@/lib/stores/auth`:
```ts
// Change from:
import { useAuthStore } from '@/stores/auth';
// To:
import { useAuthStore } from '@/lib/stores/auth';
```

## Pages to Build (in order)

1. `/login` — Email + password form with "Forgot password?" link
2. `/register` — Registration form (name, email, phone, password, confirm)
3. `/verify-email` — 6-digit code input with resend + 60s countdown
4. `/forgot-password` — Email input to request reset code
5. `/reset-password` — Code + new password + confirm
6. `/account` — View/edit profile (protected)

## Architecture Decisions

| Decision | Choice |
|----------|--------|
| Auth mechanism | httpOnly cookie (`access_token`) |
| API client | `src/lib/api/Request.ts` (existing) |
| Auth store | Extend `src/lib/stores/auth.store.ts` |
| Form validation | react-hook-form + zod |
| Notifications | sonner toasts |
| Auth redirect next param | `?next=<path>` pattern |

## Verification

Run the test suite after implementing:
```bash
npm test:run
npm run dev
```

Then manually verify:
1. Navigate to `/register`, create an account → redirected to `/verify-email`
2. Enter the 6-digit code → redirected to `/login`
3. Log in with credentials → redirected to `/`
4. Visit `/account` → see profile data
5. Edit name/phone → changes persist on reload
6. Click "Forgot password?" on login → `/forgot-password`
7. Complete reset flow → redirected to `/login`
8. Log out → redirected to `/` in unauthenticated state
