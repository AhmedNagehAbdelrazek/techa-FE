# Media API Contract

## Base URL

List/Delete endpoints are prefixed with `/api/admin`.
The legacy upload endpoint remains at `/api/upload` (general auth).

## Authentication

Admin media endpoints require `Authorization: Bearer {{admin_token}}` header.
The legacy `/api/upload` endpoint uses `Authorization: Bearer {{token}}` (general auth).

## Endpoints

### List Media

```
GET /api/admin/media?page=1&limit=20
```

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `page` | number | No | Page number (default: 1) |
| `limit` | number | No | Items per page (default: 20) |
| `mime_type` | string | No | Filter by mime type (e.g., `image/jpeg`) |
| `sort` | string | No | Sort field (e.g., `createdAt`) |
| `order` | string | No | Sort order (`asc` or `desc`) |

**Response (200):**
```json
{
  "data": [
    {
      "id": "media-uuid",
      "url": "https://res.cloudinary.com/.../image/upload/v1/techa/media/uuid.jpg",
      "filename": "photo.jpg",
      "mime_type": "image/jpeg",
      "file_size": 123456,
      "createdAt": "2026-06-23T10:00:00.000Z",
      "updatedAt": "2026-06-23T10:00:00.000Z"
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

**Permissions:** Requires `media.read`.

---

### Upload Media

```
POST /api/admin/media
```

**Content-Type:** `multipart/form-data`

**Form Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `files` | File[] | Yes | One or more files. JPEG, PNG, WebP, or GIF (max 20MB each). |

**Response (201):**
```json
{
  "data": [
    {
      "id": "media-uuid",
      "url": "https://res.cloudinary.com/.../image/upload/v1/techa/media/uuid.jpg",
      "filename": "photo.jpg",
      "mime_type": "image/jpeg",
      "file_size": 123456
    }
  ]
}
```

**Permissions:** Requires `media.create`.

---

### Delete Media

```
DELETE /api/admin/media/:id
```

**Response (200):**
```json
{
  "message": "Media file deleted successfully."
}
```

**Response (409 — Conflict / In Use):**
```json
{
  "message": "Cannot delete: file is used as product image, brand logo"
}
```

**Permissions:** Requires `media.delete`.

**Note:** The backend checks if the file is referenced by any product image, brand logo, or banner before deleting. If referenced, it returns a 409 Conflict with a descriptive message.

## Error Responses

### Validation Error (422)
```json
{
  "message": "Validation failed",
  "errors": {
    "files": ["Invalid file type. Allowed: JPEG, PNG, WebP, GIF"],
    "files": ["File exceeds maximum size of 20MB"]
  }
}
```

### Not Found (404)
```json
{
  "message": "Media file not found"
}
```

### Conflict (409)
```json
{
  "message": "Cannot delete: file is used as product image, brand logo"
}
```

## Legacy Upload (for reference)

```
POST /api/upload
```

**Auth:** `Bearer {{token}}` (general auth, not admin-specific)

**Form Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | File | Yes | Single file. JPEG, PNG, WebP, or GIF (max 20MB). |

**Response (200):**
```json
{
  "url": "https://res.cloudinary.com/.../image/upload/v123/techa/filename.webp",
  "filename": "techa/filename",
  "cached": true
}
```

This endpoint is still available but admin features should prefer `POST /api/admin/media` for persistent tracking.
