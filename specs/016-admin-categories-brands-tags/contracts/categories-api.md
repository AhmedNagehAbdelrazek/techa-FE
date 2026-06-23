# Contract: Admin Categories API

## Base URL

`{{base_url}}/api/admin/categories`

## Authentication

All requests require `Authorization: Bearer {{admin_token}}` header.

---

## List All Categories

`GET /api/admin/categories`

Returns the full nested category tree (active and inactive categories), ordered by `sort_order`.

### Success Response (200)

```json
{
  "data": [
    {
      "id": "cat-uuid",
      "name": "Electronics",
      "slug": "electronics",
      "image_url": "https://example.com/electronics.jpg",
      "sort_order": 1,
      "is_active": true,
      "parent_id": null,
      "children": [
        {
          "id": "sub-cat-uuid",
          "name": "Phones",
          "slug": "phones",
          "image_url": null,
          "sort_order": 1,
          "is_active": true,
          "parent_id": "cat-uuid",
          "children": []
        }
      ]
    }
  ]
}
```

---

## Create Category

`POST /api/admin/categories`

### Request Body

```json
{
  "name": "Electronics",
  "parent_id": null,
  "sort_order": 1,
  "image_url": "https://example.com/electronics.jpg"
}
```

### Success Response (201)

```json
{
  "id": "uuid",
  "name": "Electronics",
  "slug": "electronics",
  "parent_id": null,
  "image_url": "https://example.com/electronics.jpg",
  "sort_order": 1,
  "is_active": true
}
```

### Error Responses

| Status | Code | Description |
|--------|------|-------------|
| 422 | `VALIDATION_ERROR` | Missing required fields or duplicate slug |
| 409 | `CONFLICT` | Slug already exists |

---

## Update Category

`PUT /api/admin/categories/:id`

### Request Body

```json
{
  "name": "Electronics Updated",
  "sort_order": 2
}
```

### Success Response (200)

```json
{
  "id": "uuid",
  "name": "Electronics Updated",
  "slug": "electronics",
  "parent_id": null,
  "image_url": "https://example.com/electronics.jpg",
  "sort_order": 2,
  "is_active": true
}
```

---

## Deactivate Category

`DELETE /api/admin/categories/:id`

### Success Response (200)

```json
{
  "message": "Category deactivated successfully."
}
```

### Error Responses

| Status | Code | Description |
|--------|------|-------------|
| 409 | `CONFLICT` | Category has active products |
