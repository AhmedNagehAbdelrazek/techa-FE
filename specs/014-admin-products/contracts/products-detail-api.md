# API Contract: Get Product Detail (Admin)

## `GET /api/admin/products/:id`

Returns the full product with all nested relations (attributes, images, variants, tags).

### Response: `200 OK`

```json
{
  "id": "uuid",
  "name": "Product Name",
  "slug": "product-name",
  "category_id": "cat-uuid",
  "brand_id": "brand-uuid",
  "description": "Product description",
  "about_points": ["Point one", "Point two"],
  "base_price": 49.99,
  "discount_percent": 10,
  "is_active": true,
  "is_featured": false,
  "version": 3,
  "primary_image": {
    "url": "https://cdn.example.com/thumb.jpg",
    "alt_text": "Product thumbnail"
  },
  "stock_qty": 250,
  "category": {
    "id": "cat-uuid",
    "name": "Electronics",
    "slug": "electronics"
  },
  "brand": {
    "id": "brand-uuid",
    "name": "Samsung",
    "slug": "samsung"
  },
  "tags": [
    { "id": "tag-uuid", "name": "New Arrival", "slug": "new-arrival" }
  ],
  "attributes": [
    {
      "section": "details",
      "label": "Material",
      "value": "Aluminum",
      "sort_order": 0
    }
  ],
  "images": [
    {
      "id": "img-uuid",
      "url": "https://cdn.example.com/image.jpg",
      "alt_text": "Product image",
      "is_primary": true,
      "sort_order": 0
    }
  ],
  "variants": [
    {
      "id": "var-uuid",
      "sku": "PRD-BLK",
      "price": 49.99,
      "discount_percent": 0,
      "stock_qty": 100,
      "is_active": true,
      "version": 1,
      "options": [
        { "option_name": "color", "option_value": "black" }
      ],
      "images": []
    }
  ],
  "created_at": "2026-06-01T10:00:00.000Z",
  "updated_at": "2026-06-15T14:30:00.000Z"
}
```

### Error Responses

| Code | Reason |
|------|--------|
| 401 | Unauthenticated |
| 403 | Forbidden — missing `products.read` permission |
| 404 | Product not found |

### Source

Assumed pattern — returns the full product object matching the `AdminProduct` type. The response shape is inferred from the Create Product response example in Postman.
