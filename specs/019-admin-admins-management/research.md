# Research: Admin Admins & Roles Management

## Tech Stack Decisions

### API Client Pattern
- **Decision**: Use `adminRequest` from `src/lib/api/AdminRequest.ts` for both admins and roles.
- **Rationale**: Both use `{{admin_token}}` based on Postman collection. All endpoints require `Authorization: Bearer {{admin_token}}`.
- **Alternatives**: Using `Request.ts` (customer client) — rejected because admin endpoints require admin token.

### State Management
- **Decision**: TanStack React Query v5 for admins list, roles list.
- **Rationale**: Both are server-state fetched from API with potential future pagination (admins).
- **Alternatives**: Local state — rejected because React Query provides caching, background refetching, and mutation invalidation.

### Permission Gating
- **Decision**: `useAdminStore` with `EMPTY_PERMISSIONS` hoisted pattern (same as Phases 14-18).
- **Rationale**: Both pages use `"admins"` resource key. Page access requires `admins.read` or `"all"`. Action buttons gated by `create`/`update`/`delete`.
- **Pattern**:
  ```tsx
  const EMPTY_PERMISSIONS: Record<string, string[]> = {};
  const permissions = useAdminStore((s) => s.admin?.permissions ?? EMPTY_PERMISSIONS);
  const canRead = permissions["admins"]?.includes("read") ?? permissions["all"] != null;
  ```

### Form Validation (Admins)
- **Decision**: Use `react-hook-form` with `zod` for admin create/edit form.
- **Rationale**: Admin form has multiple fields (name, email, password, role) with validation rules. Password is conditional (required on create, optional on edit).
- **Schema**:
  ```typescript
  const adminFormSchema = z.object({
    name: z.string().min(1, "Name is required").max(200),
    email: z.string().email("Invalid email format"),
    password: z.string().min(8, "Password must be at least 8 characters").optional().or(z.literal("")),
    role_id: z.coerce.number({ required_error: "Role is required" }),
  });
  ```

### Form State (Roles)
- **Decision**: Use controlled state with `useState` for role create/edit form.
- **Rationale**: Role form is simpler — name text input + permission checkboxes. No need for react-hook-form overhead.
- **Pattern**:
  ```tsx
  const [name, setName] = useState(role?.name ?? "");
  const [permissions, setPermissions] = useState<Record<string, string[]>>(role?.permissions ?? {});
  ```

### Permission Checkboxes (Roles)
- **Decision**: Render grouped checkboxes. Each resource key (e.g. "products", "orders") is a group header with read/create/update/delete checkboxes below it.
- **Rationale**: Backend stores permissions as `Record<string, string[]>`. Grouped checkboxes map directly to this structure.
- **Pattern**: Hardcoded list of known resource keys from the existing codebase: `products`, `orders`, `categories`, `brands`, `tags`, `coupons`, `zones`, `content` (banners), `settings`, `media`, `admins`. Pre-checked based on existing role permissions on edit.

### Role Dropdown in Admin Form
- **Decision**: Fetch roles from `GET /api/admin/roles` when the admin dialog opens. Cache with React Query.
- **Rationale**: Roles list is relatively static — can be cached aggressively.
- **Failure handling**: On fetch failure, show error toast with retry button, disable role dropdown, block form submission.

### Deactivation vs Hard Delete
- **Decision**: Both admins and roles use soft-deactivation (not hard delete). Admin deactivation: `DELETE /api/admin/admins/:id` returns `"Admin deactivated successfully."`. Role deactivation: `DELETE /api/admin/roles/:id` returns `"Role deactivated successfully."`.
- **Rationale**: Spec requires reversible deactivation. Postman confirms both return deactivation messages.
- **Reactivation**: Admin reactivation via `PUT /api/admin/admins/:id` with `{ is_active: true }`. No reactivate endpoint for roles in spec (roles deactivation is permanent given no reactivate use case).

### Self-Deactivation Handling
- **Decision**: The frontend sends the deactivation request. If backend returns 400 with a self-deactivation message, show the error toast and do not update the row.
- **Rationale**: Backend validates and rejects self-deactivation. Frontend should gracefully handle the error.
- **Pattern**: Compare logged-in admin's ID with the row ID. If they match, show a warning in the AlertDialog: "You are deactivating your own account. This action cannot be undone."

### Role Deletion Conflict (Role Has Admins)
- **Decision**: On deactivate attempt, show AlertDialog confirmation. Backend returns 409 if role has assigned admins. Show error toast with backend message on 409. Do not remove from table.
- **Rationale**: Prevents orphan role references. UX matches Phase 17 media delete 409 handling.
- **Pattern**: Similar to media delete 409 — catch 409 in mutation error handler, show toast, keep item in grid.

### Role Display in Admin Table
- **Decision**: Normalize role display with a helper: `typeof role === "string" ? role : role.name`. The list endpoint returns `role` as string, create/update return `role` as object.
- **Rationale**: Avoids type complexity in the API layer — simple display-time coercion.
- **Pattern**: `const roleLabel = typeof admin.role === "string" ? admin.role : admin.role?.name ?? "-"`

### Admin Password Field
- **Decision**: On create: required field with 8-char minimum. On edit: optional field, leave blank to keep unchanged.
- **Rationale**: Standard pattern for user management forms. Backend ignores password field if empty/null on update.

### React Query Keys Pattern
```typescript
export const adminAdminsRolesKeys = {
  all: ["admin", "admins-roles"] as const,
  admins: () => [...adminAdminsRolesKeys.all, "admins"] as const,
  admin: (id: string) => [...adminAdminsRolesKeys.admins(), id] as const,
  roles: () => [...adminAdminsRolesKeys.all, "roles"] as const,
  role: (id: string) => [...adminAdminsRolesKeys.roles(), id] as const,
};
```

## Existing Code Patterns

### Skeleton Export Pattern
Each component exports `*Skeleton` for loading states.

### Dialog CRUD Pattern
```tsx
// Dialog opens on "Add" / "Edit" button click
// Form inside Dialog uses react-hook-form + zod (admins) or controlled state (roles)
// On submit, calls create or update mutation
// On success, invalidates list query, closes Dialog, shows toast
// On error, shows toast with error message
```

### Pagination Pattern (from admin-products, admin-orders)
Uses `useQuery` with page/limit params, `keepPreviousData`, and a pagination component.
Note: admin list is not paginated in current Postman spec, but the table component should be prepared for pagination.

## No New NPM Packages

All required dependencies are already in `package.json`:
- `lucide-react` — icons (Plus, Pencil, Shield, ShieldOff, Trash2, Check, X, etc.)
- `sonner` — toasts
- `@tanstack/react-query` — server state
- `zustand` — `useAdminStore`
- `react-hook-form` + `zod` + `@hookform/resolvers` — form validation (admin form)
- shadcn/ui components: Table, Dialog, AlertDialog, Badge, Badge, Button, Input, Textarea, Select, ErrorState, EmptyState, Skeleton, all already present
