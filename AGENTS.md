<!-- SPECKIT START -->

## Current Plan

**Feature**: Product Detail Page
**Branch**: `005-product-detail-page`
**Plan file**: `specs/005-product-detail-page/plan.md`
**Spec file**: `specs/005-product-detail-page/spec.md`

### Key Artifacts

- [spec.md](specs/005-product-detail-page/spec.md) — Feature specification
- [plan.md](specs/005-product-detail-page/plan.md) — Implementation plan
- [research.md](specs/005-product-detail-page/research.md) — Research decisions
- [data-model.md](specs/005-product-detail-page/data-model.md) — Data model
- [quickstart.md](specs/005-product-detail-page/quickstart.md) — Setup guide
- [contracts/product-detail-api.md](specs/005-product-detail-page/contracts/product-detail-api.md) — API contracts

### Implementation Order

1. Create `src/lib/types/product.ts` — ProductDetail, ProductVariant, ProductImage, ProductAttribute types
2. Create `src/lib/types/review.ts` — Review, ReviewListResponse, RatingDistribution types
3. Create `src/lib/api/products.ts` — getProductBySlug(slug)
4. Create `src/lib/api/wishlist.ts` — addToWishlist, removeFromWishlist, getWishlist
5. Create `src/lib/api/coupons.ts` — validateCoupon(code, productId?)
6. Create `src/lib/api/reviews.ts` — getProductReviews(productId, page)
7. Create `src/lib/stores/wishlist.store.ts` — Zustand store with reactive wishlist check
8. Create `src/lib/stores/cart-count.store.ts` — Minimal cart count store (placeholder for Phase 7)
9. Create `src/components/store/ProductImages.tsx` — Thumbnail strip + primary image with variant swap
10. Create `src/components/store/ProductInfo.tsx` — Brand link, product name (h1), rating stars + count
11. Create `src/components/store/StockStatus.tsx` — Stock indicator with low-stock warning
12. Create `src/components/store/QuantitySelector.tsx` — Number stepper with stock cap
13. Create `src/components/store/VariantSelector.tsx` — Grouped option buttons with disabled styles
14. Create `src/components/store/AddToCartButton.tsx` — Add to cart with "Added!" animation + toast
15. Create `src/components/store/WishlistButton.tsx` — Heart toggle using wishlist store
16. Create `src/components/store/CouponInput.tsx` — Coupon form with validation result display
17. Create `src/components/store/ProductAttributes.tsx` — Details + Specs tables
18. Create `src/components/store/ReviewList.tsx` — Rating distribution + review cards
19. Create `src/app/(store)/product/[slug]/page.tsx` — Server Component composing all sections
20. Verify: build passes with `npm run build`

<!-- SPECKIT END -->
