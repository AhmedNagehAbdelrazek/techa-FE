# API Contracts: Storefront Homepage

**Base URL**: `/api/v1` (proxied to `NEXT_PUBLIC_BACKEND_URL`)

**Note**: All public endpoints require no authentication. Responses use snake_case.

---

## Banners

### Get Active Banners

Fetches active banners filtered by position.

```
GET /api/banners?position=hero|mid_page
```

**Query Parameters**:

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `position` | string | No | Filter: `hero`, `mid_page`, `sidebar`, `popup` |

**Response** `200 OK`:

```json
[
  {
    "id": "uuid",
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
]
```

---

## Products

### List Products

Paginated product listing with filtering and sorting.

```
GET /api/products?page=1&limit=8&is_featured=true&sort=newest
```

**Query Parameters**:

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `page` | number | No | Page number (default: 1) |
| `limit` | number | No | Items per page (default: 20) |
| `search` | string | No | Search term |
| `category_id` | UUID | No | Filter by category |
| `brand_id` | UUID | No | Filter by brand |
| `min_price` | number | No | Minimum price filter |
| `max_price` | number | No | Maximum price filter |
| `sort` | string | No | Sort order: `newest` (default), `price_asc`, `price_desc`, `rating` |
| `is_featured` | boolean | No | Filter featured products |

**Response** `200 OK`:

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Product Name",
      "slug": "product-name",
      "description": "Product description",
      "base_price": 49.99,
      "discount_percent": 20,
      "primary_image": {
        "url": "https://cdn.example.com/product.jpg",
        "alt_text": "Product image"
      },
      "brand": {
        "id": "uuid",
        "name": "Brand Name",
        "slug": "brand-name"
      },
      "rating": {
        "average": 4.5,
        "count": 120
      },
      "is_featured": true,
      "created_at": "2026-06-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 8,
    "total": 45,
    "pages": 6
  }
}
```

**Homepage uses**: `is_featured=true&limit=8` for featured section, `sort=newest&limit=8` for new arrivals.

---

## Categories

### Get Category Tree

Returns the full nested category tree (active categories only), ordered by sort_order.

```
GET /api/categories/tree
```

**Response** `200 OK`:

```json
[
  {
    "id": "uuid",
    "name": "Electronics",
    "slug": "electronics",
    "image_url": "https://cdn.example.com/categories/electronics.jpg",
    "sort_order": 1,
    "is_active": true,
    "children": [
      {
        "id": "uuid",
        "name": "Phones",
        "slug": "phones",
        "image_url": null,
        "sort_order": 1,
        "is_active": true,
        "children": []
      }
    ]
  }
]
```

**Homepage usage**: Extract top-level nodes (root of array) for category grid. Each card links to `/category/:slug`.

---

## Error Responses

All endpoints return consistent error shapes:

```json
{
  "status": "error",
  "message": "Human-readable error description",
  "code": "ERROR_CODE"
}
```

| HTTP Status | Meaning |
|-------------|---------|
| `200` | Success |
| `400` | Bad request (invalid params) |
| `429` | Rate limited |
| `500` | Internal server error |
