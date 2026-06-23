# Contract: Admin Tags API

## Base URL

`{{base_url}}/api/admin/tags`

## Authentication

All requests require `Authorization: Bearer {{admin_token}}` header.

---

## List All Tags

`GET /api/admin/tags`

Returns all tags as a flat list.

### Success Response (200)

```json
{
  "data": [
    {
      "id": "tag-uuid",
      "name": "New Arrival",
      "slug": "new-arrival"
    },
    {
      "id": "tag-uuid2",
      "name": "Sale",
      "slug": "sale"
    }
  ]
}
```

---

## Create Tag

`POST /api/admin/tags`

### Request Body

```json
{
  "name": "New Tag"
}
```

### Success Response (201)

```json
{
  "id": "uuid",
  "name": "New Tag",
  "slug": "new-tag"
}
```

---

## Update Tag

`PUT /api/admin/tags/:id`

### Request Body

```json
{
  "name": "Updated Tag"
}
```

### Success Response (200)

```json
{
  "id": "uuid",
  "name": "Updated Tag",
  "slug": "updated-tag"
}
```

---

## Delete Tag

`DELETE /api/admin/tags/:id`

### Success Response (200)

```json
{
  "message": "Tag deleted successfully."
}
```
