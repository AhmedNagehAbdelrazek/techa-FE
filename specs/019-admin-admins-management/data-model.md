# Data Model: Admin Admins & Roles Management

## Types (TypeScript)

```typescript
// ─── Admin Account ────────────────────────────────────────

interface AdminAccount {
  id: string;           // UUID
  name: string;         // Full name
  email: string;        // Login email, unique
  role: string | { id: number; name: string };  // String in list, object in create/update response
  is_active: boolean;
  created_at: string;   // ISO 8601
}

interface AdminAccountListResponse {
  data: AdminAccount[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface AdminAccountFormData {
  name: string;
  email: string;
  password?: string;    // Required on create, optional on edit (leave blank = unchanged)
  role_id: number;
}

// ─── Admin Role ────────────────────────────────────────────

interface AdminRole {
  id: string;           // UUID
  name: string;         // Role label (e.g. "super_admin", "admin", "custom_role")
  permissions: Record<string, string[]>;  // e.g. { "products": ["read", "create", "update", "delete"] }
  is_active: boolean;
  version: number;
  createdat: string;    // ISO 8601 (lowercase — backend format)
  updatedat: string;    // ISO 8601 (lowercase — backend format)
}

interface AdminRoleFormData {
  name: string;
  permissions: Record<string, string[]>;
}

// ─── API Error ────────────────────────────────────────────

interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
```

## Backend API Shape Differences

| Context | List Response | Create/Update Response |
|---------|---------------|----------------------|
| Admin `role` field | String: `"super_admin"` | Object: `{ id: 1, name: "super_admin" }` |
| Admin `id` type | String (UUID) | Number in update example (likely string in practice) |
| Role timestamp keys | `createdat`, `updatedat` (lowercase, no underscore) | Same |

## State Transitions

### Admin Account
- `is_active: true` → admin clicks "Deactivate" → confirm AlertDialog → `DELETE /api/admin/admins/:id` → status becomes `is_active: false`
- `is_active: false` → admin clicks "Reactivate" → confirm AlertDialog → `PUT /api/admin/admins/:id` with `{ is_active: true }` → status becomes `is_active: true`
- Self-deactivation: backend returns 400 error → frontend shows toast, row unchanged

### Admin Role
- Role created → added to table, available in admin form role dropdown
- Role updated → row updates in table, role dropdown reflects new name
- Role deactivated → `DELETE /api/admin/roles/:id` → removed from table after success
- Role deactivation with admins → backend returns 409 → error toast, row stays in table

## React Query Keys

```typescript
export const adminAdminsRolesKeys = {
  all: ["admin", "admins-roles"] as const,
  admins: () => [...adminAdminsRolesKeys.all, "admins"] as const,
  admin: (id: string) => [...adminAdminsRolesKeys.admins(), id] as const,
  roles: () => [...adminAdminsRolesKeys.all, "roles"] as const,
  role: (id: string) => [...adminAdminsRolesKeys.roles(), id] as const,
};
```

## Validation Rules (Zod)

### Admin Form
```typescript
const adminFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  email: z.string().email("Invalid email format"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .optional()
    .or(z.literal("")),  // Empty = keep unchanged (edit mode)
  role_id: z.coerce.number({ required_error: "Role is required" }),
});
```

### Role Form
```typescript
// No zod — uses controlled state with manual validation:
const roleNameSchema = z.string().min(1, "Name is required").max(100);
```

## Permission Key Reference

Known resource keys used across the admin panel (for role permission checkboxes):

| Resource Key | Related Pages |
|-------------|---------------|
| `products` | Products CRUD |
| `orders` | Orders, Payments |
| `categories` | Categories CRUD |
| `brands` | Brands CRUD |
| `tags` | Tags CRUD |
| `coupons` | Coupons CRUD |
| `zones` | Delivery Zones |
| `content` | Banners |
| `settings` | Settings |
| `media` | Media |
| `admins` | Admins & Roles (this feature) |

Actions per resource: `read`, `create`, `update`, `delete`.

The `"all"` permission (array element, not resource key) grants access to everything. It appears in the login response as `permissions: ["all"]`.

## API Endpoint Summary

| Resource | Method | Endpoint | Request Body | Response |
|----------|--------|----------|-------------|----------|
| Admins | GET | `/api/admin/admins` | — | `AdminAccount[]` (array) |
| Admins | POST | `/api/admin/admins` | `AdminAccountFormData` | `{ id, name, email, role: { id, name }, is_active }` |
| Admins | PUT | `/api/admin/admins/:id` | Partial `AdminAccountFormData` | `{ id, name, email, role: { id, name }, is_active }` |
| Admins | DELETE | `/api/admin/admins/:id` | — | `{ message: "Admin deactivated successfully." }` |
| Roles | GET | `/api/admin/roles` | — | `AdminRole[]` (array) |
| Roles | POST | `/api/admin/roles` | `AdminRoleFormData` | `AdminRole` |
| Roles | PUT | `/api/admin/roles/:id` | Partial `AdminRoleFormData` | `AdminRole` |
| Roles | DELETE | `/api/admin/roles/:id` | — | `{ message: "Role deactivated successfully." }` or 409 `{ message }` |
