# Roles API Contract

## Base URL

All endpoints are prefixed with `/api/admin`.

## Authentication

All endpoints require `Authorization: Bearer {{admin_token}}` header.

## Endpoints

### List Roles

```
GET /api/admin/roles
```

**Query Parameters:** None (returns all roles).

**Response (200):**
```json
[
  {
    "id": "uuid",
    "name": "super_admin",
    "permissions": {
      "products": ["create", "read", "update", "delete"],
      "orders": ["create", "read", "update", "delete"]
    },
    "is_active": true,
    "version": 1,
    "createdat": "2026-01-01T00:00:00.000Z",
    "updatedat": "2026-01-01T00:00:00.000Z"
  }
]
```

**Note:** `permissions` is an object (Record), not an array. Keys are resource names, values are arrays of action strings. Timestamps use lowercase keys `createdat` / `updatedat` (no underscore).

**Permissions:** Requires `admins.read`.

---

### Create Role

```
POST /api/admin/roles
```

**Request Body:**
```json
{
  "name": "custom_role",
  "permissions": {
    "products": ["read"],
    "orders": ["read", "update"]
  }
}
```

**Required fields:** `name`, `permissions`.

**Response (201):**
```json
{
  "id": "uuid",
  "name": "custom_role",
  "permissions": {
    "products": ["read"],
    "orders": ["read", "update"]
  },
  "is_active": true,
  "version": 1,
  "createdat": "2026-01-01T00:00:00.000Z",
  "updatedat": "2026-01-01T00:00:00.000Z"
}
```

**Permissions:** Requires `admins.create`.

---

### Update Role

```
PUT /api/admin/roles/:id
```

**Request Body** (partial update — all fields optional):
```json
{
  "name": "custom_role_updated",
  "permissions": {
    "products": ["create", "read", "update", "delete"],
    "orders": ["read", "update"]
  }
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "name": "custom_role_updated",
  "permissions": {
    "products": ["create", "read", "update", "delete"],
    "orders": ["read", "update"]
  },
  "is_active": true,
  "version": 2,
  "createdat": "2026-01-01T00:00:00.000Z",
  "updatedat": "2026-01-01T00:00:00.000Z"
}
```

**Permissions:** Requires `admins.update`.

---

### Deactivate Role

```
DELETE /api/admin/roles/:id
```

**Response (200) — Success:**
```json
{
  "message": "Role deactivated successfully."
}
```

**Response (409) — Conflict (role has assigned admins):**
```json
{
  "message": "Cannot deactivate role: N admin(s) are assigned to this role"
}
```

**Permissions:** Requires `admins.delete`.

**Note:** This is a soft deactivation — the role is set to `is_active: false`. No hard delete endpoint exists. If the role has admins assigned, the backend returns 409 Conflict.

## Error Responses

### Validation Error (422)
```json
{
  "message": "Validation failed",
  "errors": {
    "name": ["Name is required"]
  }
}
```

### Conflict (409)
```json
{
  "message": "Cannot deactivate role: N admin(s) are assigned to this role"
}
```

### Not Found (404)
```json
{
  "message": "Role not found"
}
```
