<!-- SPECKIT START -->

## Current Plan

**Feature**: Storefront Homepage
**Branch**: `003-storefront-homepage`
**Plan file**: `specs/003-storefront-homepage/plan.md`
**Spec file**: `specs/003-storefront-homepage/spec.md`

### Key Artifacts

- [spec.md](specs/003-storefront-homepage/spec.md) — Feature specification
- [plan.md](specs/003-storefront-homepage/plan.md) — Implementation plan
- [research.md](specs/003-storefront-homepage/research.md) — Research decisions
- [data-model.md](specs/003-storefront-homepage/data-model.md) — Data model
- [quickstart.md](specs/003-storefront-homepage/quickstart.md) — Setup guide
- [contracts/homepage-api.md](specs/003-storefront-homepage/contracts/homepage-api.md) — API contracts

### Implementation Order

1. Add shadcn skeleton: `npx shadcn@latest add skeleton`
2. Create `src/lib/types/banner.ts` — Banner TypeScript interface
3. Create `src/lib/types/product.ts` — Product list TypeScript interface
4. Create `src/lib/types/category.ts` — Category tree TypeScript interface
5. Create `src/lib/api/banners.ts` — Banner API wrapper functions
6. Create `src/lib/api/products.ts` — Product API wrapper functions
7. Create `src/lib/api/categories.ts` — Category API wrapper functions
8. Create `src/components/store/SectionHeader.tsx` — Section title with optional "View All" link
9. Create `src/components/store/HeroBanner.tsx` — Embla carousel for hero banners
10. Create `src/components/store/ProductCard.tsx` — Reusable product card with rating stars, discount display, wishlist toggle
11. Create `src/components/store/CategoryCard.tsx` — Category grid card with image and name
12. Create `src/app/(store)/page.tsx` — Homepage server component composing all sections
13. Verify: build passes with `npm run build`

<!-- SPECKIT END -->
