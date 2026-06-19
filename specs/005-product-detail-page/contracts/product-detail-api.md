# API Contracts: Product Detail Page

Base URL: `{{base_url}}/api` (via `NEXT_PUBLIC_API_URL` or `NEXT_PUBLIC_BACKEND_URL`)

Authentication: Product/review endpoints are public (no auth required). Wishlist and coupon validation require Bearer auth token.

---

## Get Product by Slug

Fetches full product details including attributes, variants, images, and initial reviews.

```
GET /api/products/:slug
```

### Parameters

| Param | Type | Location | Required | Description |
|-------|------|----------|----------|-------------|
| `slug` | string | Path | Yes | Product URL slug |

### Success Response (200)

```json
{
  "id": "prod-uuid",
  "name": "Product Name",
  "slug": "product-name",
  "description": "Product description",
  "about_points": ["Point one", "Point two"],
  "base_price": 49.99,
  "discount_percent": 10,
  "rating_avg": 4.5,
  "rating_count": 20,
  "is_featured": true,
  "category": {
    "id": "cat-uuid",
    "name": "Electronics",
    "slug": "electronics"
  },
  "brand": {
    "id": "brand-uuid",
    "name": "Samsung",
    "slug": "samsung",
    "logo_url": "https://example.com/samsung-logo.png"
  },
  "attributes": {
    "details": [{ "label": "Material", "value": "Aluminum" }],
    "specs": [{ "label": "Weight", "value": "200g" }]
  },
  "images": [
    {
      "id": "img-uuid",
      "url": "https://cdn.example.com/product.jpg",
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
      "discount_percent": 10,
      "stock_qty": 100,
      "is_active": true,
      "options": [{ "option_name": "color", "option_value": "black" }],
      "images": []
    }
  ],
  "reviews": [
    {
      "id": "rev-uuid",
      "rating": 5,
      "comment": "Great!",
      "reviewer_name": "Ahmed Ali",
      "relative_date": "2 weeks ago",
      "is_verified": true
    }
  ],
  "tags": [
    { "id": "tag-uuid", "name": "New Tag", "slug": "new-tag" }
  ]
}
```

### Error Response (404)

```json
{
  "status": "error",
  "message": "Product not found",
  "code": "NOT_FOUND"
}
```

---

## Get Product Reviews

Fetches paginated reviews for a product.

```
GET /api/products/:productId/reviews
```

### Query Parameters

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `page` | number | No | 1 | Page number |
| `limit` | number | No | 10 | Reviews per page |

### Success Response (200)

```json
{
  "data": [
    {
      "id": "rev-uuid",
      "rating": 5,
      "comment": "Excellent product!",
      "reviewer_name": "Ahmed Ali",
      "relative_date": "2 weeks ago",
      "is_verified": true
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

---

## Validate Coupon

Validates a coupon code for a specific product.

```
POST /api/coupons/validate
```

### Headers

| Header | Value | Required |
|--------|-------|----------|
| `Authorization` | `Bearer {{auth_token}}` | Yes |
| `Content-Type` | `application/json` | Yes |

### Request Body

```json
{
  "code": "SAVE20",
  "product_id": "prod-uuid"
}
```

### Success Response (200)

```json
{
  "valid": true,
  "discount_amount": 10,
  "discount_type": "percentage",
  "message": null
}
```

### Error Response (400)

```json
{
  "valid": false,
  "discount_amount": 0,
  "discount_type": null,
  "message": "Invalid or expired coupon code"
}
```

---

## Add to Cart

Adds a product (or specific variant) to the customer's cart.

```
POST /api/cart
```

### Headers

| Header | Value | Required |
|--------|-------|----------|
| `Authorization` | `Bearer {{auth_token}}` | Yes |
| `Content-Type` | `application/json` | Yes |

### Request Body

```json
{
  "product_id": "prod-uuid",
  "variant_id": null,
  "quantity": 1
}
```

### Success Response (201)

```json
{
  "id": "cart-item-uuid",
  "product_id": "prod-uuid",
  "variant_id": null,
  "quantity": 1,
  "unit_price": 49.99
}
```

### Error Response (400 - Out of stock)

```json
{
  "status": "error",
  "message": "Insufficient stock",
  "code": "STOCK_INSUFFICIENT"
}
```

---

## Add to Wishlist

Adds a product to the authenticated user's wishlist.

```
POST /api/wishlist
```

### Headers

| Header | Value | Required |
|--------|-------|----------|
| `Authorization` | `Bearer {{auth_token}}` | Yes |
| `Content-Type` | `application/json` | Yes |

### Request Body

```json
{
  "product_id": "prod-uuid",
  "variant_id": null
}
```

### Success Response (200)

```json
{
  "id": "wish-uuid",
  "user_id": "user-uuid",
  "product_id": "prod-uuid",
  "variant_id": null,
  "created_at": "2026-06-01T10:00:00.000Z"
}
```

---

## Remove from Wishlist

Removes a product from the authenticated user's wishlist.

```
DELETE /api/wishlist/:wishlistId
```

### Headers

| Header | Value | Required |
|--------|-------|----------|
| `Authorization` | `Bearer {{auth_token}}` | Yes |

### Success Response (204)

No content.

---

## Get Wishlist

Fetches the authenticated user's wishlist.

```
GET /api/wishlist
```

### Headers

| Header | Value | Required |
|--------|-------|----------|
| `Authorization` | `Bearer {{auth_token}}` | Yes |

### Success Response (200)

```json
[
  {
    "id": "wish-uuid",
    "user_id": "user-uuid",
    "product_id": "prod-uuid",
    "variant_id": null,
    "created_at": "2026-06-01T10:00:00.000Z",
    "Product": {
      "id": "prod-uuid",
      "name": "Product Name",
      "slug": "product-name",
      "base_price": 49.99,
      "is_active": true
    },
    "ProductVariant": null
  }
]
```
