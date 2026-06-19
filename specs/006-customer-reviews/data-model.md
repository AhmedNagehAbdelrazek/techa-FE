# Data Model: Customer Reviews

## Entities

### Review

Full review data returned from `GET /api/products/:productId/reviews`.

| Field | Type | Description |
|-------|------|-------------|
| `id` | string (uuid) | Unique identifier |
| `product_id` | string (uuid) | The product this review belongs to |
| `rating` | number (1–5) | Star rating |
| `comment` | string | Review comment body |
| `reviewer_name` | string | Display name of reviewer |
| `relative_date` | string | Human-readable date (e.g., "2 weeks ago") |
| `is_verified` | boolean | Whether purchase is verified |
| `user` | UserBrief | Reviewer user info |
| `is_active` | boolean | Whether review is visible (soft-delete flag) |
| `created_at` | string (ISO 8601) | Creation timestamp |

**Validation rules:**
- `rating` ≥ 1 and ≤ 5
- `comment` must be non-empty when submit button is enabled
- `is_verified` true only when linked to a delivered `order_item_id`

### UserBrief

| Field | Type | Description |
|-------|------|-------------|
| `id` | string (uuid) | User identifier |
| `name` | string | User display name |
| `avatar_url` | string (url) | null | Avatar image URL |

### ReviewListResponse

Paginated response from `GET /api/products/:productId/reviews`.

| Field | Type | Description |
|-------|------|-------------|
| `data` | Review[] | Array of reviews |
| `meta` | PaginationMeta | Pagination metadata |

### PaginationMeta

| Field | Type | Description |
|-------|------|-------------|
| `page` | number | Current page (1-indexed) |
| `limit` | number | Items per page |
| `total` | number | Total number of items |
| `totalPages` | number | Total number of pages |

### ReviewEligibilityResponse

Response from `GET /api/products/:productId/reviews/eligibility`.

| Field | Type | Description |
|-------|------|-------------|
| `can_review` | boolean | Whether the current user can write a review |
| `reason` | string | null | Explanation when `can_review` is false |

### CreateReviewRequest

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `rating` | number (1–5) | Yes | Star rating |
| `comment` | string | Yes | Review comment |
| `order_item_id` | string (uuid) | No | Links review to delivered order item (sets is_verified) |

### UpdateReviewRequest

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `rating` | number (1–5) | No | Updated star rating |
| `comment` | string | No | Updated comment |

## State Transitions

### Review Lifecycle

```
Create (POST /api/products/:id/reviews)
  → Review created with is_active = true, is_verified based on order_item_id
  → Appears in review list immediately (optimistic UI)

Update (PUT /api/reviews/:id)
  → Rating and/or comment updated
  → Card updates in place (optimistic UI)

Delete (DELETE /api/reviews/:id)
  → Soft-delete: is_active set to false
  → Card removed from list (optimistic UI)
  → No hard deletion; data remains in database
```

### Review Eligibility

```
Page load (authenticated)
  → GET /api/products/:id/reviews/eligibility
  → can_review = true  → Show "Write a Review" form
  → can_review = false → Show reason text, hide form

After successful review creation
  → Hide form (user already reviewed)
  → Could re-check eligibility, but known to be false
```

### Optimistic Rollback Flow

```
User action (create/edit/delete)
  → 1. Apply change to local state immediately
  → 2. Fire API call
     → Success: keep local state
     → Failure: revert local state, show error toast
```
