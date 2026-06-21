# Data Model: Customer Notifications

## Notification

Represents a single notification sent to a customer.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` (UUID) | ✅ | Unique identifier |
| `user_id` | `string` (UUID) | ✅ | The customer this notification belongs to |
| `type` | `string` | ✅ | Notification category: `system`, `order_placed`, `order_confirmed`, `order_shipped`, `order_delivered` |
| `title` | `string` | ✅ | Short notification heading |
| `message` | `string` | ✅ | Notification body text |
| `link` | `string` (URL) \| `null` | ❌ | Optional navigation URL when clicked |
| `is_read` | `boolean` | ✅ | Whether the customer has viewed this notification |
| `created_at` | `string` (ISO 8601) | ✅ | When the notification was created |

## Notifications List Response

| Field | Type | Description |
|-------|------|-------------|
| `data` | `Notification[]` | Array of notification objects for the current page |
| `meta` | `Meta` | Pagination metadata |

### Meta

| Field | Type | Description |
|-------|------|-------------|
| `page` | `number` | Current page number |
| `limit` | `number` | Items per page |
| `total` | `number` | Total notifications across all pages |
| `totalPages` | `number` | Total number of pages |
| `unread_count` | `number` | Total unread notifications for this customer |

## Query Parameters (GET /api/notifications)

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | `number` | `1` | Page number (1-indexed) |
| `limit` | `number` | `20` | Items per page |

## State Transitions

```
[unread] ──(click notification with link)──→ [read] + navigate to link
[unread] ──(click notification without link)──→ [read] + stay
[unread] ──(mark all as read)──→ [read]
[unread] ──(open dropdown)──→ notifications in dropdown → [read]
```

- Notifications are **immutable after creation** — only `is_read` transitions from `false` → `true`.
- There is no delete or archive operation in this feature scope.
- Real-time updates (new notifications appearing without refresh) are deferred.

## Validation Rules

- `id`: Must be a valid UUID v4
- `type`: Must be one of the known types (frontend treats all equally)
- `is_read`: Defaults to `false` on creation; can only transition to `true`
- `created_at`: Read-only, set by server
