# API Contract: List All Orders (Admin)

## `GET /api/admin/orders`

Used for the recent orders table (limit=5, sort=newest).

### Query Parameters

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `limit` | `number` | No | `20` | Items per page |
| `page` | `number` | No | `1` | Page number |
| `sort` | `string` | No | (latest) | Sort order: `newest` |
| `status` | `string` | No | — | Filter by order status |
| `payment_status` | `string` | No | — | Filter by payment status |

### Response: `200 OK`

```json
{
  "data": [
    {
      "id": "uuid",
      "order_number": "ORD-001",
      "status": "pending",
      "payment_method": "cash_on_delivery",
      "payment_status": "pending",
      "total": 164.98,
      "item_count": 2,
      "created_at": "2026-06-01T10:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 5,
    "total": 1,
    "totalPages": 1
  }
}
```

### Notes

- The response does not include `customer_name` at the top level. If needed for the table, the dashboard should either:
  a. Use the `customer.full_name` from the order detail endpoint (requires N+1), or
  b. Ask backend to add `customer_name` to the list response, or
  c. Omit customer name from the recent orders table (show order number, total, status, date only)
- For this phase, we assume the backend will add `customer_name` or the field already exists in the response but isn't shown in the Postman sample. The implementation should use it if present, or fall back to showing order number + total + status + date.

### Error Responses

| Code | Reason |
|------|--------|
| 401 | Unauthenticated |
| 403 | Not an admin |

### Source

`Techa Auth API.postman_collection.json` → Admin → Admin Orders → List All Orders
