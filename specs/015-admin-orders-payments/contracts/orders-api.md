# Contract: Admin Orders API

## Base URL

`{{base_url}}/api/admin/orders`

## Authentication

All requests require `Authorization: Bearer {{admin_token}}` header.

---

## List All Orders

`GET /api/admin/orders`

### Query Parameters

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `page` | number | No | Page number (default: 1) |
| `limit` | number | No | Items per page (default: 20) |
| `status` | string | No | Filter by order status: `pending`, `confirmed`, `processing`, `shipped`, `delivered`, `cancelled`, `refunded` |
| `payment_status` | string | No | Filter by payment status: `pending`, `paid`, `failed`, `refunded` |
| `search` | string | No | Search by order number or customer email |
| `date_from` | string | No | Start date filter (ISO format, e.g., `2026-06-01`) |
| `date_to` | string | No | End date filter (ISO format, e.g., `2026-06-30`) |
| `sort` | string | No | Sort field and direction (e.g., `created_at:desc`, `total:asc`) |

### Success Response (200)

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
      "customer": {
        "id": "uuid",
        "full_name": "Ahmed Ali",
        "email": "ahmed@example.com"
      },
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

---

## Get Order Detail

`GET /api/admin/orders/:id`

### Path Parameters

| Param | Type | Description |
|-------|------|-------------|
| `id` | string | Order UUID |

### Success Response (200)

```json
{
  "id": "uuid",
  "order_number": "ORD-001",
  "status": "pending",
  "payment_method": "cash_on_delivery",
  "payment_status": "pending",
  "subtotal": 150,
  "discount": 0,
  "shipping_charge": 65,
  "total": 215,
  "coupon": null,
  "notes": "",
  "shipping_address": {
    "id": "addr-uuid",
    "full_name": "Ahmed Ali",
    "phone": "+966501234567",
    "street": "123 Main St",
    "city": "Cairo",
    "state": "",
    "zip_code": "",
    "country": "Egypt",
    "zone_id": "zone-uuid"
  },
  "items": [
    {
      "id": "item-uuid",
      "product_id": "prod-uuid",
      "product_name": "Product Name",
      "variant_id": null,
      "variant_label": null,
      "qty": 2,
      "unit_price": 50,
      "total_price": 100
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
  "customer": {
    "id": "user-uuid",
    "full_name": "Ahmed Ali",
    "email": "ahmed@example.com",
    "phone": "+966501234567"
  },
  "payments": [],
  "created_at": "2026-06-01T10:00:00.000Z",
  "updated_at": "2026-06-01T10:00:00.000Z"
}
```

---

## Update Order Status

`PUT /api/admin/orders/:id/status`

### Path Parameters

| Param | Type | Description |
|-------|------|-------------|
| `id` | string | Order UUID |

### Request Body

```json
{
  "status": "confirmed"
}
```

Valid transitions (forward lifecycle only): `pending → confirmed → processing → shipped → delivered`. `cancelled` and `refunded` are supported by the backend but excluded from the frontend status modal (customer self-service cancel in Phase 9, refund in Phase 23).

### Success Response (200)

Same shape as Order Detail response, with `status` updated and an additional `status_history` entry appended.

### Error Responses

| Code | Description |
|------|-------------|
| 422 | Invalid transition (e.g., trying to go from `pending` to `delivered`) |
| 404 | Order not found |

---

## Order Statistics

`GET /api/admin/orders/stats`

### Query Parameters

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `period` | string | No | Period filter: `7d`, `30d`, `90d`, `this_month`, `last_month` (defaults to all) |

### Success Response (200)

```json
{
  "total_orders": 150,
  "total_revenue": 25000,
  "by_status": {
    "pending": 25,
    "confirmed": 30,
    "processing": 20,
    "shipped": 15,
    "delivered": 40,
    "cancelled": 15,
    "refunded": 5
  },
  "pending_payments": 10
}
```
