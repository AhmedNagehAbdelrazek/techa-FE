# API Contract: Media Upload

## `POST /api/upload`

Uploads an image file (JPEG, PNG, WebP, GIF, max 20MB). Returns the URL for use in product/variant image payloads. Not admin-specific — shared with customer-facing upload.

### Request

- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Auth**: Bearer token (admin or customer)
- **Field**: `file` — binary file data

### Response: `200 OK`

```json
{
  "url": "https://res.cloudinary.com/djfrgjrl5/image/upload/v1781952633/techa/zuzwxiyaz7dfehgxasp2.webp",
  "filename": "techa/zuzwxiyaz7dfehgxasp2",
  "cached": true
}
```

### Error Responses

| Code | Reason |
|------|--------|
| 400 | No file provided or invalid type |
| 401 | Unauthenticated |
| 413 | File too large (exceeds 20MB) |

### Source

`Techa Auth API.postman_collection.json` → Media → Upload Image

### Usage in Product Form

1. Admin selects a file via file input
2. UI uploads to `POST /api/upload` (multipart, Bearer admin token)
3. Store the returned `url` in the form state
4. Include the `url` in the product create/update `images[]` payload
