# Quickstart: Storefront Homepage

## Prerequisites

- Node.js 18+ (LTS recommended)
- pnpm installed (`npm i -g pnpm`)
- Backend API running at the URL in `NEXT_PUBLIC_API_URL`

## Setup

```bash
git checkout 003-storefront-homepage
pnpm install
```

## Add Missing shadcn Component

```bash
npx shadcn@latest add skeleton
```

## Run Development Server

```bash
pnpm dev
```

Visit `http://localhost:3000` to see the homepage.

## API Dependencies

The homepage requires these backend endpoints to be available:

| Endpoint | Used For |
|----------|----------|
| `GET /api/banners?position=hero` | Hero carousel |
| `GET /api/banners?position=mid_page` | Mid-page banner |
| `GET /api/products?is_featured=true&limit=8` | Featured products |
| `GET /api/products?sort=newest&limit=8` | New arrivals |
| `GET /api/categories/tree` | Category grid |

## Project Structure (new files)

```
src/
├── app/(store)/
│   └── page.tsx                    ← Homepage server component
├── components/
│   ├── ui/skeleton.tsx             ← shadcn skeleton (add via CLI)
│   └── store/
│       ├── HeroBanner.tsx          ← Carousel section
│       ├── ProductCard.tsx         ← Reusable product card
│       ├── CategoryCard.tsx        ← Category grid card
│       └── SectionHeader.tsx       ← Section title + View All
└── lib/
    ├── api/
    │   ├── banners.ts              ← Banner API wrappers
    │   ├── products.ts             ← Product API wrappers
    │   └── categories.ts           ← Category API wrappers
    └── types/
        ├── banner.ts               ← Banner type
        ├── product.ts              ← Product type
        └── category.ts             ← Category type
```

## Verification

1. Homepage loads at `/` with all 5 sections
2. Hero carousel auto-plays, responds to manual controls
3. Product cards show images, names, brands, ratings, prices (with discount formatting)
4. Category cards navigate to `/category/:slug`
5. Each section shows skeleton while loading
6. Empty/error states appear per-section without blocking others
