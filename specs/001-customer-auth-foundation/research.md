# Research: Customer Auth Foundation

## Decisions

### 1. Token Storage Mechanism
- **Decision**: httpOnly cookie named `access_token`
- **Rationale**: The existing infrastructure already implements this approach:
  - `src/lib/auth/constants.ts` defines `AUTH_COOKIE_NAME = "access_token"`
  - `src/lib/auth/getToken.ts` reads the cookie from `document.cookie`
  - `src/lib/api/Request.ts` and `src/services/client.ts` both use `withCredentials: true`
  - A refresh token flow exists (`/api/auth/refresh` in `endpoints.ts` and the error interceptor)
  - The Postman API description for logout says "No server-side invalidation (stateless)" — consistent with cookie-based JWT
- **Alternatives considered**: localStorage token storage (rejected because existing infrastructure is cookie-based)

### 2. Form Validation Libraries
- **Decision**: react-hook-form + zod + @hookform/resolvers
- **Rationale**: All three packages are already installed (confirmed in `package.json`: react-hook-form ^7.76.1, zod ^3.25.76, @hookform/resolvers ^3.10.0). Custom `FormField` and `Input` components already exist in `src/components/forms/`. No additional packages needed.
- **Alternatives considered**: Formik (would require new dependency), native HTML validation (insufficient for complex rules)

### 3. API Client Approach
- **Decision**: Use the existing `src/lib/api/Request.ts` class for typed auth API calls. A new `src/lib/api/auth.ts` module will wrap all auth endpoints using this client.
- **Rationale**: The `Request` class is already established with auth and error interceptors, a refresh queue, and consistent error handling. `src/services/client.ts` is a separate axios instance — using both would be confusing. The `lib/api/` pattern is the more structured approach.
- **Alternatives considered**: Using `src/services/client.ts` directly (rejected — it has CSRF logic that is not needed for the simpler auth endpoints and lacks the typed wrapper pattern)

### 4. Auth Store Strategy
- **Decision**: Extend the existing `src/lib/stores/auth.store.ts` rather than creating a new one
- **Rationale**: The store already has the `User` interface, `AuthStatus` type, and basic `login`/`logout`/`setUser` actions. Extending it with `token` state, `isLoading`, and `hydrateFromStorage` action is straightforward. There is also a broken import in `AuthProvider.tsx` (`@/stores/auth` instead of `@/lib/stores/auth`) that should be fixed.
- **Alternatives considered**: Creating a new store (rejected — would duplicate existing state and require refactoring the existing AuthProvider)

### 5. API Endpoint HTTP Methods
- **Decision**: Use PATCH for `/api/auth/me` profile updates (not PUT)
- **Rationale**: The Postman collection explicitly shows PATCH with partial field updates. The frontend spec originally listed PUT but the actual API contract uses PATCH.
- **Alternatives considered**: PUT (rejected — API contract uses PATCH for partial updates)

### 6. Auth Pages Routing
- **Decision**: Place auth pages under a `(store)` route group in `src/app/(store)/` for future compatibility with the storefront layout (header/footer)
- **Rationale**: The `frontend-spec.md` Phase 2 describes a storefront layout under `app/(store)/`. Creating the route group now avoids moving pages later. The root `app/layout.tsx` already wraps children with all providers.
- **Alternatives considered**: Flat routes under `src/app/login/` etc. (simpler but would require moving later when Phase 2 layout is built)

### 7. Environment Variable
- **Decision**: Use `NEXT_PUBLIC_API_URL` as the env var name
- **Rationale**: `src/lib/api/endpoints.ts` reads `process.env.NEXT_PUBLIC_API_URL`. However, `.env.local` defines `NEXT_PUBLIC_BACKEND_URL` instead — this must be aligned before implementation.
- **Alternatives considered**: `NEXT_PUBLIC_BACKEND_URL` (would require changing `endpoints.ts`)

### 8. Registration Field Mapping
- **Decision**: Frontend form collects `full_name`, `phone`, `email`, `password`, `confirm_password`. The API call sends `name` (mapped from `full_name`), `phone`, `email`, `password`.
- **Rationale**: The Postman register endpoint accepts `name`, `email`, `password`, `phone`. The spec uses `full_name` as the user-facing label. The confirm_password field is client-side only.
- **Alternatives considered**: Using `full_name` as the API field (rejected — Postman shows `name`)

### 9. Register Response Handling
- **Decision**: On successful registration (201), the API returns `{ message, user: { id, name, email } }`. The frontend should NOT automatically log in the user — they must verify their email first.
- **Rationale**: The register endpoint does not return a token. The success response message says "Account created. Please check your email for a verification code." The user must verify email before logging in.
- **Alternatives considered**: Auto-login on registration (rejected — API doesn't return a token, and verification is required)

### 10. Auth Store Token Property
- **Decision**: The auth store will NOT hold a `token` in memory state. Token is managed via httpOnly cookie only.
- **Rationale**: The existing `AuthProvider.tsx` calls `setTokenGetter(() => useAuthStore.getState().token)` which suggests the store previously held a token. But the cookie-based approach means the cookie is automatically sent with each request (via `withCredentials: true`). The token getter pattern was designed for Bearer header injection, which conflicts with the cookie approach. **This needs clarification** — either remove the Bearer header pattern and rely solely on the cookie, or keep both. The spec (FR-019) says "frontend never stores the token in localStorage" but the existing token getter suggests the token was stored in the Zustand store's memory. Since the cookie is httpOnly, JavaScript can't read it for a Bearer header anyway.
- **Resolution**: The cookie IS the auth mechanism. Remove the Bearer token injection from the interceptor (it's redundant with `withCredentials: true`). The auth store should not have a `token` field. Remove `setTokenGetter` from `AuthProvider`.

## Dependencies

- Backend must have auth endpoints deployed at the configured `NEXT_PUBLIC_API_URL`
- The `/api/auth/refresh` endpoint must exist for the error interceptor to function (it is already referenced in `endpoints.ts` and the error interceptor)
- The `AUTH_COOKIE_NAME` constant (`access_token`) must match the cookie name set by the backend
- shadcn/ui `Form`, `Input`, `Button`, `Label`, `Dialog`, `Sheet` components should be available (some may need to be initialized via `npx shadcn@latest add`)
