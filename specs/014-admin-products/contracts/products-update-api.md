# API Contract: Update Product (Admin)

## `PUT /api/admin/products/:id`

Updates a product with inline variant create/update/destroy and image management. Uses optimistic locking via `version`.

### Request Body

```json
{
  "name": "Updated Product",
  "base_price": 39.99,
  "description": "Updated description",
  "version": 1,
  "variants": [
    {
      "id": "existing-variant-id",
      "version": 1,
      "price": 39.99,
      "stock_qty": 200
    },
    {
      "sku": "PRD-WHT",
      "price": 44.99,
      "stock_qty": 50,
      "options": [
        { "option_name": "color", "option_value": "white" }
      ]
    },
    {
      "id": "variant-to-destroy",
      "_destroy": true
    }
  ],
  "images": [
    {
      "url": "https://cdn.example.com/new-image.jpg",
      "alt_text": "New image",
      "is_primary": true,
      "sort_order": 0
    }
  ],
  "is_featured": true
}
```

### Variant Operations

| Pattern | Behavior |
|---------|----------|
| `{ id, version, ...fields }` | Updates an existing variant (optimistic locking via `version`) |
| `{ sku, price, ... }` (no `id`) | Creates a new variant |
| `{ id, _destroy: true }` | Soft-deletes (deactivates) a variant |

### Response: `200 OK`

Returns the full updated product object (same shape as `GET /api/admin/products/:id`).

### Error Responses

| Code | Reason |
|------|--------|
| 400 | Validation error |
| 401 | Unauthenticated |
| 403 | Forbidden — missing `products.update` permission |
| 404 | Product not found |
| 409 | Version conflict (optimistic locking) or slug conflict |

### Source

`Techa Auth API.postman_collection.json` → Admin → Admin Products → Update Product (inline variants & images)
