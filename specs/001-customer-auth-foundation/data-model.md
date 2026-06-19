# Data Model: Customer Auth Foundation

## Entity: Customer (User)

The central user entity for the customer-facing storefront. Admin users are separate (Phase 19).

### Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | UUID string | Yes | Primary identifier, server-generated |
| `name` | string (2-100 chars) | Yes | Full name of the customer |
| `email` | string (email format) | Yes | Unique, used for login, verification, and password reset |
| `phone` | string | Yes | Phone number with country code |
| `role` | string enum | Yes | Always `"customer"` (vs `"admin"` for admin users) |
| `avatarUrl` | string (URL) or null | No | Profile avatar image URL |
| `isVerified` | boolean | Yes | Whether email has been verified |
| `createdAt` | ISO 8601 timestamp | Yes | Account creation timestamp |

### Field Mapping: Form → API

| Form Field | API Field | Validation |
|-----------|-----------|------------|
| `full_name` | `name` | 2-100 chars, required |
| `email` | `email` | Valid email format, required |
| `phone` | `phone` | Phone format, required |
| `password` | `password` | Min 8 chars, required |
| `confirm_password` | (not sent) | Must match `password`, client-only |

### Validation Rules (FR-002)

- **Email**: Must match standard email regex pattern
- **Password**: Minimum 8 characters; should contain mixed case + number for UX guidance (server enforces policy)
- **Confirm password**: Must exactly match the password field
- **Phone**: Must match phone number format with country code

### State Transitions (Auth Flow)

```
[Unregistered]
    │
    ▼  register (POST /api/auth/register)
[Registered, Unverified]
    │
    ├── verify email (POST /api/auth/verify-email)
    │       │
    │       ▼
    │   [Verified]
    │       │
    │       ▼  login (POST /api/auth/login)
    │   [Authenticated]
    │       │
    │       ├── view/edit profile (GET/PATCH /api/auth/me)
    │       ├── logout (POST /api/auth/logout) → [Unauthenticated]
    │       └── session expires → [Unauthenticated]
    │
    └── resend verification (POST /api/auth/resend-verification)
            │
            ▼  (new code sent, stays [Unverified])

[Any state] → forgot-password → reset-password → [Verified, not authenticated]
```

## Entity: Verification Code

Not stored client-side. A 6-digit numeric code sent to the customer's email.

### Characteristics

- **Format**: Exactly 6 numeric digits
- **Validity period**: Time-limited (server-enforced, typically 10-15 minutes)
- **Purpose**: Email verification and password reset
- **Client interaction**: User enters the 6 digits into individual input fields or a single code input

### Error States

| Error | Code | UX Handling |
|-------|------|------------|
| Code expired | 400 | Show error "Code has expired. Request a new one." with resend prompt |
| Incorrect code | 400 | Show error "Invalid code" inline |
| Rate limited | 429 | Show toast with retry message |

## Entity: Auth Session

Not stored client-side. Managed via httpOnly cookie (`access_token`).

### Characteristics

- **Storage**: httpOnly cookie set by the backend
- **Transmission**: Automatically included in all API requests via `withCredentials: true`
- **Refresh**: The error interceptor attempts to refresh the token via `POST /api/auth/refresh` when a 401 is received
- **Logout**: `POST /api/auth/logout` — client discards the cookie. Server is stateless.
- **Client access**: Auth state is reflected in the Zustand store (`isAuthenticated`, `user`) but the actual token is never accessible from JavaScript (httpOnly)
