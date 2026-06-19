# Quickstart: Product Listing & Search

## Prerequisites

- Node.js 18+ (project uses Next.js 15)
- pnpm (workspace mode)
- Backend API running at the URL configured in `NEXT_PUBLIC_BACKEND_URL`

## Files to Create

### API Layer (`src/lib/api/`)

| File | Wraps | Key Functions |
|------|-------|---------------|
| `products.ts` | `GET /api/products` | `listProducts(params)` — returns `ProductListResponse` |
| `categories.ts` | `GET /api/categories/tree` | `getCategoryTree()` — returns `Category[]` |
| `brands.ts` | `GET /api/brands` | `listBrands()` — returns `Brand[]` |

### Types (`src/lib/types/`)

| File | Interfaces |
|------|------------|
| `product.ts` | `Product`, `ProductListResponse`, `PaginationMeta`, `ProductListParams` |
| `category.ts` | `Category` (with recursive `children`) |
| `brand.ts` | `Brand` |

### Components (`src/components/store/`)

| File | Description |
|------|-------------|
| `ProductGrid.tsx` | Main grid component — manages filters, sorting, pagination via URL params |
| `FilterSidebar.tsx` | Desktop filter panel |
| `FilterSheet.tsx` | Mobile filter sheet (uses shadcn `Sheet`) |
| `FilterChips.tsx` | Active filter chips with remove buttons |
| `SortDropdown.tsx` | Sort order selector |
| `Pagination.tsx` | Numbered page controls |
| `BrandFilter.tsx` | Multi-select brand checkboxes |
| `PriceRangeFilter.tsx` | Min/max price inputs |
| `RatingFilter.tsx` | Star rating selector |

### Pages

| Route | File | Type |
|-------|------|------|
| `/category/:slug` | `src/app/(store)/category/[slug]/page.tsx` | Server Component (data fetching) |
| `/search?search=` | `src/app/(store)/search/page.tsx` | Server Component (data fetching) |

## Implementation Order

1. Create types (`lib/types/product.ts`, `category.ts`, `brand.ts`)
2. Create API wrappers (`lib/api/products.ts`, `categories.ts`, `brands.ts`)
3. Create `ProductGrid.tsx` — core listing component with URL-managed filter state
4. Create filter components (`FilterSidebar`, `FilterSheet`, `FilterChips`, `BrandFilter`, `PriceRangeFilter`, `RatingFilter`, `SortDropdown`, `Pagination`)
5. Create category page at `app/(store)/category/[slug]/page.tsx`
6. Create search page at `app/(store)/search/page.tsx`
7. Verify with `npm run build`

## Key Decisions

- **Search param**: URL uses `?search=` (matches backend API param)
- **Category slug resolution**: Fetch category tree server-side, resolve slug to ID in memory
- **Brand filter**: Multi-select, comma-separated IDs
- **Stock/rating filters**: Built with graceful degradation — hide if backend rejects
- **Filter state**: URL query params only — no Zustand
