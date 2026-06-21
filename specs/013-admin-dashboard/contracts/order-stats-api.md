# API Contract: Order Statistics

## `GET /api/admin/orders/stats`

### Query Parameters

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `period` | `string` | No | `"30d"` | Period for comparison: `7d`, `30d`, `90d`, `this_month`, `last_month` |

### Response: `200 OK`

```json
{
  "total_orders": {
    "current": 150,
    "previous": 120,
    "change_pct": 25
  },
  "total_revenue": {
    "current": 25000.00,
    "previous": 22000.00,
    "change_pct": 13.64
  },
  "new_customers": {
    "current": 45,
    "previous": 35,
    "change_pct": 28.57
  },
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

### Error Responses

| Code | Reason |
|------|--------|
| 401 | Unauthenticated |
| 403 | Not an admin |
| 422 | Invalid `period` value |

### Source

`Techa Auth API.postman_collection.json` → Admin → Admin Orders → Order Statistics
