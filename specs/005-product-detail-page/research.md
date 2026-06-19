# Research: Product Detail Page

> Decisions and tradeoffs documented during Phase 0 of implementation planning.

## Decision Record

### 1. Review Data Strategy

| Field | Value |
|-------|-------|
| **Decision** | Show initial reviews from the product response (embedded `reviews[]` array), then paginate via the separate reviews endpoint for "Load More" |
| **Rationale** | The `GET /api/products/:slug` endpoint returns embedded reviews, so displaying the first batch requires zero additional API calls. For paginated browsing, use the dedicated `GET /api/products/:id/reviews` endpoint which supports `page` and `limit` params. This gives instant initial render with progressive loading for longer review lists. |
| **Alternatives Considered** | Separate fetch only (slower initial render, but cleaner separation); embed-only (no pagination support for products with many reviews) |

### 2. Wishlist State Management

| Field | Value |
|-------|-------|
| **Decision** | Create a lightweight Zustand `wishlistStore` now (Phase 5) since the product page needs reactive wishlist toggle across components; Phase 10 will expand it with the full wishlist page |
| **Rationale** | The wishlist toggle on the product page needs to: (a) check if the current product is wishlisted, (b) optimistically toggle the heart icon, and (c) update the header badge count. This requires cross-component state, making Zustand the right choice per project conventions. Building it now avoids rework when Phase 10 adds the `/wishlist` page. |
| **Alternatives Considered** | Local `useState` (wishlist state would be lost on navigation, no header badge sync); defer to Phase 10 (product page would lack wishlist toggle entirely) |

### 3. Image Gallery Implementation

| Field | Value |
|-------|-------|
| **Decision** | Custom component using `useState` for active image index; no carousel library needed |
| **Rationale** | The spec calls for a thumbnail strip with click-to-swap primary image — not a carousel/slideshow. Embla Carousel (already installed) would add unnecessary complexity for a simple thumbnail gallery. Variant-specific images swap by filtering the images array when a variant is selected. |
| **Alternatives Considered** | Embla Carousel (overkill for static thumbnail grid); third-party gallery library (violates YAGNI) |

### 4. Variant Option Rendering

| Field | Value |
|-------|-------|
| **Decision** | Map known color values (`option_name` = "color"/"colour"/"اللون") to background color swatches (circular buttons); render all other option types as pill-shaped text buttons |
| **Rationale** | The API returns options as `{ option_name, option_value }` pairs. Color-type options benefit from visual swatch rendering (common e-commerce UX pattern). Non-color options (size, material, etc.) are best as text pills. Swatch colors derived from a predefined color map covering standard names (black, white, red, blue, etc.) with a fallback gradient for unrecognized values. |
| **Alternatives Considered** | Text pills for all options (loses visual color context for color variants); hex-color backend field (not in current API contract, would require backend change) |

### 5. Coupon Validation Flow

| Field | Value |
|-------|-------|
| **Decision** | Validate on "Apply" click via `POST /api/coupons/validate`; re-validate when variant changes; clear on variant change if re-validation fails |
| **Rationale** | The spec requires showing discount amount and expiry. The API accepts `product_id` — since variants share a product ID but may have different prices, re-validation on variant change ensures the discount amount is accurate. If re-validation fails (coupon not applicable to selected variant), clear the coupon and notify the user. |
| **Alternatives Considered** | Keep coupon across variant changes without re-validation (discount amount may be wrong for new variant price); auto-validate on variant change without user action (confusing if discount disappears) |

### 6. Add to Cart API Integration

| Field | Value |
|-------|-------|
| **Decision** | Call `POST /api/cart` with `product_id`, `variant_id` (nullable), `quantity`; display toast + button animation on success |
| **Rationale** | The Postman collection documents the cart add endpoint with product_id, variant_id, and quantity. The existing cart store/cart API from Phase 7 may not exist yet, so this phase creates a direct API call in the product detail page flow. The cart count badge in the header will be updated by dispatching an event or using a lightweight cart count store. |
| **Alternatives Considered** | Wait for Phase 7 cart infrastructure (would block Phase 5 from shipping independently); create full cart store now (scope creep — Phase 7 handles full cart) |

### 7. Open Graph Metadata

| Field | Value |
|-------|-------|
| **Decision** | Use Next.js `generateMetadata()` function exported from the page Server Component |
| **Rationale** | Next.js App Router provides first-class metadata API: `generateMetadata({ params })` fetches the product by slug and returns `{ title, description, openGraph: { title, description, images } }`. This is the standard, documented pattern that requires zero additional dependencies. |
| **Alternatives Considered** | Manual `<head>` manipulation (fragile, not idiomatic Next.js); custom metadata utility (unnecessary — Next.js handles it) |

## Technical Patterns

### Server Component + Client Component Boundaries

The product page follows a hybrid pattern:
- **Server Component** (page.tsx): Fetches product data, generates OG metadata, renders skeleton layout
- **Client Components**: ProductImages (image click handling), VariantSelector (selection state), QuantitySelector (stepper), AddToCartButton (API call), WishlistButton (store access), CouponInput (form state), ReviewList (pagination)

Each client component is a `"use client"` boundary at the file level. No prop drilling of variant state — `useState` lives in a lightweight wrapper component that composes VariantSelector, ProductImages, PriceDisplay, StockStatus, and AddToCartButton.

### Variant Selection Flow

```text
User clicks variant option
  → useState updates selectedOptions (e.g., { color: "black", size: "xl" })
  → Find matching variant by option intersection
  → If match found: update displayed price, stock, images (from variant.images)
  → If no match: keep previous selection, no change
  → If no variant selected and variants exist: disable "Add to Cart" with "Please select options"
```

### Cart Count Badge Sync

Since the full cart store (Phase 7) does not exist yet, create a minimal `cartCountStore` (Zustand, not persisted) with `count` state and `increment(by)` action. The add-to-cart flow calls this alongside the API call. Phase 7 can replace this with the full cart store.
