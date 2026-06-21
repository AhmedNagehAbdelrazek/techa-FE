# API Contract: List All Products (Admin)

## `GET /api/admin/products`

Paginated, filterable, searchable product list for the admin products table.

### Query Parameters

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `page` | `number` | No | `1` | Page number |
| `limit` | `number` | No | `20` | Items per page |
| `search` | `string` | No | — | Full-text search on name |
| `category_id` | `string` | No | — | Filter by category |
| `brand_id` | `string` | No | — | Filter by brand |
| `is_active` | `boolean` | No | — | Filter by active/inactive |
| `sort` | `string` | No | `newest` | Sort order (e.g. `newest`, `oldest`, `price_asc`, `price_desc`, `name_asc`, `name_desc`) |

### Response: `200 OK`

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Product Name",
      "slug": "product-name",
      "base_price": 49.99,
      "discount_percent": 10,
      "is_active": true,
      "stock_qty": 250,
      "primary_image": {
        "url": "https://cdn.example.com/thumb.jpg",
        "alt_text": "Product thumbnail"
      },
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
      "created_at": "2026-06-01T10:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "totalPages": 8
  }
}
```

### Error Responses

| Code | Reason |
|------|--------|
| 401 | Unauthenticated |
| 403 | Forbidden — missing `products.read` permission |

### Source

Assumed pattern — follows `GET /api/admin/orders` admin list convention. Not explicitly in Postman collection. The `data` + `meta` envelope mirrors the customer-facing products endpoint.
