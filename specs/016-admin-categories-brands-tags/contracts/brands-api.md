# Contract: Admin Brands API

## Base URL

`{{base_url}}/api/admin/brands`

## Authentication

All requests require `Authorization: Bearer {{admin_token}}` header.

---

## List All Brands

`GET /api/admin/brands?page=1&limit=20`

### Query Parameters

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `page` | number | No | Page number (default: 1) |
| `limit` | number | No | Items per page (default: 20) |

### Success Response (200)

```json
{
  "data": [
    {
      "id": "brand-uuid",
      "name": "Samsung",
      "slug": "samsung",
      "description": "South Korean electronics manufacturer",
      "logo_url": "https://example.com/samsung-logo.png",
      "is_active": true
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

---

## Create Brand

`POST /api/admin/brands`

### Request Body

```json
{
  "name": "Samsung",
  "description": "South Korean electronics manufacturer",
  "logo_url": "https://example.com/samsung-logo.png"
}
```

### Success Response (201)

```json
{
  "id": "uuid",
  "name": "Samsung",
  "slug": "samsung",
  "description": "South Korean electronics manufacturer",
  "logo_url": "https://example.com/samsung-logo.png",
  "is_active": true
}
```

### Error Responses

| Status | Code | Description |
|--------|------|-------------|
| 422 | `VALIDATION_ERROR` | Missing required fields or duplicate slug |
| 409 | `CONFLICT` | Slug already exists |

---

## Update Brand

`PUT /api/admin/brands/:id`

### Request Body

```json
{
  "name": "Samsung Electronics",
  "description": "Updated description"
}
```

### Success Response (200)

```json
{
  "id": "uuid",
  "name": "Samsung Electronics",
  "slug": "samsung",
  "description": "Updated description",
  "logo_url": "https://example.com/samsung-logo.png",
  "is_active": true
}
```

---

## Deactivate Brand

`DELETE /api/admin/brands/:id`

### Success Response (200)

```json
{
  "message": "Brand deactivated successfully."
}
```

### Error Responses

| Status | Code | Description |
|--------|------|-------------|
| 409 | `CONFLICT` | Brand has active products |
