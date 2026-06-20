# Research: Customer Wishlist

## Resolved Unknowns

### 1. Wishlist API Response Shape — Does backend return product data?

**Decision**: Assume backend returns enriched wishlist items with nested product data.

**Rationale**: Spec FR-002 says wishlist page renders ProductCard (name, price, image). If API only returns `{id, product_id, variant_id}`, the page would need N+1 product lookups. Spec Assumptions explicitly state: "The wishlist API returns product data (name, price, image) nested within each wishlist item response so the page can render without additional API calls."

**Implementation**: Create an enriched `WishlistItemWithProduct` type. The API wrapper's `getWishlist()` already handles both array and `{data: []}` shapes — extend to also return enriched items.

**Fallback**: If backend doesn't return enriched data, batch-fetch products via `getProducts({ids: [...]})`.

### 2. WishlistItem Type — Where to define enriched types?

**Decision**: Create `src/lib/types/wishlist.ts` with shared types. Keep the base `WishlistItem` in the API wrapper (it's only used there). Create a separate `WishlistItemWithProduct` type in the types file.

**Rationale**: Follows existing pattern — `cart.ts` types are in `src/lib/types/cart.ts`, not in the API wrapper. The API wrapper imports types from there.

### 3. Optimistic Removal on Wishlist Page

**Decision**: Use local state (not store) for optimistic removal, mirroring the orders page pattern.

**Rationale**: AGENTS.md says "no Zustand stores — local state only" for components that directly consume API wrappers. The wishlist page fetches all items on mount, tracks them in local state, and removes optimistically on user action.

### 4. Add to Cart from Wishlist

**Decision**: Create an inline "Add to Cart" button on each wishlist card that calls `addItem` from the cart API wrapper directly. No need for `CartAddButton` — the wishlist context is simpler (always qty=1, no variant selection).

**Rationale**: The spec says "Add to Cart" on wishlist items should add the product (or selected variant) to cart. Wishlist items may have a `variant_id` — use it directly.

### 5. Header Badge Count Synchronization

**Decision**: The existing `useWishlistStore.fetchWishlist()` is already called by `StoreInitializer` (on mount) and `WishlistButton` (after toggle). The wishlist page will also call `fetchWishlist()` after removal/add-to-cart to keep the badge in sync.

**Rationale**: Store already handles count persistence and reactive updates via the Zustand subscription in `Header.tsx`.

### 6. ProductCard Reuse on Wishlist Page

**Decision**: Reuse `ProductCard` directly for wishlist items. The card already includes `WishlistButton` — but on the wishlist page, items need an **explicit "Remove from Wishlist" button** (per spec) and an **"Add to Cart" button**. The `ProductCard`'s built-in `WishlistButton` is redundant here (we're already on the wishlist page).

**Implementation**: Create a `WishlistCard` component that renders product info in ProductCard-like layout but with Remove + Add to Cart buttons instead of the default `WishlistButton`.

### 7. Edge Case: Product No Longer Active / Out of Stock

**Decision**: The product data will include stock status. If out of stock, disable "Add to Cart" and show an "Out of Stock" label. The card still renders so the customer can remove it.

**Rationale**: Spec edge cases explicitly require this behavior.

## Technology Choices

| Choice | Decision | Rationale |
|--------|----------|-----------|
| State management for page | Local `useState` + `useCallback` | Follows orders page pattern. No new store needed. |
| API wrapper calls | Direct async in page component | Wrapped in error handling with toast on failure. |
| Optimistic removal | Remove from local array immediately, revert on error | Matches cart store pattern for optimistic updates. |
| Empty state | Reuse existing `EmptyState` from `@/components/ui/EmptyState` | Already has title + description + action props. |
| Auth guard | Reuse existing `ProtectedRoute` | Already handles redirect with `next` param. |
| Loading state | Custom skeleton matching ProductCard layout | More specific than generic `LoadingState` skeleton. |
| Error state | Reuse existing `ErrorState` from `@/components/ui/ErrorState` | Already has retry callback. |

## Alternatives Considered

| Alternative | Rejected Because |
|-------------|-----------------|
| Enrich wishlist store with full items | Violates AGENTS.md pattern (stores for API data are for cart only; wishlist page should use local state). Store tracks only `itemCount`. |
| Use React Query for wishlist page | Not a pattern in existing pages. Orders page uses local state + manual fetch. |
| Modify ProductCard to accept `showWishlistButton` prop | Would couple ProductCard to wishlist context. WishlistCard is cleaner. |
| Single `WishlistItem` type in API wrapper | Types file pattern is established (`cart.ts`, `product.ts`, `order.ts`). Wishlist types should follow. |
