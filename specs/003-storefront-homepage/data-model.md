# Data Model: Storefront Homepage

## Entities

### Banner

A promotional image displayed in the hero carousel or mid-page section.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | Yes | Unique identifier |
| `title` | string | Yes | Banner title text |
| `description` | string | No | Banner description/subtitle |
| `image_url` | string (URL) | Yes | Banner image URL |
| `link_url` | string (URL) | No | Click-through destination |
| `position` | enum | Yes | `hero` or `mid_page` |
| `sort_order` | number | Yes | Display ordering |
| `starts_at` | datetime | No | Schedule start |
| `ends_at` | datetime | No | Schedule end |
| `is_active` | boolean | Yes | Whether banner is currently active |

**Constraints**: Only `is_active=true` banners within their schedule range (if dates set) are returned by the public API.

---

### Product (list view)

A purchasable item as returned by the public listing endpoint.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | Yes | Unique identifier |
| `name` | string | Yes | Product name |
| `slug` | string | Yes | URL slug for `/product/:slug` |
| `base_price` | number | Yes | Base price in default currency |
| `discount_percent` | number | Yes | Discount percentage (0 if none) |
| `primary_image` | object | No | `{ url: string, alt_text: string }` |
| `brand` | object | No | `{ id: uuid, name: string, slug: string }` |
| `rating` | object | Yes | `{ average: number, count: number }` |
| `is_featured` | boolean | Yes | Featured flag |
| `created_at` | datetime | Yes | Creation timestamp |

**Derived**: `discounted_price = base_price * (1 - discount_percent / 100)`

---

### Category (tree node)

A product grouping in a hierarchical tree.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | Yes | Unique identifier |
| `name` | string | Yes | Display name |
| `slug` | string | Yes | URL slug for `/category/:slug` |
| `image_url` | string (URL) | No | Category image |
| `parent_id` | UUID | No | Parent category ID (null = top-level) |
| `sort_order` | number | Yes | Display ordering |
| `is_active` | boolean | Yes | Whether category is active |
| `children` | array | Yes | Nested subcategories |

**Constraints**: Homepage displays only top-level categories (nodes at root of tree array, or where parent_id is null). Only active categories are returned.
