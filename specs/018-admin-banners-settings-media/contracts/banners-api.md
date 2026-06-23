# Banners API Contract

## Base URL

All endpoints are prefixed with `/api/admin`.

## Authentication

All endpoints require `Authorization: Bearer {{admin_token}}` header.

## Endpoints

### List Banners

```
GET /api/admin/banners
```

**Query Parameters:** None (returns all banners).

**Response (200):**
```json
{
  "data": [
    {
      "id": "banner-uuid",
      "title": "Summer Sale",
      "description": "Get 50% off",
      "image_url": "https://cdn.example.com/banners/summer.jpg",
      "link_url": "https://techa.com/sale",
      "position": "hero",
      "sort_order": 1,
      "starts_at": "2026-06-01T00:00:00Z",
      "ends_at": "2026-07-01T00:00:00Z",
      "is_active": true
    }
  ]
}
```

**Permissions:** Requires `content.read`.

---

### Create Banner

```
POST /api/admin/banners
```

**Request Body:**
```json
{
  "title": "Summer Sale",
  "description": "Get 50% off on all items",
  "image_url": "https://cdn.example.com/banners/summer.jpg",
  "link_url": "https://techa.com/sale",
  "position": "hero",
  "sort_order": 1,
  "starts_at": "2026-06-01T00:00:00Z",
  "ends_at": "2026-07-01T00:00:00Z",
  "is_active": true
}
```

**Required fields:** `title`, `image_url`, `position`

**Response (201):**
```json
{
  "data": {
    "id": "banner-uuid",
    "title": "Summer Sale",
    "description": "Get 50% off on all items",
    "image_url": "https://cdn.example.com/banners/summer.jpg",
    "link_url": "https://techa.com/sale",
    "position": "hero",
    "sort_order": 1,
    "starts_at": "2026-06-01T00:00:00Z",
    "ends_at": "2026-07-01T00:00:00Z",
    "is_active": true
  }
}
```

**Permissions:** Requires `content.create`.

---

### Update Banner

```
PUT /api/admin/banners/:id
```

**Request Body** (partial update — all fields optional):
```json
{
  "title": "Summer Sale Updated",
  "sort_order": 2
}
```

**Response (200):**
```json
{
  "data": {
    "id": "banner-uuid",
    "title": "Summer Sale Updated",
    "description": "Get 50% off on all items",
    "image_url": "https://cdn.example.com/banners/summer.jpg",
    "link_url": "https://techa.com/sale",
    "position": "hero",
    "sort_order": 2,
    "starts_at": "2026-06-01T00:00:00Z",
    "ends_at": "2026-07-01T00:00:00Z",
    "is_active": true
  }
}
```

**Permissions:** Requires `content.update`.

---

### Delete Banner

```
DELETE /api/admin/banners/:id
```

**Response (200):**
```json
{
  "message": "Banner deleted successfully."
}
```

**Permissions:** Requires `content.delete`.

**Note:** This is a hard delete — the banner is permanently removed.

## Error Responses

### Validation Error (422)
```json
{
  "message": "Validation failed",
  "errors": {
    "title": ["Title is required"],
    "image_url": ["Image URL is required"]
  }
}
```

### Not Found (404)
```json
{
  "message": "Banner not found"
}
```
