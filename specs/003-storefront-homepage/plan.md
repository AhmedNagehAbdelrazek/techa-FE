# Implementation Plan: Storefront Homepage

**Branch**: `003-storefront-homepage` | **Date**: 2026-06-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/003-storefront-homepage/spec.md`

## Summary

Build the storefront homepage at `/` with five live-data sections: hero banner carousel, featured products grid, top-level category grid, mid-page banner, and new arrivals. All data fetched server-side (Server Components) for SEO. Each section independently handles its own loading/error/empty states.

## Technical Context

**Language/Version**: TypeScript 5 (strict), React 19, Next.js 15 (App Router)

**Primary Dependencies**: shadcn/ui (`carousel`, `badge`, `skeleton`, `button`), embla-carousel-react + embla-carousel-autoplay, lucide-react (star icons, heart icon), next/image, sonner (toast for wishlist errors)

**Storage**: N/A — data fetched server-side from backend APIs each request (cache via `fetch` revalidate)

**Testing**: Vitest + @testing-library/react (unit), Playwright (E2E)

**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge), 375px+ width

**Project Type**: Web application (Next.js App Router, `(store)` route group)

**Performance Goals**: Homepage renders fully populated <3s on broadband; skeleton loaders visible until each section resolves

**Constraints**: Server Components for SEO; per-section independent error handling; RTL support (Arabic-first); all images via next/image; hero images get priority loading

**Scale/Scope**: Five sections, 8 items max per product section, top-level categories only, up to 10 hero banners

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status |
|------|--------|
| Server Components used for homepage data fetching | ✅ Standard Next.js pattern, matches existing `(store)/layout.tsx` |
| Per-section loading/error/empty states | ✅ Matches existing `ErrorState`, `LoadingState`, `EmptyState` components |
| shadcn/ui components for UI primitives | ✅ `carousel`, `badge`, `skeleton` are shadcn/ui — already installed or trivial to add |
| Custom star rating (no library) | ✅ Inline SVG stars, 4 lines — passes Pre-Flight checklist rule 5 |
| All images via next/image | ✅ Standard platform API, no extra dependency |

All gates pass. No violations.

## Project Structure

### Documentation (this feature)

```text
specs/003-storefront-homepage/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 — research decisions
├── data-model.md        # Phase 1 — entity definitions
├── quickstart.md        # Phase 1 — setup guide
├── contracts/           # Phase 1 — API contracts
└── tasks.md             # Future — implementation tasks
```

### Source Code (new/modified files)

```text
src/
├── app/(store)/
│   └── page.tsx                    # NEW — homepage server component
├── components/
│   ├── ui/
│   │   └── skeleton.tsx            # ADD — shadcn skeleton component
│   └── store/
│       ├── HeroBanner.tsx          # NEW — carousel section
│       ├── ProductCard.tsx         # NEW — reusable product card
│       ├── CategoryCard.tsx        # NEW — category grid card
│       └── SectionHeader.tsx       # NEW — section title + View All
├── lib/
│   ├── api/
│   │   ├── banners.ts              # NEW — banner API wrappers
│   │   ├── products.ts             # NEW — product API wrappers
│   │   └── categories.ts           # NEW — category API wrappers
│   └── types/
│       ├── banner.ts               # NEW — banner type
│       ├── product.ts              # NEW — product type
│       └── category.ts             # NEW — category type
```

**Structure Decision**: Single web app (Next.js). New files follow existing conventions: API wrappers in `lib/api/`, types in `lib/types/`, components in `components/store/` per the folder structure convention.

## Complexity Tracking

No Constitution violations — complexity tracking not required.
