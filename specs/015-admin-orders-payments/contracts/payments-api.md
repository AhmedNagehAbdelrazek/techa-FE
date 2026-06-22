# Contract: Admin Payments API

## Base URL

`{{base_url}}/api/admin/payments`

## Authentication

All requests require `Authorization: Bearer {{admin_token}}` header.

---

## List Pending Payments

`GET /api/admin/payments/pending`

### Query Parameters

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `page` | number | No | Page number (default: 1) |
| `limit` | number | No | Items per page (default: 20) |

### Success Response (200)

```json
{
  "data": [
    {
      "id": "pay-uuid",
      "order_id": "order-uuid",
      "payment_method": "instapay",
      "amount": 215,
      "status": "pending",
      "proof_reference": "INSTAPAY-12345",
      "proof_screenshot_url": "https://cdn.example.com/proof.jpg",
      "created_at": "2026-06-01T10:00:00.000Z",
      "Order": {
        "id": "order-uuid",
        "order_number": "ORD-001",
        "status": "pending",
        "payment_status": "pending"
      },
      "User": {
        "id": "user-uuid",
        "full_name": "Ahmed Ali",
        "email": "ahmed@example.com"
      }
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

---

## Approve Payment

`PUT /api/admin/payments/:id/approve`

### Path Parameters

| Param | Type | Description |
|-------|------|-------------|
| `id` | string | Payment UUID |

### Request Body

None required.

### Success Response (200)

```json
{
  "payment": {
    "id": "pay-uuid",
    "status": "succeeded",
    "paid_at": "2026-06-01T11:00:00.000Z",
    "reviewed_by": "admin-uuid",
    "reviewed_at": "2026-06-01T11:00:00.000Z"
  },
  "order": {
    "id": "order-uuid",
    "order_number": "ORD-001",
    "status": "confirmed",
    "payment_status": "paid"
  }
}
```

### Error Responses

| Code | Description |
|------|-------------|
| 409 | Payment already processed (idempotency guard) |
| 404 | Payment not found |

---

## Reject Payment

`PUT /api/admin/payments/:id/reject`

### Path Parameters

| Param | Type | Description |
|-------|------|-------------|
| `id` | string | Payment UUID |

### Request Body

```json
{
  "rejection_note": "Screenshot is illegible, please upload a clearer image"
}
```

### Success Response (200)

```json
{
  "payment": {
    "id": "pay-uuid",
    "status": "failed",
    "reviewed_by": "admin-uuid",
    "reviewed_at": "2026-06-01T11:00:00.000Z",
    "rejection_note": "Screenshot is illegible"
  },
  "order": {
    "id": "order-uuid",
    "order_number": "ORD-001",
    "status": "pending",
    "payment_status": "failed"
  }
}
```

### Error Responses

| Code | Description |
|------|-------------|
| 409 | Payment already processed (idempotency guard) |
| 422 | Missing rejection_note |
| 404 | Payment not found |
