# Data Model: Product Detail Page

## Entities

### ProductDetail

Full product data returned from `GET /api/products/:slug`.

| Field | Type | Description |
|-------|------|-------------|
| `id` | string (uuid) | Unique identifier |
| `name` | string | Product name |
| `slug` | string | URL-safe identifier |
| `description` | string | Product description HTML/markdown |
| `about_points` | string[] | Bullet-point list of key features |
| `base_price` | number | Original price before discount |
| `discount_percent` | number | Discount percentage (0–100); 0 = no discount |
| `rating_avg` | number | Average rating (0–5) |
| `rating_count` | number | Total number of ratings |
| `is_featured` | boolean | Whether product is featured on homepage |
| `category` | CategoryBrief | Product category |
| `brand` | BrandBrief | Product brand |
| `attributes` | ProductAttributes | Grouped attributes (details + specs) |
| `images` | ProductImage[] | All product images |
| `variants` | ProductVariant[] | Available variants |
| `reviews` | Review[] | Initial batch of reviews (embedded) |
| `tags` | Tag[] | Product tags |

**Validation rules:**
- `base_price` > 0
- `discount_percent` ≥ 0 and ≤ 100
- `rating_avg` 0–5
- `rating_count` ≥ 0

### CategoryBrief

| Field | Type | Description |
|-------|------|-------------|
| `id` | string (uuid) | Unique identifier |
| `name` | string | Category display name |
| `slug` | string | URL-safe identifier |

### BrandBrief

| Field | Type | Description |
|-------|------|-------------|
| `id` | string (uuid) | Unique identifier |
| `name` | string | Brand display name |
| `slug` | string | URL-safe identifier |
| `logo_url` | string (url) | null | Brand logo URL |

### ProductImage

| Field | Type | Description |
|-------|------|-------------|
| `id` | string (uuid) | Unique identifier |
| `url` | string (url) | Image URL |
| `alt_text` | string | null | Alternative text for accessibility |
| `is_primary` | boolean | Whether this is the primary/cover image |
| `sort_order` | number | Display ordering (ascending) |

### ProductVariant

| Field | Type | Description |
|-------|------|-------------|
| `id` | string (uuid) | Unique identifier |
| `sku` | string | Stock keeping unit code |
| `price` | number | Variant-specific price (overrides base_price) |
| `discount_percent` | number | Variant-specific discount (overrides base) |
| `stock_qty` | number | Available stock for this variant |
| `is_active` | boolean | Whether variant is active/sellable |
| `options` | VariantOption[] | Key-value option pairs defining this variant |
| `images` | ProductImage[] | Variant-specific images (overrides product images when selected) |

**Validation rules:**
- `price` > 0 if set
- `stock_qty` ≥ 0
- At least one `option` required if variants exist

### VariantOption

| Field | Type | Description |
|-------|------|-------------|
| `option_name` | string | Option type label (e.g., "Color", "Size", "اللون", "المقاس") |
| `option_value` | string | Option value (e.g., "Black", "XL", "أسود") |

### ProductAttributes

| Field | Type | Description |
|-------|------|-------------|
| `details` | AttributePair[] | Key-value pairs for "Product Details" section |
| `specs` | AttributePair[] | Key-value pairs for "Product Information" section |

### AttributePair

| Field | Type | Description |
|-------|------|-------------|
| `label` | string | Attribute name (e.g., "Material", "Weight") |
| `value` | string | Attribute value (e.g., "Aluminum", "200g") |

### Review

| Field | Type | Description |
|-------|------|-------------|
| `id` | string (uuid) | Unique identifier |
| `rating` | number | Rating (1–5) |
| `comment` | string | Review comment text |
| `reviewer_name` | string | Display name of reviewer |
| `relative_date` | string | Human-readable date (e.g., "2 weeks ago") |
| `is_verified` | boolean | Whether purchase is verified |

### ReviewListResponse

Paginated response from `GET /api/products/:id/reviews`.

| Field | Type | Description |
|-------|------|-------------|
| `data` | Review[] | Array of reviews |
| `meta` | PaginationMeta | Pagination metadata |

### PaginationMeta

| Field | Type | Description |
|-------|------|-------------|
| `total` | number | Total number of items |
| `page` | number | Current page (1-indexed) |
| `limit` | number | Items per page |
| `totalPages` | number | Total number of pages |

### Tag

| Field | Type | Description |
|-------|------|-------------|
| `id` | string (uuid) | Unique identifier |
| `name` | string | Tag display name |
| `slug` | string | URL-safe identifier |

### CouponValidationRequest

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `code` | string | Yes | Coupon code |
| `product_id` | string (uuid) | Yes | Product to validate against |

### CouponValidationResponse

| Field | Type | Description |
|-------|------|-------------|
| `valid` | boolean | Whether coupon is valid |
| `discount_amount` | number | Computed discount amount |
| `discount_type` | "percentage" | "fixed" | Type of discount |
| `message` | string | null | Validation message or error |

### WishlistItem

| Field | Type | Description |
|-------|------|-------------|
| `id` | string (uuid) | Wishlist entry ID |
| `product_id` | string (uuid) | Product ID |
| `variant_id` | string (uuid) | null | Variant ID (if specific variant) |

### WishlistStore

Client-side Zustand store for wishlist state.

| Field | Type | Description |
|-------|------|-------------|
| `items` | WishlistItem[] | List of wishlisted items |
| `count` | number | Total wishlist count |
| `isLoading` | boolean | Loading state |

**Actions:** `fetchWishlist()`, `addItem(productId)`, `removeItem(productId)`, `isInWishlist(productId): boolean`

## State Transitions

### Variant Selection

```
No variant selected (variants exist)
  → "Add to Cart" disabled, shows "Please select options"
  
User clicks option A (e.g., Color: Black)
  → Find matching variant: { options: [{color: "Black"}, {size: null}] }
  → If exact match found:
      → Update price to variant.price
      → Update stock to variant.stock_qty
      → Update images to variant.images (or product images if variant has none)
      → Enable "Add to Cart"
  → If no match: wait for more options to be selected
```

### Add to Cart Flow

```
User clicks "Add to Cart"
  → Call POST /api/cart { product_id, variant_id?, quantity }
  → On success:
      → Increment cart count store
      → Show "Added!" button animation (2s, then revert)
      → Show toast: "Added to cart"
  → On 400 (out of stock):
      → Show toast: "Sorry, this item just went out of stock"
      → Update stock status to "Out of Stock"
      → Disable "Add to Cart" button
  → On other error:
      → Show toast with error message
```
