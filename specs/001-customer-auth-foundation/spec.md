# Feature Specification: Customer Auth Foundation

**Feature Branch**: `001-customer-auth-foundation`

**Created**: 2026-06-19

**Status**: Draft

**Input**: User description: "start phase 1 from the file frontend-spec.md and use the endpoint reference from Techa Auth API.postman_collection.json"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Register a New Account (Priority: P1)

A first-time visitor creates an account to become a registered customer.

**Why this priority**: Registration is the entry point for all authenticated features. Without it, no customer can log in, place orders, or use any protected functionality.

**Independent Test**: Can be fully tested by navigating to `/register`, filling in all required fields (name, email, phone, password, confirm password), submitting the form, and verifying a success message and redirect to `/verify-email`.

**Acceptance Scenarios**:

1. **Given** a visitor is on the `/register` page, **When** they fill in valid data and submit, **Then** the form submits successfully, they see a success message, and are redirected to `/verify-email`
2. **Given** a visitor submits the registration form with an email that is already registered, **When** the server returns a 409 conflict, **Then** an inline error message "Email is already registered" is shown below the email field
3. **Given** a visitor submits with missing or invalid fields (e.g., invalid email format, short password, mismatched confirm_password), **When** client-side validation runs, **Then** inline field errors are shown and the form is not submitted
4. **Given** a visitor submits the form, **When** the network fails or the server is unreachable, **Then** a toast notification shows the error and the submit button re-enables

---

### User Story 2 - Verify Email Address (Priority: P1)

A newly registered customer verifies their email using the 6-digit code sent to their inbox.

**Why this priority**: Email verification is required before the customer can log in. This is a gate to the entire authenticated experience.

**Independent Test**: Can be fully tested by registering a new account, being redirected to `/verify-email`, entering the 6-digit code, and verifying the success message and redirect to `/login`.

**Acceptance Scenarios**:

1. **Given** a customer is on `/verify-email` after registration, **When** they enter the correct 6-digit code and submit, **Then** they see a success message and are redirected to `/login`
2. **Given** a customer enters an incorrect code, **When** they submit, **Then** an inline error is shown indicating the code is invalid
3. **Given** a customer enters an expired code, **When** they submit, **Then** an inline error is shown and they are prompted to request a new code
4. **Given** a customer wants a new code, **When** they click "Resend code", **Then** a 60-second countdown starts, the button is disabled during the countdown, and a new code is sent upon expiry

---

### User Story 3 - Log In (Priority: P1)

A registered and verified customer logs into their account.

**Why this priority**: Login enables access to the customer profile, cart, orders, wishlist, and checkout. It is the most frequently used auth action.

**Independent Test**: Can be fully tested by registering, verifying email, navigating to `/login`, entering credentials, and verifying redirect to the home page (or the originally requested page).

**Acceptance Scenarios**:

1. **Given** a verified customer is on `/login`, **When** they enter correct email and password and submit, **Then** they are logged in and redirected to the page they were trying to reach (or `/` by default)
2. **Given** an unverified customer attempts to log in, **When** the server returns a 403 with "Please verify your email", **Then** an inline error is shown with a link to `/verify-email`
3. **Given** a customer with a suspended account attempts to log in, **When** the server returns a 403, **Then** an appropriate message is shown
4. **Given** a customer enters incorrect credentials, **When** the server returns a 401, **Then** an inline error "Invalid email or password" is displayed

---

### User Story 4 - Forgot & Reset Password (Priority: P2)

A customer who forgot their password requests a reset code and sets a new password.

**Why this priority**: Password recovery is essential for customer retention but is a less frequent flow than registration and login.

**Independent Test**: Can be fully tested by navigating to `/forgot-password`, entering an email, receiving a reset code, navigating to `/reset-password`, entering the code and new password, and verifying the success message and redirect to `/login`.

**Acceptance Scenarios**:

1. **Given** a customer is on `/forgot-password`, **When** they enter their email and submit, **Then** a success message is shown (always returns success to prevent email enumeration)
2. **Given** a customer is on `/reset-password`, **When** they enter the correct code and a valid new password, **Then** the password is reset and they are redirected to `/login` with a success notification
3. **Given** a customer enters an expired or incorrect reset code, **When** they submit, **Then** an inline error is shown

---

### User Story 5 - View and Edit Profile (Priority: P2)

An authenticated customer views and updates their personal information.

**Why this priority**: Profile management is a core account feature that enables customers to keep their information current.

**Independent Test**: Can be fully tested by logging in, navigating to `/account`, viewing the pre-populated profile fields, editing them, and verifying the changes persist after page reload.

**Acceptance Scenarios**:

1. **Given** an authenticated customer is on `/account`, **When** the page loads, **Then** their name, email, phone, and avatar are displayed
2. **Given** an authenticated customer edits their name or phone, **When** they submit the form, **Then** the changes are saved and the updated info is displayed immediately
3. **Given** an unauthenticated visitor tries to access `/account`, **When** they navigate to the page, **Then** they are redirected to `/login?next=/account`

---

### User Story 6 - Log Out (Priority: P3)

An authenticated customer logs out of their account.

**Why this priority**: Logout is a standard account management action but is simple and low-risk compared to other auth flows.

**Independent Test**: Can be fully tested by logging in, clicking "Logout", and verifying the user is redirected to the home page in an unauthenticated state.

**Acceptance Scenarios**:

1. **Given** an authenticated customer is on any page, **When** they click "Logout", **Then** they are logged out, redirected to the home page, and the auth state is cleared
2. **Given** a logged-out user, **When** they try to access a protected page, **Then** they are redirected to `/login?next=<original_path>`

---

### Edge Cases

- Duplicate email registration: Server returns 409, inline error shown below email field
- Rate limiting (429): Server returns rate limit error for registration, login, and forgot-password; user sees a toast with a retry message
- Network failure during any auth action: Submit button re-enables, toast shows connection error
- Concurrent logout and request race condition: API calls after logout return 401, user stays logged out
- Form double-submit: Submit button is disabled and shows a spinner while the request is in flight
- Email field case sensitivity: Emails should be normalized to lowercase before sending to the API
- Session expiry during profile edit: API returns 401, user is redirected to login with next param pointing back to /account

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow visitors to create a customer account via a registration form collecting name, email, phone, password, and confirm_password
- **FR-002**: System MUST validate all form fields on the client side before submission using validation rules: valid email format, password minimum length, passwords match, phone format
- **FR-003**: System MUST show inline field-level validation errors for both client-side validation failures and server-side error responses (409 duplicate email, 422 validation errors)
- **FR-004**: System MUST display server-side error messages as toast notifications when an error is not field-specific (e.g., network errors, rate limiting)
- **FR-005**: System MUST redirect new registrants to `/verify-email` after successful registration
- **FR-006**: System MUST allow customers to verify their email by entering a 6-digit code received via email
- **FR-007**: System MUST provide a "Resend code" button on `/verify-email` with a 60-second cooldown countdown during which the button is disabled
- **FR-008**: System MUST redirect customers to `/login` after successful email verification
- **FR-009**: System MUST authenticate customers via email and password on `/login`
- **FR-010**: System MUST redirect authenticated users after login to the page specified by the `next` query parameter, or to `/` if not specified
- **FR-011**: System MUST show a clear inline error message when login fails due to unverified email, with a link to the verify-email flow
- **FR-012**: System MUST allow customers to request a password reset by entering their email on `/forgot-password`
- **FR-013**: System MUST allow customers to reset their password by entering the 6-digit reset code and a new password on `/reset-password`
- **FR-014**: System MUST redirect customers to `/login` after successful password reset
- **FR-015**: System MUST allow authenticated customers to view and edit their profile (name, phone) on `/account`
- **FR-016**: System MUST redirect unauthenticated users to `/login?next=<current_path>` when they attempt to access `/account` or any protected page
- **FR-017**: System MUST allow authenticated customers to log out, clearing the auth state and redirecting to the home page
- **FR-018**: System MUST disable the submit button and show a loading spinner while any auth API request is in flight
- **FR-019**: System MUST persist the authentication token in an httpOnly cookie (via the existing `withCredentials` axios configuration and refresh token mechanism) — the frontend never stores the token in localStorage
- **FR-020**: System MUST hydrate the auth state on app load by calling the current user endpoint using the existing httpOnly cookie

### Key Entities *(include if feature involves data)*

- **Customer (User)**: Represents a registered customer. Key attributes: id, name, email, phone, role (always "customer"), avatarUrl, isVerified, createdAt. The customer entity is central to all authenticated interactions — login, profile, orders, cart, wishlist.
- **Verification Code**: A 6-digit numeric code sent to the customer's email for email verification and password reset. Has a limited validity window (expires after a set duration). After expiry, a new code must be requested.
- **Auth Token (JWT)**: A session token issued upon login. Stored server-side as an httpOnly cookie. The existing refresh token mechanism handles token renewal transparently. No client-side token management is needed.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new customer can complete registration and email verification in under 3 minutes from first visit
- **SC-002**: A returning customer can log in and reach a protected page in under 10 seconds
- **SC-003**: Password reset flow can be completed in under 2 minutes from start to new login
- **SC-004**: Form validation errors appear within 500ms of field interaction (blur or submit)
- **SC-005**: All auth pages are fully functional and visually complete on a 375px wide mobile screen
- **SC-006**: 100% of the defined acceptance scenarios pass for registration, login, verify-email, forgot-password, reset-password, profile edit, and logout

## Assumptions

- **Token persistence**: The existing `withCredentials: true` configuration and `/api/auth/refresh` endpoint confirm httpOnly cookie-based auth. No localStorage token storage is needed.
- **Form libraries**: react-hook-form, zod, and @hookform/resolvers are already installed and available for use.
- **API client**: The existing `Request` class at `src/lib/api/Request.ts` (backed by axios) will be used for all API calls. A new `auth.ts` module will be created to wrap auth-specific endpoints using this client.
- **Base URL**: The API base URL is configured via `NEXT_PUBLIC_API_URL` environment variable (the `.env.local` file uses `NEXT_PUBLIC_BACKEND_URL` which does not match the code — the developer should align these before Phase 1 implementation).
- **Auth store**: The existing `auth.store.ts` will be extended with additional state and actions to support the full auth flow. It is NOT replaced.
- **Toast component**: A shadcn toast/sonner component is available for non-field-specific error notifications.
- **HTTP methods**: The Postman collection uses PATCH for profile updates (`/api/auth/me`), not PUT as originally listed in the spec. PATCH will be used.
- **Registration field mapping**: The Postman API expects `name` (not `full_name`). The frontend form uses `full_name` as the field label but maps it to `name` in the API request body.
