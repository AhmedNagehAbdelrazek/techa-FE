<!-- SPECKIT START -->

## Current Plan

**Feature**: Product Listing & Search
**Branch**: `004-product-listing-search`
**Plan file**: `specs/004-product-listing-search/plan.md`
**Spec file**: `specs/004-product-listing-search/spec.md`

### Key Artifacts

- [spec.md](specs/004-product-listing-search/spec.md) — Feature specification
- [plan.md](specs/004-product-listing-search/plan.md) — Implementation plan
- [research.md](specs/004-product-listing-search/research.md) — Research decisions
- [data-model.md](specs/004-product-listing-search/data-model.md) — Data model
- [quickstart.md](specs/004-product-listing-search/quickstart.md) — Setup guide
- [contracts/product-listing-api.md](specs/004-product-listing-search/contracts/product-listing-api.md) — API contracts

### Implementation Order

1. Create `src/lib/types/product.ts` — Product list/search response types
2. Create `src/lib/types/category.ts` — Category tree TypeScript interface
3. Create `src/lib/types/brand.ts` — Brand TypeScript interface
4. Create `src/lib/api/products.ts` — Product API wrapper (listProducts with filter params)
5. Create `src/lib/api/categories.ts` — Category tree API wrapper
6. Create `src/lib/api/brands.ts` — Brand list API wrapper
7. Create `src/components/store/Pagination.tsx` — Numbered page controls
8. Create `src/components/store/SortDropdown.tsx` — Sort order selector
9. Create `src/components/store/BrandFilter.tsx` — Multi-select brand checkboxes
10. Create `src/components/store/PriceRangeFilter.tsx` — Min/max price inputs
11. Create `src/components/store/RatingFilter.tsx` — Star rating selector
12. Create `src/components/store/FilterChips.tsx` — Active filter chips with remove buttons
13. Create `src/components/store/FilterSidebar.tsx` — Desktop filter sidebar
14. Create `src/components/store/FilterSheet.tsx` — Mobile filter slide-over sheet
15. Create `src/components/store/ProductGrid.tsx` — Shared grid with filters, sort, pagination
16. Create `src/app/(store)/category/[slug]/page.tsx` — Category listing page (server component)
17. Create `src/app/(store)/search/page.tsx` — Search results page (server component)
18. Verify: build passes with `npm run build`

<!-- SPECKIT END -->
