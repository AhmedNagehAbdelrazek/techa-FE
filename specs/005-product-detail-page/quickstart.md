# Quickstart: Product Detail Page

## Prerequisites

- Branch: `005-product-detail-page` is checked out
- Backend API running at `NEXT_PUBLIC_API_URL` (or `NEXT_PUBLIC_BACKEND_URL`)
- Test product data seeded in the database (products with variants, images, reviews)

## What to Build

1. **Types** — `src/lib/types/product.ts`, `src/lib/types/review.ts`
2. **API wrappers** — `src/lib/api/products.ts` (getProductBySlug), `src/lib/api/reviews.ts`, `src/lib/api/wishlist.ts`, `src/lib/api/coupons.ts`
3. **Stores** — `src/lib/stores/wishlist.store.ts`, `src/lib/stores/cart-count.store.ts`
4. **Components** (in `src/components/store/`):
   - `ProductImages` — thumbnail strip + primary image, variant swap
   - `ProductInfo` — brand, name, rating, price
   - `VariantSelector` — grouped option buttons
   - `StockStatus` — stock indicator
   - `QuantitySelector` — stepper
   - `AddToCartButton` — add with animation + toast
   - `WishlistButton` — heart toggle
   - `CouponInput` — coupon form
   - `ProductAttributes` — details + specs tables
   - `ReviewList` — rating distribution + review cards
5. **Page** — `src/app/(store)/product/[slug]/page.tsx` (Server Component)

## Key Decisions

| Decision | Choice |
|----------|--------|
| Image gallery | Custom component, `useState` for active index |
| Variant selection | Local `useState`, match by option intersection |
| Wishlist state | Zustand store (lightweight, expandable in Phase 10) |
| Cart count | Minimal Zustand store (placeholder for Phase 7) |
| Review loading | Embedded from product response + separate paginated fetch |
| Coupon re-validation | On variant change, clear if re-validation fails |
| Open Graph | `generateMetadata()` from Next.js App Router |
| Accessibility | WCAG 2.1 AA — `aria-live` for dynamic changes, focus management |

## Testing

- **Unit**: Vitest — test variant matching logic, price calculation, stock display conditions
- **Integration**: Testing Library — test variant selector updates price/stock, add to cart triggers toast
- **E2E**: Playwright — test full product page flow: navigate → select variant → add to cart → verify toast

## Commands

```bash
# Start dev server
pnpm dev

# Run unit/integration tests
pnpm test

# Run E2E tests
pnpm test:e2e

# Lint check
pnpm lint

# Type check
pnpm typecheck

# Build
pnpm build
```
