# Feature Specification: Admin Admins Management

**Feature Branch**: `019-admin-admins-management`

**Created**: 2026-06-23

**Status**: Approved

**Input**: Frontend spec Phase 19 — "Admin Panel: Admins Management". API endpoints from Postman collection (`Techa Auth API.postman_collection.json`): `GET /api/admin/admins` (list), `POST /api/admin/admins` (create), `PUT /api/admin/admins/:id` (update), `DELETE /api/admin/admins/:id` (deactivate), `GET /api/admin/roles` (list), `POST /api/admin/roles` (create), `PUT /api/admin/roles/:id` (update), `DELETE /api/admin/roles/:id` (delete), plus admin auth endpoints (login, profile, logout).

## User Scenarios & Testing

### User Story 1 — Super-Admin Manages Admin Accounts (Priority: P1)

A super-admin navigates to `/admin/admins` and sees a table listing all admin accounts: name, email, role, status (Active/Inactive), and created date. They can create a new admin via a Dialog (name, email, password, role dropdown), edit an existing admin's details or role, and deactivate/reactivate accounts. Deleting an account is not allowed — only deactivation. The current admin cannot deactivate their own account.

**Why this priority**: Without this page, the only way to manage admin accounts is through direct database manipulation or API calls. This is the foundational admin management surface.

**Independent Test**: A super-admin opens `/admin/admins`, creates a new admin, verifies it appears in the table, edits the role, deactivates the account, and reactivates it.

**Acceptance Scenarios**:

1. **Given** a super-admin is on `/admin/admins`, **When** the page loads, **Then** a table shows all admin accounts with columns: name, email, role, status (Active/Inactive), created date.
2. **Given** a super-admin clicks "Create Admin", **When** they fill in name, email, password, and select a role, **Then** the new admin appears in the table.
3. **Given** a super-admin clicks "Edit" on an existing admin, **When** they modify the name or role and save, **Then** the table updates with the new data.
4. **Given** a super-admin clicks "Deactivate" on an active admin (not themselves), **When** they confirm the AlertDialog, **Then** the admin's status changes to "Inactive" in the table.
5. **Given** a super-admin clicks "Reactivate" on an inactive admin, **When** they confirm, **Then** the admin's status changes to "Active" in the table.
6. **Given** a super-admin clicks "Deactivate" on their own account, **When** they confirm, **Then** a toast shows the self-deactivation error (backend returns 400) and the account remains active.
7. **Given** there are no admin accounts besides the current user, **When** the page loads, **Then** the table shows the current user's account row.

### User Story 2 — Super-Admin Manages Roles (Priority: P2)

A super-admin navigates to `/admin/roles` and sees a table of all roles with their name and associated permissions. They can create a new role by specifying a name and selecting permission checkboxes, edit an existing role's name or permissions, or delete a role that has no admins assigned to it. The role dropdown in the Create/Edit Admin dialogs fetches its options from `GET /api/admin/roles`.

**Why this priority**: Role-based access control is fundamental to admin security. While the backend may seed default roles (super_admin, admin), a UI for managing roles allows super-admins to customize permission sets without database access.

**Independent Test**: A super-admin opens `/admin/roles`, creates a new role with specific permissions, edits its name, then deletes it.

**Acceptance Scenarios**:

1. **Given** a super-admin is on `/admin/roles`, **When** the page loads, **Then** a table shows all roles with name and permission count.
2. **Given** a super-admin clicks "Create Role", **When** they enter a name and select permissions, **Then** the new role appears in the table.
3. **Given** a super-admin edits a role's permissions, **When** they save, **Then** the role's permissions update.
4. **Given** a super-admin deletes a role with no assigned admins, **When** they confirm, **Then** the role is removed from the table.
5. **Given** a super-admin creates a new admin, **When** the role dropdown opens, **Then** all roles (including the newly created one) are listed.

### Edge Cases

- Duplicate email on create: backend returns 409, frontend shows inline field error on the email input.
- Invalid email format on create: backend returns 422, frontend shows inline field error.
- Password too weak on create: frontend validates minimum length (8 characters) before submitting.
- Self-deactivation: frontend shows a specific error message "You cannot deactivate your own account" when the backend returns 400.
- Rate limiting (429): toast shows "Too many requests. Please wait before trying again."
- Permission gating: only admins with `admins` permission or `all` permission (super_admin role) can access this page.
- Role dropdown options in Create/Edit Admin dialogs are fetched from `GET /api/admin/roles`.

---

## Functional Requirements

### FR1 — Admin List Table

The page displays a paginated table of all admin accounts. Each row shows name, email, role (displayed as a human-readable label), status badge (green "Active" / gray "Inactive"), and created date. The current user's row may optionally be highlighted.

### FR2 — Create Admin Dialog

A Dialog form with fields:
- **Full Name** — text input, required
- **Email** — email input, required, validated for email format
- **Password** — password input, required, minimum 8 characters
- **Role** — dropdown/select, required, populated from available roles

On submit: calls `POST /api/admin/admins`. On success: table refreshes, dialog closes. On 409 (duplicate email): show inline field error on email. On validation error: show inline field errors.

### FR3 — Edit Admin Dialog

Same Dialog form as Create, pre-filled with existing data. Password field is optional (leave blank to keep unchanged). Name, email, and role are editable. On submit: calls `PUT /api/admin/admins/:id`.

### FR4 — Deactivate / Reactivate

Each row has a toggle action button:
- If admin is **Active**: show "Deactivate" button → AlertDialog confirmation → calls `DELETE /api/admin/admins/:id` → table updates.
- If admin is **Inactive**: show "Reactivate" button → AlertDialog confirmation → calls `PUT /api/admin/admins/:id` with `{ is_active: true }` → table updates.
- Self-deactivation: the backend returns 400; the frontend shows a toast with the error message and does not change the row.

### FR5 — Permission Gating

Access to both `/admin/admins` and `/admin/roles` is restricted to admins whose `permissions` array includes `"admins"` or `"all"`. The pages redirect or show an unauthorized state if the admin lacks permission. Action buttons (create, edit, deactivate, reactivate on admins; create, edit, delete on roles) are hidden if the admin lacks the appropriate permission.

### FR6 — Empty State

If the list is empty (unusual — at least the current admin exists), show an empty state with a "Create First Admin" CTA button.

### FR7 — Error Handling

All API errors show a toast with the error message. List fetch failures show `ErrorState` with a retry button.

### FR8 — Roles Management Page

`/admin/roles` is linked from the admin sidebar as "Roles". It displays a table of all roles with columns: name, permission count, assigned admin count. Each row has Edit and Delete buttons. Delete is disabled (or shows a warning) if the role has admins assigned to it. Create/Edit uses a Dialog with:
- **Name** — text input, required
- **Permissions** — grouped checkboxes of all available permission keys

On submit for create: `POST /api/admin/roles`. On submit for edit: `PUT /api/admin/roles/:id`. On delete: `DELETE /api/admin/roles/:id`. The role dropdown in the admins page fetches from `GET /api/admin/roles` to populate its options.

---

## Clarifications

### Session 2026-06-23

- Q: Should the `/admin/roles` page be built now or deferred until roles CRUD endpoints are confirmed? → A: Build the page now — roles endpoints have been added to the backend.
- Q: Should `/admin/roles` get its own sidebar link or be accessed from the admins page? → A: Add "Roles" link to sidebar.
- Q: What permission key gates the `/admin/roles` page? → A: Same as `/admin/admins` — `"admins"` (or `"all"`).
- Q: How should the Create/Edit Admin dialog handle a failed roles fetch? → A: Disable the role dropdown + show an error toast with a retry button. Block form submission until a role is selected. This matches FR7's existing error pattern.

## Success Criteria

1. A super-admin can view, create, edit, deactivate, and reactivate admin accounts without leaving the page.
2. The full cycle (create → verify in table → edit → deactivate → reactivate) completes in under 3 minutes for a trained admin.
3. Error scenarios (duplicate email, invalid format, self-deactivation) display clear, actionable messages — never raw API errors.
4. The table updates after every CRUD action without a full page reload.
5. Admins without `admins` permission cannot access the page or see action buttons.
6. Deactivation is always reversible — no hard delete option exists in the UI.

---

## Key Entities

### AdminAccount
- `id` (string, UUID) — unique identifier
- `name` (string) — full name
- `email` (string) — login email, unique
- `role` (string | object) — role identifier or `{ id, name }` object
- `is_active` (boolean) — account status
- `created_at` (ISO timestamp) — account creation date

### AdminRole
- `id` (number) — role identifier
- `name` (string) — role label (e.g. "super_admin", "admin")
- `permissions` (string[]) — permission keys (e.g. `["all"]`, `["products.read", "orders.update"]`)

---

## Assumptions

1. Admin accounts use the same admin auth system as the existing admin login/logout flow (JWT via `adminRequest`).
2. The `DELETE /api/admin/admins/:id` endpoint performs a soft deactivation (sets `is_active = false`) — confirmed by Postman response `"Admin deactivated successfully."`.
3. Reactivation is done via `PUT /api/admin/admins/:id` with `{ "is_active": true }` — reasonable assumption given no dedicated reactivate endpoint exists.
4. The `last_login` field mentioned in the frontend spec Phase 19 description is not available in the current API response; the table uses `created_at` instead.
5. Minimum password length is 8 characters (industry standard for admin accounts).
6. The list response (`GET /api/admin/admins`) does not include the current admin's own password hash or sensitive data.
7. Roles are fully CRUD-managed via `GET/POST/PUT/DELETE /api/admin/roles` endpoints. The role dropdown in admin forms fetches from this endpoint.
8. The roles list response (`GET /api/admin/roles`) returns an array of `{ id, name, permissions[] }` objects.
9. Deleting a role that has admins assigned returns a 409 conflict error from the backend; the frontend shows a warning.
