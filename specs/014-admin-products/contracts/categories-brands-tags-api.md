# API Contracts: Categories, Brands, Tags (Admin)

## `GET /api/admin/categories`

Returns all categories (flat list, includes inactive) for the category dropdown.

### Response: `200 OK`

```json
{
  "data": [
    {
      "id": "cat-uuid",
      "name": "Electronics",
      "slug": "electronics",
      "parent_id": null,
      "image_url": "https://example.com/electronics.jpg",
      "sort_order": 1,
      "is_active": true
    }
  ]
}
```

## `GET /api/admin/brands`

Returns all brands for the brand dropdown.

### Response: `200 OK`

```json
{
  "data": [
    {
      "id": "brand-uuid",
      "name": "Samsung",
      "slug": "samsung",
      "logo_url": null,
      "is_active": true
    }
  ]
}
```

## `GET /api/admin/tags`

Returns all tags for the tag multi-select.

### Response: `200 OK`

```json
{
  "data": [
    {
      "id": "tag-uuid",
      "name": "New Arrival",
      "slug": "new-arrival"
    }
  ]
}
```

### Error Responses (all three)

| Code | Reason |
|------|--------|
| 401 | Unauthenticated |
| 403 | Forbidden |

### Sources

`Techa Auth API.postman_collection.json` → Admin → Admin Categories, Admin Brands. Tags endpoint assumed from pattern (referenced in collection description but not expanded).
