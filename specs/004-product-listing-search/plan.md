# Implementation Plan: Product Listing & Search

**Branch**: `004-product-listing-search` | **Date**: 2026-06-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/004-product-listing-search/spec.md`

## Summary

Two storefront pages — category listing (`/category/:slug`) and search results (`/search?search=`) — with a shared product grid, URL-driven filter sidebar (desktop) / sheet (mobile), sort dropdown, pagination, and active filter chips. All filter state lives in URL query params. Built using existing Next.js App Router patterns, Tailwind CSS, shadcn/ui components, and the existing `Request.ts` API client.

## Technical Context

**Language/Version**: TypeScript 5 (`strict: true`), React 19, Next.js 15 (App Router)

**Primary Dependencies**: Next.js (App Router, `useSearchParams`, `useRouter`), TanStack React Query 5 (server state), shadcn/ui Sheet + Badge + Checkbox + Skeleton, lucide-react (icons), sonner (toasts)

**Storage**: N/A (all data fetched live from backend API)

**Testing**: Vitest + @testing-library/react (unit/integration), @playwright/test (E2E)

**Target Platform**: Modern browsers (desktop + mobile 375px+), Arabic-first RTL

**Project Type**: Web application (Next.js frontend)

**Performance Goals**: Category/search page renders within 3s on standard connection; filter changes reflect within 2s

**Constraints**: URL-only filter state (no Zustand for filters); mobile-first responsive; all API calls via existing `Request.ts` client; Arabic/RTL support

**Scale/Scope**: 2 pages, ~5 filter types, 1 sort dropdown, paginated product grid

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| Pre-flight checklist (YAGNI) | PASS | No new dependencies needed; all required components exist (Sheet, Badge, Checkbox, Skeleton) |
| Existing patterns compliance | PASS | Follows established: API client (`Request.ts`), URL-based state (no Zustand for filters), shadcn components, named exports |
| No unnecessary abstractions | PASS | ProductCard already exists from Phase 3; reuse where possible |
| Architecture consistency | PASS | Pages under `(store)` route group, components in `components/store/`, API wrappers in `lib/api/`, types in `lib/types/` |

**No violations found. Complexity Tracking section is not needed.**

## Project Structure

### Documentation (this feature)

```text
specs/004-product-listing-search/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── app/(store)/
│   ├── category/[slug]/
│   │   └── page.tsx           # Category listing page
│   └── search/
│       └── page.tsx           # Search results page
├── components/store/
│   ├── ProductGrid.tsx        # Reusable grid with filters, sort, pagination
│   ├── FilterSidebar.tsx      # Desktop filter sidebar
│   ├── FilterSheet.tsx        # Mobile filter sheet
│   ├── FilterChips.tsx        # Active filter chips
│   ├── SortDropdown.tsx       # Sort selector
│   ├── Pagination.tsx         # Page navigation
│   ├── BrandFilter.tsx        # Multi-select brand checkboxes
│   ├── PriceRangeFilter.tsx   # Min/max price inputs
│   ├── RatingFilter.tsx       # Star rating selector
│   └── ProductCard.tsx        # Reuse from Phase 3 (or extend)
├── lib/
│   ├── api/
│   │   ├── products.ts        # Product list/search API wrapper
│   │   ├── categories.ts      # Category tree API wrapper
│   │   └── brands.ts          # Brand list API wrapper
│   └── types/
│       ├── product.ts         # Product list response types
│       ├── category.ts        # Category tree types
│       └── brand.ts           # Brand types
```

**Structure Decision**: Web application (Next.js frontend only). Follows existing project conventions from constitution: pages in `app/(store)/`, components in `components/store/`, API wrappers in `lib/api/`, types in `lib/types/`.
