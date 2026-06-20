# Data Model: Customer Order History & Detail

## Overview

This phase extends the Order data types created in Phase 8 (checkout) with list-level pagination and filtering types. The core `Order`, `OrderItem`, `OrderStatusHistory`, and `Address` entities remain the same.

## New Types

### OrdersQueryParams

Parameters for fetching a paginated, filtered list of customer orders.

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| `status` | `string` | Filter by status (pending, confirmed, processing, shipped, delivered, cancelled, refunded) | No |
| `page` | `number` | Page number (1-indexed) | No |
| `limit` | `number` | Items per page (default: 20) | No |

### Meta (Pagination)

Pagination metadata returned by the API.

| Field | Type | Description |
|-------|------|-------------|
| `page` | `number` | Current page number |
| `limit` | `number` | Items per page |
| `total` | `number` | Total number of items across all pages |
| `totalPages` | `number` | Total number of pages |

### OrdersListResponse

The paginated response envelope for the order list API.

| Field | Type | Description |
|-------|------|-------------|
| `data` | `OrderListItem[]` | Array of order list items |
| `meta` | `Meta` | Pagination metadata |

### OrderListItem

A condensed order representation for the list view.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` (UUID) | Order identifier |
| `order_number` | `string` | Human-readable order number |
| `status` | `string` | Order status |
| `payment_method` | `string` | Payment method key |
| `payment_status` | `string` | Payment payment_status |
| `total` | `number` | Grand total |
| `item_count` | `number` | Number of items in the order |
| `first_item_thumbnail` | `string \| null` | URL of the first product's thumbnail image |
| `created_at` | `string` (ISO 8601) | Order creation timestamp |

## Existing Types (Referenced)

These types were defined in Phase 8 and remain unchanged:

- **Order** — Full order detail with items, status history, address, payment info, financial breakdown
- **OrderItem** — Product line within an order (product_name, variant_label, qty, unit_price, line_total)
- **OrderStatusHistory** — Status transition record (status, changed_at, from_status, to_status)
- **Address** — Shipping address snapshot
- **Payment** (via Order.payments) — Payment transaction with proof reference, screenshot URL, review status

## API Contract Updates

### GET /api/orders (Enhanced)

Existing endpoint from Phase 8. Updated to accept query parameters:

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | `string` | Filter by order status |
| `page` | `number` | Page number (default: 1) |
| `limit` | `number` | Items per page (default: 20) |

**Response**: `OrdersListResponse` with `data: OrderListItem[]` and `meta: Meta`

### GET /api/orders/:id

Existing endpoint from Phase 8. Returns full `Order` detail. No changes.

### POST /api/orders/:id/cancel

Existing endpoint from Phase 8. Returns updated `Order`. No changes.

## State Transitions

### Order List Page Flow

```
[Page mount] --> [Fetch /api/orders?page=1&limit=20]
[Status tab click] --> [Set active filter] --> [Fetch /api/orders?status=X&page=1&limit=20]
[Pagination click] --> [Set page N] --> [Fetch /api/orders?page=N&limit=20]
[Page change or filter change] --> [Reset to page 1]
[Empty result] --> [Show empty state with "Start Shopping" CTA]
[Load error] --> [Show error state with retry button]
```

### Order Detail Page Flow

```
[Page mount] --> [Fetch /api/orders/:id]
[Tab hidden] --> [Mark stale timer]
[Tab visible] --> [If >30s stale, re-fetch] --> [If status changed, toast notification]
[Cancel click] --> [Show AlertDialog confirmation]
[Confirm cancel] --> [POST /api/orders/id/cancel] --> [Update UI optimistically] --> [Re-fetch to confirm]
[Cancel error] --> [Show error toast]
[Proof submitted] --> [Re-fetch order] --> [Update payment_status in UI]
```

### Status Badge Visual Mapping

| Status | Visual Color |
|--------|-------------|
| `pending` | Yellow |
| `confirmed` | Blue |
| `processing` | Indigo |
| `shipped` | Cyan |
| `delivered` | Green |
| `cancelled` | Red |
| `refunded` | Orange |
