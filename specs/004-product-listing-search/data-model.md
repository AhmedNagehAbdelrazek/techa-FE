# Data Model: Product Listing & Search

## Entities

### Product (from API)

Represents a single product returned in list/search results.

| Field | Type | Description |
|-------|------|-------------|
| `id` | string (uuid) | Unique identifier |
| `name` | string | Product name |
| `slug` | string | URL-safe identifier for `/product/:slug` |
| `primary_image` | string (url) | Primary product image URL |
| `brand_name` | string | Brand display name |
| `brand_id` | string (uuid) | Brand identifier for filtering |
| `average_rating` | number | Average rating (0–5) |
| `rating_count` | number | Total number of ratings |
| `base_price` | number | Original price before discount |
| `discount_percent` | number | Discount percentage (0–100); 0 = no discount |
| `final_price` | number | Price after discount (computed by backend) |
| `stock_qty` | number | Available stock quantity |
| `category_id` | string (uuid) | Category this product belongs to |
| `category_name` | string | Category display name |

**Validation rules:**
- `final_price` ≤ `base_price`
- `discount_percent` ≥ 0 and ≤ 100
- `average_rating` 0–5
- `stock_qty` ≥ 0

### ProductListResponse

Paginated response from `GET /api/products`.

| Field | Type | Description |
|-------|------|-------------|
| `data` | Product[] | Array of products |
| `meta` | PaginationMeta | Pagination metadata |

### PaginationMeta

| Field | Type | Description |
|-------|------|-------------|
| `total` | number | Total number of matching products |
| `page` | number | Current page number (1-indexed) |
| `limit` | number | Items per page |
| `total_pages` | number | Total number of pages |

### Category

A product category in the hierarchy.

| Field | Type | Description |
|-------|------|-------------|
| `id` | string (uuid) | Unique identifier |
| `name` | string | Category display name |
| `slug` | string | URL-safe identifier for `/category/:slug` |
| `parent_id` | string (uuid) | null | Parent category ID (null = top-level) |
| `image_url` | string (url) | null | Category image URL |
| `sort_order` | number | Display ordering |
| `children` | Category[] | Child categories (from tree API) |

**Relationships:**
- Category has a self-referential parent relationship via `parent_id`
- A Product belongs to exactly one Category via `category_id`
- Category tree is fetched from `GET /api/categories/tree`

### Brand

| Field | Type | Description |
|-------|------|-------------|
| `id` | string (uuid) | Unique identifier |
| `name` | string | Brand display name |
| `slug` | string | URL-safe identifier |
| `logo_url` | string (url) | null | Brand logo URL |

**Relationships:**
- A Product belongs to exactly one Brand via `brand_id`

### FilterState

Represents the current filter state as reflected in URL query params. Not persisted in Zustand — only lives in the URL.

| Field | URL Param | Type | Description |
|-------|-----------|------|-------------|
| `search` | `search` | string | Search query (search page only) |
| `category_id` | `category_id` | string | Category filter (search page only) |
| `brand_ids` | `brand_id` | string (comma-separated) | Selected brand IDs |
| `min_price` | `min_price` | number | Minimum price filter |
| `max_price` | `max_price` | number | Maximum price filter |
| `min_rating` | `min_rating` | number | Minimum rating filter (1–5) |
| `in_stock` | `in_stock` | boolean | Show only in-stock products |
| `sort` | `sort` | enum | Sort order: `newest`, `price_asc`, `price_desc`, `top_rated` |
| `page` | `page` | number | Current page (1-indexed, default 1) |

**Validation rules:**
- `page` ≥ 1
- `min_price` ≥ 0 and `max_price` ≥ 0
- `max_price` must be ≥ `min_price` if both set
- `min_rating` must be 1–5
- `sort` must be one of the enum values
- Invalid params are silently ignored (treated as unset)

## State Transitions

### Filter Change → Product List Update

```
User applies filter → URL param updates → page resets to 1 → React Query refetch → ProductGrid re-renders
```

### Pagination

```
User clicks page N → URL param updates → React Query refetch with new page → ProductGrid re-renders
```
