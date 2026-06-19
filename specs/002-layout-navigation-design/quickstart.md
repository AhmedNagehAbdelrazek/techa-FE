# Quickstart: Layout, Navigation & Design System

## Prerequisites

- Completed Phase 1 (Customer Auth Foundation) — specifically AuthProvider must be fixed and uncommented in `src/app/layout.tsx`
- Branch: `002-layout-navigation-design`
- Packages already installed: Zustand, lucide-react, clsx, tailwind-merge, Radix UI

## Step 1 — Add Shadcn Components

```bash
npx shadcn@latest add sheet avatar dropdown-menu separator input
```

These are needed for: mobile nav overlay (Sheet), admin user avatar (Avatar), user dropdown menu (DropdownMenu), content separators (Separator), search input (Input).

## Step 2 — Create Zustand Stores

### `src/lib/stores/settings.store.ts`

Interface:
```typescript
interface SettingsStore {
  siteName: string;
  logoUrl: string | null;
  currencyCode: string;
  currencySymbol: string;
  socialLinks: Record<string, string>;
  supportEmail: string | null;
  supportPhone: string | null;
  isLoading: boolean;
  error: string | null;
  setSettings: (settings: Partial<SettingsStore>) => void;
}
```

### `src/lib/stores/cart.store.ts`

Interface:
```typescript
interface CartStore {
  itemCount: number;
  isLoading: boolean;
  fetchCart: () => Promise<void>;
  setItemCount: (count: number) => void;
}
```

### `src/lib/stores/wishlist.store.ts`

Interface:
```typescript
interface WishlistStore {
  itemCount: number;
  isLoading: boolean;
  fetchWishlist: () => Promise<void>;
  setItemCount: (count: number) => void;
}
```

## Step 3 — Create Layout Components

| Component | File | Purpose |
|-----------|------|---------|
| Logo | `components/layout/Logo.tsx` | Site logo (image or text fallback), links to `/` |
| Header | `components/layout/Header.tsx` | Storefront header: logo, search, cart badge, wishlist badge, auth controls |
| Footer | `components/layout/Footer.tsx` | Storefront footer: site info, nav links, social, copyright |
| MobileNav | `components/layout/MobileNav.tsx` | Hamburger menu with full-screen Sheet overlay |
| AdminSidebar | `components/layout/AdminSidebar.tsx` | Admin sidebar with nav links + active state |
| AdminTopBar | `components/layout/AdminTopBar.tsx` | Admin top bar: admin name, role, logout |
| Breadcrumbs | `components/layout/Breadcrumbs.tsx` | Route-based breadcrumb trail |
| SettingsHydrator | `components/stores/SettingsHydrator.tsx` | Hydrates settings from server → client store |
| CartStoreHydrator | `components/stores/CartStoreHydrator.tsx` | Hydrates cart count from API on mount |

## Step 4 — Create Route Group Layouts

### `src/app/(store)/layout.tsx`

Server component that:
1. Fetches `GET /api/settings/public` on the server
2. Passes settings data to `SettingsHydrator` client component
3. Renders `<Header />` + `<Footer />` wrapping `{children}`

### `src/app/(admin)/layout.tsx`

Server component that:
1. Checks admin auth (redirect to `/admin/login` if unauthenticated)
2. Renders `<AdminSidebar />` + `<AdminTopBar />` + `<Breadcrumbs />` wrapping `{children}`

## Step 5 — Verify

1. Navigate to any storefront page → header shows logo, search, cart badge (0), wishlist badge (0), login/register buttons
2. Navigate to any `/admin` route → admin sidebar with nav links, top bar with admin info
3. Resize to mobile → hamburger menu appears, full-screen overlay works
4. Cart/wishlist badge updates after mutations

## Environment Variables

No new env vars needed for Phase 2. The existing `NEXT_PUBLIC_BACKEND_URL` (or aligned `NEXT_PUBLIC_API_URL`) is sufficient.

## Testing

```bash
# Unit tests for stores and layout components
npx vitest run specs/002-layout-navigation-design/

# E2E layout tests
npx playwright test --grep "layout"
```
