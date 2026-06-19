# Auth API Contracts

Base URL: `{{base_url}}/api/auth` (configured via `NEXT_PUBLIC_API_URL` env var)

All endpoints use `application/json` content type. Authenticated endpoints require the `access_token` httpOnly cookie (set by the backend after login, automatically sent via `withCredentials: true`).

---

## POST /api/auth/register

Create a new customer account.

**Request**:
```json
{
  "name": "Ahmed Ali",
  "email": "ahmed@example.com",
  "password": "Test@1234",
  "phone": "+966501234567"
}
```

**Success (201)**:
```json
{
  "message": "Account created. Please check your email for a verification code.",
  "user": {
    "id": "uuid",
    "name": "Ahmed Ali",
    "email": "ahmed@example.com"
  }
}
```

**Errors**: 409 (email already registered), 429 (rate limited), 422 (validation)

---

## POST /api/auth/verify-email

Verify the email with the 6-digit code.

**Request**:
```json
{
  "email": "ahmed@example.com",
  "code": "123456"
}
```

**Success (200)**:
```json
{
  "message": "Email verified successfully. You can now log in."
}
```

**Errors**: 400 (code expired or incorrect)

---

## POST /api/auth/resend-verification

Resend the verification code. Invalidates the previous code.

**Request**:
```json
{
  "email": "ahmed@example.com"
}
```

**Success (200)**:
```json
{
  "message": "Verification code sent to your email."
}
```

**Errors**: 429 (rate limited)

---

## POST /api/auth/login

Authenticate with email and password. Returns a JWT token and sets it as an httpOnly cookie.

**Request**:
```json
{
  "email": "ahmed@example.com",
  "password": "Test@1234"
}
```

**Success (200)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "ahmed@example.com",
    "name": "Ahmed Ali",
    "role": "customer",
    "phone": "+966501234567",
    "avatar_url": null
  }
}
```

**Errors**: 401 (invalid credentials), 403 (email not verified / account suspended)

---

## GET /api/auth/me

Get the authenticated user's profile. Requires valid auth cookie/token.

**Headers**: Cookie: `access_token=<token>` (sent automatically)

**Success (200)**:
```json
{
  "id": "uuid",
  "email": "ahmed@example.com",
  "name": "Ahmed Ali",
  "role": "customer",
  "phone": "+966501234567",
  "avatar_url": null,
  "is_verified": true,
  "created_at": "2026-01-15T10:30:00.000Z"
}
```

**Errors**: 401 (no token / invalid token)

---

## PATCH /api/auth/me

Update profile fields. All fields are optional — only provided fields are updated.

**Request**:
```json
{
  "name": "Ahmed Ali Updated",
  "phone": "+966501234567",
  "avatar_url": "https://example.com/avatar.jpg"
}
```

**Success (200)**:
```json
{
  "message": "Profile updated successfully.",
  "user": {
    "id": "uuid",
    "email": "ahmed@example.com",
    "name": "Ahmed Ali Updated",
    "role": "customer",
    "phone": "+966501234567",
    "avatar_url": "https://example.com/avatar.jpg"
  }
}
```

**Errors**: 401 (no token / invalid token)

---

## POST /api/auth/logout

Logout. The client discards the cookie. Server is stateless.

**Headers**: Cookie: `access_token=<token>` (sent automatically)

**Success (200)**:
```json
{
  "message": "Logged out successfully."
}
```

**Errors**: 401 (no token)

---

## POST /api/auth/forgot-password

Request a password reset code. Always returns success to prevent email enumeration.

**Request**:
```json
{
  "email": "ahmed@example.com"
}
```

**Success (200)**:
```json
{
  "message": "If an account exists with this email, a reset code has been sent."
}
```

**Errors**: 429 (rate limited)

---

## POST /api/auth/reset-password

Reset password using the 6-digit code from email and a new password.

**Request**:
```json
{
  "email": "ahmed@example.com",
  "code": "654321",
  "new_password": "NewPass@5678"
}
```

**Success (200)**:
```json
{
  "message": "Password reset successfully. Please log in with your new password."
}
```

**Errors**: 400 (code expired or incorrect)

---

## Common Error Responses

```json
{
  "status": "error",
  "message": "Human-readable error message",
  "code": "ERROR_CODE"
}
```

| HTTP Status | Error Code | Meaning |
|-------------|-----------|---------|
| 400 | BAD_REQUEST | Invalid input or expired code |
| 401 | UNAUTHORIZED | No token / invalid token |
| 403 | FORBIDDEN | Email not verified / account suspended |
| 409 | CONFLICT | Email already registered |
| 422 | VALIDATION_ERROR | Invalid field format |
| 429 | RATE_LIMIT_EXCEEDED | Too many requests, retry after delay |
