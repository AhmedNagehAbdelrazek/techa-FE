# API Contracts: Product Listing & Search

Base URL: `{{base_url}}/api` (via `NEXT_PUBLIC_API_URL` or `NEXT_PUBLIC_BACKEND_URL`)

Authentication: Public endpoints (no auth required for browsing/searching)

---

## List Products

Fetches paginated products with filtering and sorting.

```
GET /api/products
```

### Query Parameters

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `page` | number | No | 1 | Page number (1-indexed) |
| `limit` | number | No | 20 | Items per page |
| `search` | string | No | — | Search query (used on search page) |
| `category_id` | string | No | — | Filter by category ID |
| `brand_id` | string | No | — | Filter by brand ID(s); comma-separated for multiple |
| `min_price` | number | No | — | Minimum price filter |
| `max_price` | number | No | — | Maximum price filter |
| `sort` | enum | No | `newest` | Sort order: `newest`, `price_asc`, `price_desc`, `top_rated` |
| `in_stock` | boolean | No | — | Filter to only in-stock products (may not be supported) |
| `min_rating` | number | No | — | Minimum average rating (1–5) (may not be supported) |

### Success Response (200)

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Product Name",
      "slug": "product-name",
      "primary_image": "https://cdn.example.com/img.jpg",
      "brand_name": "Brand Name",
      "brand_id": "uuid",
      "average_rating": 4.5,
      "rating_count": 128,
      "base_price": 99.99,
      "discount_percent": 20,
      "final_price": 79.99,
      "stock_qty": 50,
      "category_id": "uuid",
      "category_name": "Electronics"
    }
  ],
  "meta": {
    "total": 143,
    "page": 1,
    "limit": 20,
    "total_pages": 8
  }
}
```

---

## Get Category Tree

Returns the full nested category hierarchy (active categories only).

```
GET /api/categories/tree
```

### Success Response (200)

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Electronics",
      "slug": "electronics",
      "parent_id": null,
      "image_url": "https://cdn.example.com/cat.jpg",
      "sort_order": 1,
      "children": [
        {
          "id": "uuid",
          "name": "Mobile Phones",
          "slug": "mobile-phones",
          "parent_id": "parent-uuid",
          "image_url": null,
          "sort_order": 1,
          "children": []
        }
      ]
    }
  ]
}
```

---

## List Brands

Returns all active brands as a flat list.

```
GET /api/brands
```

### Success Response (200)

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Samsung",
      "slug": "samsung",
      "logo_url": "https://cdn.example.com/samsung.png"
    }
  ]
}
```
