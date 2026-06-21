# Customer Account & Addresses

> **Phase:** 12
> **Source:** `frontend-spec.md` Phase 12
> **API Reference:** Postman Collection — Customer Auth, Addresses, Delivery Zones (Public), Upload

---

## Overview

Customers manage their profile and saved addresses from a single `/account` page. The page uses two tabs (Profile, Addresses) with tab state reflected in the URL query parameter for bookmarkability and refresh safety. Password change is out of scope for this phase because no backend endpoint exists.

---

## Actors

- **Authenticated Customer** — logged-in user who can view and edit their own profile and manage delivery addresses.

---

## User Scenarios & Testing

### Scenario 1 — Customer updates their profile
1. Customer navigates to `/account?tab=profile`
2. Sees a pre-filled form with their current `full_name`, `phone`, and avatar
3. Changes their name and uploads a new avatar image
4. Submits the form
5. Profile updates successfully; success message appears; avatar preview updates immediately
6. **Edge case**: Upload an oversized image (over 20MB) — error shown inline
7. **Edge case**: Submit with empty name — client-side validation blocks submission

### Scenario 2 — Customer manages addresses
1. Customer navigates to `/account?tab=addresses`
2. Sees a list of saved addresses with Edit, Delete, Set as Default buttons
3. Clicks "Add new address" — an inline form or modal opens
4. Selects a delivery zone from a dropdown populated from the delivery zones API
5. Fills in all address fields and saves
6. New address appears in the list
7. Sets the new address as default — the previous default loses its default badge
8. **Edge case**: Customer has 10 addresses — "Add" button is hidden and a message shows the limit is reached
9. **Edge case**: Customer tries to delete their default address — a prompt asks them to set another address as default first

### Scenario 3 — Unauthenticated access
1. Unauthenticated user navigates to `/account`
2. Redirected to `/login?next=/account`
3. After login, redirected back to `/account`

---

## Functional Requirements

### FR1 — Profile Tab
- Customer can view and edit `full_name`, `phone`, and avatar image
- Avatar upload sends the file to `POST /api/upload` (multipart/form-data) and passes the returned URL to `PATCH /api/auth/me` as `avatar_url`
- The profile form pre-fills with current customer data from `GET /api/auth/me`
- Client-side validation requires non-empty `full_name` and a valid phone format
- Submit button shows loading state and is disabled during submission
- Success shows a confirmation message; server errors show inline field validation

### FR2 — Addresses Tab
- Lists all saved addresses with Edit, Delete, and Set as Default actions per address
- "Add new address" opens an inline form or modal with fields: `full_name`, `phone`, `label` (e.g. "Home", "Work"), `building`, `apartment`, `street`, `city`, `zone_id` (dropdown), `landmark`, `notes`
- `zone_id` dropdown fetches from `GET /api/public/delivery-zones` (no auth required)
- "Add" button is hidden when the customer has 10 saved addresses; a message explains the limit
- Deleting a default address is blocked client-side with a prompt to set another as default first
- Set as Default calls `PUT /api/addresses/:id/default`
- Optimistic UI: address list updates immediately on add/edit/delete with rollback on failure

### FR3 — Tab State in URL
- Tab selection is reflected in the URL as `?tab=profile|addresses`
- Changing tabs updates the URL without a full page reload
- Refreshing the page preserves the active tab from the URL
- Default tab is "profile" when no `tab` query param is present

### FR4 — Auth Protection
- The entire `/account` page is protected — unauthenticated users are redirected to `/login?next=/account`
- API calls for profile and addresses all require the customer auth token

---

## Success Criteria

1. Customer can complete a profile update (name + avatar) in under 30 seconds
2. Customer can add a new address with zone selection in under 1 minute
3. Address limit of 10 is enforced; the "Add" button is hidden at the limit
4. Deleting a default address is prevented with a clear instruction to set another default first
5. Tab state survives page refresh and is shareable via URL
6. All forms display inline validation errors for invalid input before submission
7. Upload errors (file too large, wrong format) are shown to the user immediately

---

## Key Entities

- **Customer** — user with `id`, `email`, `name` (`full_name`), `phone`, `avatar_url`
- **Address** — saved delivery address with `id`, `full_name`, `phone`, `label`, `building`, `apartment`, `street`, `city`, `zone_id`, `landmark`, `notes`, `is_default`
- **Delivery Zone** — geographical zone with `id`, `name`, `regions` (array of city/region names)

---

## Clarifications

### Session 2026-06-21

- Q: Does the backend expose a change password endpoint for authenticated customers? → A: No existing endpoint. Security tab (password change) is dropped from this phase.
- Q: Is the avatar upload a two-step flow (upload file → URL → profile update) or direct to profile endpoint? → A: Two-step: upload to `/api/upload`, then pass returned URL to `PATCH /api/auth/me`.

## Assumptions

- Profile update uses `PATCH /api/auth/me` (matches Postman collection) — the frontend spec originally listed `PUT` but Postman confirms `PATCH`
- Avatar upload uses the same `POST /api/upload` endpoint (returns a URL that is then passed to `PATCH /api/auth/me`)
- Delivery zones are fetched from the public endpoint `GET /api/public/delivery-zones` (no auth required)
- Addresses are scoped per customer — each customer sees only their own addresses
- Maximum address limit of 10 is enforced client-side; the backend may also enforce this
- Password change (Security tab) is out of scope — no backend change-password endpoint exists

---

## Dependencies

- `GET /api/auth/me` — fetch current profile data for pre-fill
- `PATCH /api/auth/me` — update profile fields (name, phone, avatar_url)
- `POST /api/upload` — file upload for avatar images (returns URL)
- `GET /api/addresses` — list customer addresses
- `POST /api/addresses` — create new address
- `PUT /api/addresses/:id` — update address
- `PUT /api/addresses/:id/default` — set address as default
- `DELETE /api/addresses/:id` — delete address
- `GET /api/public/delivery-zones` — populate zone dropdown

