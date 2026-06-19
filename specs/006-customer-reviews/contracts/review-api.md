# API Contracts: Customer Reviews

Base URL: `{{base_url}}/api` (via `NEXT_PUBLIC_API_URL` or rewrite)

Authentication: Review list is public (no auth). Create/update/delete/eligibility require Bearer auth token.

---

## Get Product Reviews

Fetches paginated reviews for a product.

```
GET /api/products/:productId/reviews?page=1&limit=10
```

### Parameters

| Param | Type | Location | Required | Default | Description |
|-------|------|----------|----------|---------|-------------|
| `productId` | string (uuid) | Path | Yes | — | Product ID |
| `page` | number | Query | No | 1 | Page number |
| `limit` | number | Query | No | 10 | Reviews per page |

### Success Response (200)

```json
{
  "data": [
    {
      "id": "3e64040b-5b3a-4d33-a92b-bee1677e6c85",
      "rating": 5,
      "comment": "Excellent phone! Camera is amazing.",
      "reviewer_name": "Ahmed Ali",
      "relative_date": "5 hours ago",
      "is_verified": true,
      "user": {
        "id": "d8923e67-56b9-40d1-9594-4affbce8f4ee",
        "name": "Ahmed Ali",
        "avatar_url": null
      }
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

## Create Review

Creates a new review for a product. Requires authentication and a delivered order containing this product.

```
POST /api/products/:productId/reviews
```

### Headers

| Header | Value | Required |
|--------|-------|----------|
| `Authorization` | `Bearer {{auth_token}}` | Yes |
| `Content-Type` | `application/json` | Yes |

### Request Body

```json
{
  "rating": 5,
  "comment": "Excellent product!",
  "order_item_id": "order-item-uuid"
}
```

### Success Response (201)

```json
{
  "id": "rev-uuid",
  "product_id": "prod-uuid",
  "rating": 5,
  "comment": "Excellent product!",
  "is_verified": true,
  "is_active": true,
  "created_at": "2026-06-01T10:00:00.000Z"
}
```

### Error Response (409 — Duplicate review)

```json
{
  "status": "error",
  "message": "You have already reviewed this product.",
  "code": "DUPLICATE_REVIEW"
}
```

---

## Update Review

Updates the authenticated user's own review.

```
PUT /api/reviews/:reviewId
```

### Headers

| Header | Value | Required |
|--------|-------|----------|
| `Authorization` | `Bearer {{auth_token}}` | Yes |
| `Content-Type` | `application/json` | Yes |

### Request Body

```json
{
  "rating": 4,
  "comment": "Updated review"
}
```

### Success Response (200)

```json
{
  "id": "rev-uuid",
  "product_id": "prod-uuid",
  "rating": 4,
  "comment": "Updated review",
  "is_verified": true,
  "is_active": true,
  "created_at": "2026-06-01T10:00:00.000Z"
}
```

---

## Delete Review

Soft-deletes the authenticated user's own review.

```
DELETE /api/reviews/:reviewId
```

### Headers

| Header | Value | Required |
|--------|-------|----------|
| `Authorization` | `Bearer {{auth_token}}` | Yes |

### Success Response (200)

```json
{
  "message": "Review deleted successfully"
}
```

---

## Check Review Eligibility

Checks whether the authenticated user can write a review for this product.

```
GET /api/products/:productId/reviews/eligibility
```

### Headers

| Header | Value | Required |
|--------|-------|----------|
| `Authorization` | `Bearer {{auth_token}}` | Yes |

### Success Responses (200)

Can review:
```json
{
  "can_review": true
}
```

Already reviewed:
```json
{
  "can_review": false,
  "reason": "You have already reviewed this product."
}
```

No purchase:
```json
{
  "can_review": false,
  "reason": "You need to purchase this product before reviewing it."
}
```
