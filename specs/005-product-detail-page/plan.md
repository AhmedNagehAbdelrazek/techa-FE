# Implementation Plan: Product Detail Page

**Branch**: `005-product-detail-page` | **Date**: 2026-06-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/005-product-detail-page/spec.md`

## Summary

Full product detail page at `/product/:slug` with an Amazon-style layout: image gallery (primary + thumbnails), product info (brand, name, rating, price with discount), variant selectors (color swatches, size pills with real-time price/stock/image updates), stock status indicator, quantity selector, add to cart with wishlist toggle and coupon validation, plus below-fold sections for product description, attributes tables, and customer reviews with rating distribution.

## Technical Context

**Language/Version**: TypeScript 5 (`strict: true`), React 19, Next.js 15 (App Router)

**Primary Dependencies**: Next.js (App Router, `generateMetadata` for OG tags), TanStack React Query 5 (server state), Zustand (wishlist store), shadcn/ui (Button, Badge, Input, Skeleton), lucide-react (icons), sonner (toasts), react-hook-form + zod (coupon input)

**Storage**: N/A (all data fetched live from backend API)

**Testing**: Vitest + @testing-library/react (unit/integration), @playwright/test (E2E)

**Target Platform**: Modern browsers (desktop + mobile 375px+), Arabic-first RTL

**Project Type**: Web application (Next.js frontend, App Router)

**Performance Goals**: Product page renders within 2s on standard connection; variant selection updates price/stock/images instantly without page reload

**Constraints**: WCAG 2.1 Level AA compliance; RTL-first (Arabic); mobile-first responsive (375px); all API calls via existing `Request.ts` client; no image zoom/lightbox (out of scope); reviews display-only (writing in Phase 6)

**Scale/Scope**: 1 page, 6 interactive sections (gallery, variants, cart, wishlist, coupon, reviews)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| Pre-flight checklist (YAGNI) | PASS | No new dependencies needed; all components/tools exist (shadcn, sonner, react-hook-form, zod, Zustand, TanStack Query) |
| Existing patterns compliance | PASS | Follows established: API client (`Request.ts`), Server Component for data, `"use client"` for interactivity, named exports, `@/` alias |
| No unnecessary abstractions | PASS | Variant selection uses `useState` (local), not a store; wishlist uses lightweight Zustand store (needed for cross-component reactivity) |
| Architecture consistency | PASS | Page under `(store)` route group, components in `components/store/`, API wrappers in `lib/api/`, types in `lib/types/` |

**No violations found. Complexity Tracking section is not needed.**

## Project Structure

### Documentation (this feature)

```text
specs/005-product-detail-page/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── product-detail-api.md
├── checklists/          # Spec quality checklists
└── spec.md              # Feature specification
```

### Source Code (repository root)

```text
src/
├── app/(store)/
│   └── product/
│       └── [slug]/
│           └── page.tsx              # Server Component — fetches product, renders page shell
├── components/
│   └── store/
│       ├── ProductImages.tsx         # Image gallery: primary + thumbnails + variant image swap
│       ├── ProductInfo.tsx           # Brand, name, rating, price block
│       ├── VariantSelector.tsx       # Color swatches + size pills, group by option_name
│       ├── StockStatus.tsx           # "In Stock" / "Only X left" / "Out of Stock"
│       ├── QuantitySelector.tsx      # Stepper input 1..min(10, stock_qty)
│       ├── AddToCartButton.tsx       # "Add to Cart" with "Added!" animation
│       ├── WishlistButton.tsx        # Heart toggle icon
│       ├── CouponInput.tsx           # Code input + Apply + result/error display
│       ├── ReviewList.tsx            # Review cards + rating distribution
│       └── ProductAttributes.tsx     # Details + Specs tables
├── lib/
│   ├── api/
│   │   ├── products.ts              # getProductBySlug(slug) → GET /api/products/:slug
│   │   ├── reviews.ts               # getProductReviews(productId, page) → GET /api/products/:id/reviews
│   │   ├── wishlist.ts              # addToWishlist(), removeFromWishlist()
│   │   └── coupons.ts               # validateCoupon(code, productId) → POST /api/coupons/validate
│   ├── stores/
│   │   └── wishlist.store.ts        # Zustand store: items[], addItem, removeItem, isInWishlist
│   └── types/
│       ├── product.ts               # ProductDetail, ProductVariant, ProductImage interfaces
│       └── review.ts                # Review, ReviewListResponse interfaces
```

**Structure Decision**: Single-project web application pattern (Next.js App Router). All product-detail components live in `components/store/` following the existing convention. Server Component page under `(store)/product/[slug]/`. API wrappers in `lib/api/`, types in `lib/types/`.

## Implementation Order

1. Create `src/lib/types/product.ts` — ProductDetail, ProductVariant, ProductImage, ProductAttribute types
2. Create `src/lib/types/review.ts` — Review, ReviewListResponse, RatingDistribution types
3. Create `src/lib/api/products.ts` — getProductBySlug(slug)
4. Create `src/lib/api/wishlist.ts` — addToWishlist, removeFromWishlist, getWishlist
5. Create `src/lib/api/coupons.ts` — validateCoupon(code, productId?)
6. Create `src/lib/api/reviews.ts` — getProductReviews(productId, page)
7. Create `src/lib/stores/wishlist.store.ts` — Zustand store with reactive wishlist check
8. Create `src/components/store/ProductImages.tsx` — Thumbnail strip + primary image with variant swap
9. Create `src/components/store/ProductInfo.tsx` — Brand link, product name (h1), rating stars + count
10. Create `src/components/store/StockStatus.tsx` — Stock indicator with low-stock warning
11. Create `src/components/store/QuantitySelector.tsx` — Number stepper with stock cap
12. Create `src/components/store/VariantSelector.tsx` — Grouped option buttons with disabled styles
13. Create `src/components/store/AddToCartButton.tsx` — Add to cart with "Added!" animation + toast
14. Create `src/components/store/WishlistButton.tsx` — Heart toggle using wishlist store
15. Create `src/components/store/CouponInput.tsx` — Coupon form with validation result display
16. Create `src/components/store/ProductAttributes.tsx` — Details + Specs tables
17. Create `src/components/store/ReviewList.tsx` — Rating distribution + review cards
18. Create `src/app/(store)/product/[slug]/page.tsx` — Server Component composing all sections
19. Verify: build passes with `npm run build`

## Complexity Tracking

> Not needed — no constitution violations.
