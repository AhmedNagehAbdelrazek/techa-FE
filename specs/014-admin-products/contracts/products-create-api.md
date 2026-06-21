# API Contract: Create Product (Admin)

## `POST /api/admin/products`

Creates a new product with inline variants, images, attributes, and tags.

### Request Body

```json
{
  "name": "New Product",
  "category_id": "cat-uuid",
  "brand_id": null,
  "base_price": 49.99,
  "discount_percent": 0,
  "description": "Product description",
  "about_points": ["Point one", "Point two"],
  "is_featured": false,
  "attributes": [
    {
      "section": "details",
      "label": "Material",
      "value": "Aluminum",
      "sort_order": 0
    }
  ],
  "tag_ids": [],
  "variants": [
    {
      "sku": "PRD-BLK",
      "price": 49.99,
      "stock_qty": 100,
      "discount_percent": 0,
      "options": [
        { "option_name": "color", "option_value": "black" }
      ]
    }
  ],
  "images": [
    {
      "url": "https://cdn.example.com/product.jpg",
      "alt_text": "Product image",
      "is_primary": true,
      "sort_order": 0
    }
  ]
}
```

### Response: `201 Created`

Returns the full created product object (same shape as `GET /api/admin/products/:id`).

### Error Responses

| Code | Reason |
|------|--------|
| 400 | Validation error (missing required fields, invalid values) |
| 401 | Unauthenticated |
| 403 | Forbidden — missing `products.create` permission |
| 409 | Conflict (e.g. slug already exists) |

### Source

`Techa Auth API.postman_collection.json` → Admin → Admin Products → Create Product (inline variants & images)
