# Research: Product Listing & Search

> Decisions and tradeoffs documented during Phase 0 of implementation planning.

## Decision Record

### 1. Search URL Parameter

| Field | Value |
|-------|-------|
| **Decision** | Use `?search=` in the page URL to match the backend API parameter |
| **Rationale** | The Postman collection documents `GET /api/products?search=` as the backend parameter. Using `?search=` in the frontend URL avoids an internal parameter mapping layer and keeps the URL consistent with the API contract. |
| **Alternatives Considered** | `?q=` (shorter URL but requires mapping `q` → `search` internally; adds complexity with no clear benefit) |

### 2. Category Slug Resolution

| Field | Value |
|-------|-------|
| **Decision** | Fetch the full category tree server-side, resolve slug to category ID in memory |
| **Rationale** | No slug-based API endpoint exists in the Postman collection. The category tree API (`GET /api/categories/tree`) returns all active categories. Category pages are server components, so fetching the tree once and resolving in memory has minimal overhead for typical category counts. |
| **Alternatives Considered** | URL pattern `/category/:id` (exposes internal IDs, worse UX); backend slug lookup endpoint (would require backend change) |

### 3. Brand Filter Multiplicity

| Field | Value |
|-------|-------|
| **Decision** | Multi-select checkboxes; pass selected brands as comma-separated IDs in `brand_id` param |
| **Rationale** | Multi-select is the UX expected for brand filtering on e-commerce sites. Comma-separated values in a single query param is the simplest approach that works with most backend frameworks without requiring array-style params. |
| **Alternatives Considered** | Single-select (worse UX); array-style `?brand_id[]=1&brand_id[]=2` (depends on backend parsing framework) |

### 4. Stock & Rating Filter Availability

| Field | Value |
|-------|-------|
| **Decision** | Build the filters into the UI; if the backend returns an error for unsupported params, gracefully hide those filters and notify via toast |
| **Rationale** | The Postman collection does not document `in_stock` or `min_rating` params, but these are standard e-commerce filter parameters. Building them with graceful degradation allows forward-compatibility if the backend adds support later, without blocking the current release. |
| **Alternatives Considered** | Remove from scope (loses valuable UX); block the feature on backend confirmation (delays delivery) |

### 5. API Client Strategy

| Field | Value |
|-------|-------|
| **Decision** | Use existing `Request.ts` class-based API client for all product/category/brand API calls |
| **Rationale** | The constitution specifies `Request.ts` as the primary API client. It already handles auth tokens, error interception, and refresh queues. Creating separate wrappers in `lib/api/products.ts`, `lib/api/categories.ts`, and `lib/api/brands.ts` follows the established pattern. |
| **Alternatives Considered** | Inline `fetch()` calls (violates project convention) |

### 6. State Management for Filters

| Field | Value |
|-------|-------|
| **Decision** | URL query params only — no Zustand store for filter state |
| **Rationale** | FR-006 explicitly mandates URL-only state. This enables shareable/bookmarkable URLs, works with SSR, and avoids sync issues between URL and client state. |
| **Alternatives Considered** | Zustand store synced with URL (extra complexity, violates spec constraint) |

## Technical Patterns

### ProductCard Reuse

The `ProductCard` component from Phase 3 (homepage) can be reused directly in the product grid. Requires verified props: product image, name, brand, rating, price (with discount display), and wishlist toggle. No changes needed unless the homepage implementation differs in props structure.

### Mobile Filter Sheet

Mobile filters open in a slide-over sheet. The project has `@radix-ui/react-dialog` available (via shadcn). The shadcn `Sheet` component uses this primitive and is the appropriate choice. Desktop uses a persistent sidebar.

### URL-Driven Filter Pattern

```text
URL: /category/electronics?brand_id=1,2&min_price=100&max_price=500&sort=price_asc&page=2
       \_________/ \_______________________________________________/\_______/
        route path              filter query params              pagination
```

- `useSearchParams()` reads current params
- `useRouter().push()` or `replace()` updates them
- Changing any filter resets `page` to 1
- Invalid/empty params are silently ignored
