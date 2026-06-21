# API Contracts: Notifications

Base path: `/api/notifications`

Authentication: Bearer token (JWT) via `Authorization` header. All endpoints require authenticated customer.

---

## GET /api/notifications

List paginated notifications for the current customer.

### Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | `number` | `1` | Page number (1-indexed) |
| `limit` | `number` | `20` | Items per page |

### Response (200)

```json
{
  "data": [
    {
      "id": "facf66d7-ab96-4d65-aa80-dff67d7c757b",
      "user_id": "d8923e67-56b9-40d1-9594-4affbce8f4ee",
      "type": "order_placed",
      "title": "Order Placed",
      "message": "Your order #ORD-20260620-0005 has been placed successfully.",
      "link": null,
      "is_read": false,
      "created_at": "2026-06-20T14:43:29.719Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1,
    "unread_count": 5
  }
}
```

### Error Responses

| Status | Body |
|--------|------|
| 401 | `{ "message": "Unauthenticated." }` |
| 500 | `{ "message": "Internal server error." }` |

---

## PATCH /api/notifications/:id/read

Mark a single notification as read.

### Path Parameters

| Param | Type | Description |
|-------|------|-------------|
| `id` | UUID | Notification ID |

### Response (204)

No content.

### Error Responses

| Status | Body |
|--------|------|
| 401 | `{ "message": "Unauthenticated." }` |
| 404 | `{ "message": "Notification not found." }` |
| 500 | `{ "message": "Internal server error." }` |

---

## PATCH /api/notifications/read-all

Mark all notifications as read for the current customer.

### Response (200)

```json
{
  "message": "All notifications marked as read."
}
```

### Error Responses

| Status | Body |
|--------|------|
| 401 | `{ "message": "Unauthenticated." }` |
| 500 | `{ "message": "Internal server error." }` |
