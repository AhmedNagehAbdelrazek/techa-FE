# Admin Accounts API Contract

## Base URL

All endpoints are prefixed with `/api/admin`.

## Authentication

All endpoints require `Authorization: Bearer {{admin_token}}` header.

## Endpoints

### List Admins

```
GET /api/admin/admins
```

**Query Parameters:** None (returns all admin accounts).

**Response (200):**
```json
[
  {
    "id": "uuid1",
    "name": "Admin One",
    "email": "admin1@techa.com",
    "role": "super_admin",
    "is_active": true,
    "created_at": "2026-01-01T00:00:00.000Z"
  },
  {
    "id": "uuid2",
    "name": "Admin Two",
    "email": "admin2@techa.com",
    "role": "admin",
    "is_active": true,
    "created_at": "2026-02-01T00:00:00.000Z"
  }
]
```

**Note:** The `role` field is a string in the list response. In create/update responses, it is an object `{ id, name }`.

**Permissions:** Requires `admins.read`.

---

### Create Admin

```
POST /api/admin/admins
```

**Request Body:**
```json
{
  "name": "New Admin",
  "email": "newadmin@techa.com",
  "password": "NewAdmin@123",
  "role_id": 1
}
```

**Required fields:** `name`, `email`, `password`, `role_id`. `role_id` is the numeric ID from the roles table.

**Response (201):**
```json
{
  "id": "uuid",
  "name": "New Admin",
  "email": "newadmin@techa.com",
  "role": {
    "id": 1,
    "name": "admin"
  },
  "is_active": true
}
```

**Permissions:** Requires `admins.create`.

---

### Update Admin

```
PUT /api/admin/admins/:id
```

**Request Body** (partial update — all fields optional):
```json
{
  "name": "Updated Admin",
  "role_id": 1
}
```

`password` is optional on update. Leave blank/null to keep unchanged. `email` and `name` are also optional.

**Response (200):**
```json
{
  "id": 1,
  "name": "Updated Admin",
  "email": "admin@techa.com",
  "role": {
    "id": 1,
    "name": "super_admin"
  },
  "is_active": true
}
```

**Note:** In the Postman example, `id` is a number in the response. In practice, it is a UUID string.

**Permissions:** Requires `admins.update`.

---

### Deactivate Admin

```
DELETE /api/admin/admins/:id
```

**Response (200):**
```json
{
  "message": "Admin deactivated successfully."
}
```

**Permissions:** Requires `admins.delete`.

**Note:** This is a soft deactivation — the admin account is set to `is_active: false`. No hard delete endpoint exists.

---

### Reactivate Admin

```
PUT /api/admin/admins/:id
```

**Request Body:**
```json
{
  "is_active": true
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "name": "Reactivated Admin",
  "email": "admin@techa.com",
  "role": {
    "id": 1,
    "name": "admin"
  },
  "is_active": true
}
```

**Permissions:** Requires `admins.update`.

**Note:** No dedicated reactivate endpoint exists. Reactivation is done by updating `is_active` to `true` via the update endpoint.

## Error Responses

### Validation Error (422)
```json
{
  "message": "Validation failed",
  "errors": {
    "email": ["Email is required"],
    "password": ["Password must be at least 8 characters"]
  }
}
```

### Duplicate Email (409)
```json
{
  "message": "An admin with this email already exists"
}
```

### Self-Deactivation Rejected (400)
```json
{
  "message": "You cannot deactivate your own account"
}
```

### Not Found (404)
```json
{
  "message": "Admin not found"
}
```
