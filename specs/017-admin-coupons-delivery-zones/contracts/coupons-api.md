# Coupons API Contract

## Base URL

All endpoints are prefixed with `/api/admin`.

## Authentication

All endpoints require `Authorization: Bearer {{admin_token}}` header.

## Endpoints

### List Coupons

```
GET /api/admin/coupons?page=1&limit=20&is_active=
```

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `page` | number | No | Page number (default: 1) |
| `limit` | number | No | Items per page (default: 20) |
| `is_active` | boolean | No | Filter by active status (optional) |

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "product_id": null,
      "product": null,
      "code": "SAVE20",
      "discount_type": "percentage",
      "discount_value": 20,
      "min_order_amount": 0,
      "max_uses": 100,
      "used_count": 5,
      "expires_at": "2026-12-31T23:59:59Z",
      "is_active": true
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

### Create Coupon

```
POST /api/admin/coupons
```

**Request Body:**
```json
{
  "code": "SAVE20",
  "discount_type": "percentage",
  "discount_value": 20,
  "product_id": null,
  "max_uses": 100,
  "expires_at": "2026-12-31T23:59:59Z"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "product_id": null,
  "code": "SAVE20",
  "discount_type": "percentage",
  "discount_value": 20,
  "min_order_amount": 0,
  "max_uses": 100,
  "used_count": 0,
  "expires_at": "2026-12-31T23:59:59Z",
  "is_active": true
}
```

### Update Coupon

```
PUT /api/admin/coupons/:id
```

**Request Body** (partial update):
```json
{
  "discount_value": 25,
  "max_uses": 200
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "product_id": null,
  "code": "SAVE20",
  "discount_type": "percentage",
  "discount_value": 25,
  "min_order_amount": 0,
  "max_uses": 200,
  "used_count": 0,
  "expires_at": "2026-12-31T23:59:59Z",
  "is_active": true
}
```

### Deactivate Coupon

```
DELETE /api/admin/coupons/:id
```

**Response (200):**
```json
{
  "message": "Coupon deactivated successfully."
}
```

## Error Responses

### Validation Error (422)
```json
{
  "message": "Validation failed",
  "errors": {
    "code": ["Coupon code already exists"]
  }
}
```

### Not Found (404)
```json
{
  "message": "Coupon not found"
}
```
