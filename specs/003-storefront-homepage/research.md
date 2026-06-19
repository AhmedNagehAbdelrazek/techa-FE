# Research: Storefront Homepage

**Phase 0 decisions for** `003-storefront-homepage`

---

## 1. Carousel Library

**Decision**: Use embla-carousel-react (via shadcn/ui `carousel` component)

**Rationale**: Already installed (`src/components/ui/carousel.tsx` exists). Includes `embla-carousel-autoplay` plugin. Zero additional install cost. shadcn's wrapper provides consistent API with other components.

**Alternatives considered**: Swiper (not installed, would add 50KB+), manual CSS carousel (too complex for auto-play + touch + RTL).

---

## 2. Skeleton Loaders

**Decision**: Add shadcn `skeleton` component via `npx shadcn@latest add skeleton`

**Rationale**: Spec requires skeleton loaders per section. `LoadingState.tsx` exists but is a text-based loading indicator. shadcn `skeleton` provides the animated placeholder blocks spec demands.

**Alternatives considered**: Custom CSS skeletons (reinventing the wheel — shadcn skeleton is 6 lines).

---

## 3. Star Rating Component

**Decision**: Inline SVG icons (filled, half, empty) with no third-party library

**Rationale**: Spec explicitly forbids third-party rating libraries. lucide-react is already installed for icons. Can build star SVG inline in ~15 lines — passes Pre-Flight checklist rule 5 (one line per variant).

**Alternatives considered**: react-icons (not installed, adds 1000+ icons), `@smastrom/react-rating` (external dependency).

---

## 4. API Response Shapes (from Postman Collection)

### Banners — `GET /api/banners?position=hero|mid_page`

```json
[
  {
    "id": "uuid",
    "title": "Summer Sale",
    "description": "Get 50% off",
    "image_url": "https://...",
    "link_url": "https://...",
    "position": "hero",
    "sort_order": 1,
    "starts_at": "2026-06-01T00:00:00Z",
    "ends_at": "2026-07-01T00:00:00Z",
    "is_active": true
  }
]
```

### Products List — `GET /api/products?is_featured=true&limit=8` / `GET /api/products?sort=newest&limit=8`

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Product Name",
      "slug": "product-name",
      "description": "...",
      "base_price": 49.99,
      "discount_percent": 20,
      "primary_image": { "url": "https://...", "alt_text": "..." },
      "brand": { "id": "uuid", "name": "Brand Name", "slug": "brand-name" },
      "rating": { "average": 4.5, "count": 120 },
      "is_featured": true,
      "created_at": "2026-06-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 8,
    "total": 45,
    "pages": 6
  }
}
```

### Category Tree — `GET /api/categories/tree`

```json
[
  {
    "id": "uuid",
    "name": "Electronics",
    "slug": "electronics",
    "image_url": "https://...",
    "sort_order": 1,
    "is_active": true,
    "children": [
      {
        "id": "uuid",
        "name": "Phones",
        "slug": "phones",
        "image_url": "https://...",
        "sort_order": 1,
        "children": []
      }
    ]
  }
]
```

Top-level categories extracted by filtering for nodes where `parent_id` is null or they're root nodes in the tree array.

---

## 5. View All Link Destinations

**Decision**: 
- Featured Products → `/search?is_featured=true`
- New Arrivals → `/search?sort=newest`
- Categories — no "View All" (all top-level categories shown)

**Rationale**: The `/search` route (Phase 4) will support query params for filtering and sorting. These links will work once Phase 4 is implemented. Category grid shows all top-level categories so no "View All" is needed.

---

## 6. Hero Carousel Behavior

**Decision**: 
- Auto-play interval: 5 seconds
- Transition: slide (embla default)
- Pause on hover/focus
- Touch/swipe on mobile
- Manual controls: prev/next arrows + dot indicators
- Zero banners → section hidden entirely

**Rationale**: Industry-standard carousel behavior. All supported by embla-carousel with minimal config.
