# Data Model: Layout, Navigation & Design System

## Entity: SiteSettings

Public site configuration loaded at application boot.

### Fields

| Field | Type | Required | Source | Notes |
|-------|------|----------|--------|-------|
| `siteName` | string | Yes | `site_name` from API | Displayed in header logo fallback and footer |
| `logoUrl` | string (URL) or null | No | `logo_url` from API | Header logo image; null means show text fallback |
| `currencyCode` | string (3 chars) | Yes | `currency_code` from API | e.g. "SAR", "USD" |
| `currencySymbol` | string | Yes | `currency_symbol` from API | e.g. "ر.س", "$" |
| `socialLinks` | Record<string, string> | No | `social_links` from API | e.g. `{ facebook: "...", twitter: "...", instagram: "..." }` |
| `supportEmail` | string or null | No | `support_email` from API | Footer contact |
| `supportPhone` | string or null | No | `support_phone` from API | Footer contact |

### Loading

- Fetched once at app boot via `GET /api/settings/public` from the server-side layout
- Hydrated to client Zustand store via a hydration component (`SettingsHydrator`)
- On failure: use hardcoded defaults (site name "Techa", no logo, empty social links)

---

## Entity: CartSummary

Minimal cart state for the header badge.

### Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `itemCount` | number | Yes | Derived from `items.length` from `GET /api/cart` |
| `isLoading` | boolean | Yes | True during initial fetch or mutation |

### Loading

- Fetched on mount (and after login) via `GET /api/cart`
- Updated reactively when items are added or removed (from any phase)
- Stored in Zustand `cartStore`, no persistence
- On failure: itemCount stays 0, no error shown

### State Transitions

```
[Initial: itemCount=0, isLoading=false]
    │
    ├── page mount → fetchCart()
    │       │
    │       ├── success → itemCount = items.length, isLoading=false
    │       └── failure → itemCount=0, isLoading=false (silent)
    │
    └── addItem/removeItem mutation (from any page)
            │
            ├── optimistic: update itemCount immediately
            └── confirm: refetch or use returned count
```

---

## Entity: WishlistSummary

Minimal wishlist state for the header badge.

### Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `itemCount` | number | Yes | Derived from array length from `GET /api/wishlist` |
| `isLoading` | boolean | Yes | True during initial fetch or mutation |

### Loading

- Fetched on mount (and after login) via `GET /api/wishlist`
- Refetched after add/remove wishlist mutations
- Stored in Zustand `wishlistStore`, no persistence
- On failure: itemCount stays 0, no error shown

### State Transitions

```
[Initial: itemCount=0, isLoading=false]
    │
    ├── page mount (if authenticated) → fetchWishlist()
    │       │
    │       ├── success → itemCount = data.length, isLoading=false
    │       └── failure → itemCount=0, isLoading=false (silent)
    │
    └── toggleWishlist mutation (from any page)
            │
            └── refetch wishlist → update itemCount
```

---

## Entity: NavigationLink

Used for both storefront and admin sidebar navigation.

### Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `label` | string | Yes | Display text |
| `href` | string | Yes | Route path |
| `icon` | string (icon name) | No | lucide-react icon name for sidebar |
| `active` | boolean | Yes | Computed from current route at render time |

### Admin Sidebar Links (static)

| Label | Href | Icon |
|-------|------|------|
| Dashboard | `/admin` | `LayoutDashboard` |
| Products | `/admin/products` | `Package` |
| Categories | `/admin/categories` | `FolderTree` |
| Brands | `/admin/brands` | `Tag` |
| Tags | `/admin/tags` | `Tags` |
| Orders | `/admin/orders` | `ShoppingBag` |
| Coupons | `/admin/coupons` | `Percent` |
| Banners | `/admin/banners` | `Image` |
| Delivery Zones | `/admin/delivery-zones` | `MapPin` |
| Settings | `/admin/settings` | `Settings` |
| Admins | `/admin/admins` | `Shield` |

### Footer Links (static)

| Label | Href |
|-------|------|
| About | `/about` |
| Contact | `/contact` |
| FAQs | `/faqs` |
| Privacy Policy | `/privacy` |
| Terms | `/terms` |
