# API Contract: Customer Orders

**Base URL**: `{{base_url}}/api`

**Headers**: `Authorization: Bearer {{auth_token}}`, `Content-Type: application/json`

---

## List My Orders

`GET /api/orders`

Fetch the authenticated customer's orders, paginated and optionally filtered by status.

### Query Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `status` | `string` | No | Filter by status. Valid values: `pending`, `confirmed`, `processing`, `shipped`, `delivered`, `cancelled`, `refunded` |
| `page` | `number` | No | Page number (1-indexed, default: 1) |
| `limit` | `number` | No | Items per page (default: 20, max: 100) |

### Response (200)

```json
{
  "data": [
    {
      "id": "order-uuid",
      "order_number": "ORD-001",
      "status": "pending",
      "payment_method": "cash_on_delivery",
      "payment_status": "pending",
      "total": 164.98,
      "item_count": 2,
      "first_item_thumbnail": "https://cdn.example.com/thumb.jpg",
      "created_at": "2026-06-01T10:00:00.000Z"
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

### Error Response (401)

```json
{
  "status": "error",
  "message": "Authentication required",
  "code": "UNAUTHORIZED"
}
```

---

## Get Order Detail

`GET /api/orders/:id`

Returns full order detail with items, status history, shipping address, and payment information.

### Path Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `string` (UUID) | Yes | Order identifier |

### Response (200)

```json
{
  "id": "order-uuid",
  "order_number": "ORD-001",
  "status": "pending",
  "payment_method": "cash_on_delivery",
  "payment_status": "pending",
  "subtotal": 99.98,
  "discount": 0,
  "shipping_charge": 65,
  "total": 164.98,
  "coupon": null,
  "shipping_address": {
    "id": "addr-uuid",
    "full_name": "Ahmed Ali",
    "phone": "+966501234567",
    "street": "123 Main St",
    "city": "Cairo"
  },
  "notes": "",
  "items": [
    {
      "id": "item-uuid",
      "product_id": "prod-uuid",
      "product_name": "Product Name",
      "variant_id": null,
      "variant_label": null,
      "qty": 2,
      "unit_price": 49.99,
      "total_price": 99.98
    }
  ],
  "status_history": [
    {
      "from_status": null,
      "to_status": "pending",
      "changed_by": null,
      "changed_at": "2026-06-01T10:00:00.000Z"
    }
  ],
  "created_at": "2026-06-01T10:00:00.000Z",
  "updated_at": "2026-06-01T10:00:00.000Z"
}
```

### Error Response (404)

```json
{
  "status": "error",
  "message": "Order not found",
  "code": "NOT_FOUND"
}
```

---

## Cancel Order

`POST /api/orders/:id/cancel`

Cancel an order. Only allowed when status is `pending` or `confirmed`.

### Path Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| `id` | `string` (UUID) | Yes | Order identifier |

### Response (200)

Returns the updated Order object with status changed to `cancelled`.

```json
{
  "id": "order-uuid",
  "order_number": "ORD-001",
  "status": "cancelled",
  "payment_method": "cash_on_delivery",
  "payment_status": "pending",
  "subtotal": 99.98,
  "discount": 0,
  "shipping_charge": 65,
  "total": 164.98,
  ...
}
```

### Error Response (400)

```json
{
  "status": "error",
  "message": "Order can only be cancelled if status is pending or confirmed",
  "code": "INVALID_TRANSITION"
}
```

---

## Submit Payment Proof

`POST /api/payments/submit-proof`

Submit payment proof for a manual payment order (Instapay or Vodafone Cash).

### Request Body

```json
{
  "order_id": "order-uuid",
  "proof_reference": "INSTAPAY-12345",
  "proof_screenshot_url": "https://cdn.example.com/uploads/proof_abc123.jpg"
}
```

### Response (200)

```json
{
  "id": "pay-uuid",
  "order_id": "order-uuid",
  "payment_method": "instapay",
  "amount": 164.98,
  "status": "pending",
  "proof_reference": "INSTAPAY-12345",
  "proof_screenshot_url": "https://cdn.example.com/uploads/proof_abc123.jpg",
  "created_at": "2026-06-01T10:00:00.000Z"
}
```

---

## Upload Image

`POST /api/upload`

Upload an image file (JPEG, PNG, WebP, GIF, max 20MB). Returns the URL for use in payment proof submission.

### Request

`Content-Type: multipart/form-data`

| Field | Type | Required |
|-------|------|----------|
| `file` | `file` | Yes |

### Response (200)

```json
{
  "url": "https://cdn.example.com/uploads/proof_abc123.jpg"
}
```
