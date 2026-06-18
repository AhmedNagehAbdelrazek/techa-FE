# SNKRHIVE Next.js Migration Specification

> Complete specification for rebuilding the SNKRHIVE sneaker e-commerce webapp as a Next.js application.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack & Dependencies](#2-tech-stack--dependencies)
3. [Project Structure](#3-project-structure)
4. [Routing & Pages](#4-routing--pages)
5. [Layouts & Components](#5-layouts--components)
6. [State Management](#6-state-management)
7. [API Layer & Data Fetching](#7-api-layer--data-fetching)
8. [Authentication](#8-authentication)
9. [Styling & Theming](#9-styling--theming)
10. [Page-by-Page Content Specification](#10-page-by-page-content-specification)
11. [Static Assets](#11-static-assets)
12. [Environment & Configuration](#12-environment--configuration)

---

## 1. Project Overview

**Name:** SNKRHIVE (techa-store)
**Type:** Sneaker e-commerce storefront (Arabic RTL) + Admin dashboard (English LTR)
**Language:** Storefront in Arabic (RTL), Admin panel in English (LTR)
**Backend:** Separate API server (not included) — the frontend connects to `BACKEND_URL/api`
**Title tag:** SNKRHIVE

---

## 2. Tech Stack & Dependencies

### Core (use these exact or compatible versions)

| Package | Version | Purpose |
|---|---|---|
| `next` | latest (15.x) | Framework |
| `react` | 19.x | UI library |
| `react-dom` | 19.x | DOM renderer |
| `typescript` | 6.x | Type safety |

### Routing

| Package | Purpose |
|---|---|
| Next.js App Router | File-based routing (replaces wouter) |

### State Management

| Package | Version | Purpose |
|---|---|---|
| `zustand` | 5.x | Client state (auth, cart, sidebar, toast, search filters) |

### Data Fetching

| Package | Version | Purpose |
|---|---|---|
| `@tanstack/react-query` | 5.x | Server state, caching, mutations |
| `axios` | 1.x | HTTP client |

### Styling

| Package | Version | Purpose |
|---|---|---|
| `tailwindcss` | 4.x | Utility-first CSS |
| `@tailwindcss/typography` | 0.5.x | Prose styles |
| `tw-animate-css` | 1.4.x | Animation utilities |
| `tailwind-merge` | 3.x | Class merging |
| `clsx` | 2.x | Conditional classes |
| `class-variance-authority` | 0.7.x | Component variants |

### UI Components (shadcn/ui)

| Package | Purpose |
|---|---|
| shadcn/ui (New York style, neutral base) | All UI primitives |
| 30+ `@radix-ui/*` packages | Underlying primitives |
| `cmdk` | Command palette |
| `vaul` | Drawer component |
| `sonner` | Toast notifications |
| `input-otp` | OTP input |
| `embla-carousel-react` + `embla-carousel-autoplay` | Carousel |
| `react-day-picker` | Date picker |
| `react-resizable-panels` | Resizable panels |

### Forms & Validation

| Package | Version | Purpose |
|---|---|---|
| `react-hook-form` | 7.x | Form management |
| `@hookform/resolvers` | 5.x | Validation resolvers |
| `zod` | 4.x | Schema validation |

### Charts

| Package | Version | Purpose |
|---|---|---|
| `recharts` | 3.x | Charts (finance dashboard) |

### Animation

| Package | Version | Purpose |
|---|---|---|
| `framer-motion` | 12.x | Animation library |

### Icons

| Package | Version | Purpose |
|---|---|---|
| `lucide-react` | 1.17.x | Primary icon library |
| `react-icons` | 5.x | Additional icons (FaShippingFast, CiDiscount1, TfiLayoutGrid) |

### Other

| Package | Version | Purpose |
|---|---|---|
| `date-fns` | 4.x | Date utilities |
| `next-themes` | 0.4.x | Theme management (dark/light) |
| `react-is` | 19.x | React type checking |

---

## 3. Project Structure

```
snkrhive-next/
├── public/
│   ├── favicon.svg
│   ├── opengraph.jpg
│   ├── robots.txt
│   └── images/
│       ├── Logo.png
│       ├── White-sb.png
│       ├── B&W-sb.png
│       ├── Boxes.png
│       ├── BoxesMobile.png
│       ├── ShoesOnHandMobile.png
│       ├── shoesOnTheFloor.png
│       ├── shoesOnTheFloorMobile.png
│       ├── asics.png
│       ├── A_minimalist_commercial_showcase_of_202606060900.jpeg
│       ├── her_hand_should_be_from_202606070320(1).jpeg
│       ├── Reviews/
│       │   ├── Review1.jpg
│       │   └── Review2.jpg
│       └── Brands/
│           ├── Adidas.jpg
│           ├── Jordan.jpg
│           ├── NewBalance.jpg
│           ├── Nike.jpg
│           ├── Vans.jpg
│           └── asics.jpg
│
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # Root layout (html, body, providers)
│   │   ├── page.tsx                  # Redirects to / (home)
│   │   ├── globals.css               # Global styles + CSS variables + Tailwind
│   │   │
│   │   ├── (storefront)/             # Route group for storefront (RTL)
│   │   │   ├── layout.tsx            # StoreLayout wrapper (header + footer)
│   │   │   ├── page.tsx              # Home page
│   │   │   ├── products/
│   │   │   │   └── page.tsx          # Product listing
│   │   │   ├── products/
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx      # Product detail
│   │   │   ├── cart/
│   │   │   │   └── page.tsx          # Shopping cart
│   │   │   ├── checkout/
│   │   │   │   └── page.tsx          # Checkout
│   │   │   ├── order-confirmation/
│   │   │   │   └── [orderNumber]/
│   │   │   │       └── page.tsx      # Order confirmation
│   │   │   ├── track/
│   │   │   │   └── page.tsx          # Order tracking
│   │   │   ├── search/
│   │   │   │   └── page.tsx          # Search with filters
│   │   │   ├── auth/
│   │   │   │   ├── signup/
│   │   │   │   │   └── page.tsx      # Customer signup
│   │   │   │   ├── login/
│   │   │   │   │   └── page.tsx      # Customer login
│   │   │   │   └── profile/
│   │   │   │       └── page.tsx      # Customer profile
│   │   │
│   │   ├── admin/                    # Route group for admin (LTR)
│   │   │   ├── layout.tsx            # AdminLayout wrapper (sidebar + content)
│   │   │   ├── login/
│   │   │   │   └── page.tsx          # Admin login
│   │   │   ├── page.tsx              # Admin dashboard
│   │   │   ├── products/
│   │   │   │   ├── page.tsx          # Products table
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx      # Create product
│   │   │   │   └── [id]/
│   │   │   │       └── edit/
│   │   │   │           └── page.tsx  # Edit product
│   │   │   ├── orders/
│   │   │   │   ├── page.tsx          # Orders table
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx      # Order detail
│   │   │   ├── shipping/
│   │   │   │   └── page.tsx          # Shipping regions
│   │   │   ├── finance/
│   │   │   │   └── page.tsx          # Finance dashboard
│   │   │   ├── audit/
│   │   │   │   └── page.tsx          # Audit logs
│   │   │   ├── settings/
│   │   │   │   └── page.tsx          # Settings
│   │   │   ├── suppliers/
│   │   │   │   └── page.tsx          # Suppliers CRUD
│   │   │   ├── brands/
│   │   │   │   └── page.tsx          # Brands CRUD
│   │   │   ├── categories/
│   │   │   │   └── page.tsx          # Categories CRUD
│   │   │   └── admins/
│   │   │       └── page.tsx          # Admin accounts
│   │   │
│   │   └── not-found.tsx             # 404 page
│   │
│   ├── components/
│   │   ├── ui/                       # shadcn/ui components (55 files)
│   │   │   ├── accordion.tsx
│   │   │   ├── alert-dialog.tsx
│   │   │   ├── alert.tsx
│   │   │   ├── aspect-ratio.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── breadcrumb.tsx
│   │   │   ├── button.tsx
│   │   │   ├── calendar.tsx
│   │   │   ├── card.tsx
│   │   │   ├── carousel.tsx
│   │   │   ├── chart.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── collapsible.tsx
│   │   │   ├── command.tsx
│   │   │   ├── context-menu.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── drawer.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── hover-card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── input-otp.tsx
│   │   │   ├── label.tsx
│   │   │   ├── menubar.tsx
│   │   │   ├── navigation-menu.tsx
│   │   │   ├── pagination.tsx
│   │   │   ├── popover.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── radio-group.tsx
│   │   │   ├── resizable.tsx
│   │   │   ├── scroll-area.tsx
│   │   │   ├── select.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── slider.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── toaster.tsx
│   │   │   ├── tooltip.tsx
│   │   │   └── ... (all shadcn/ui New York components)
│   │   │
│   │   ├── layout/
│   │   │   ├── store-layout.tsx      # Storefront header + footer
│   │   │   └── admin-layout.tsx      # Admin sidebar + content
│   │   │
│   │   ├── add-variant-dialog.tsx
│   │   ├── brand-badge.tsx
│   │   ├── description-editor.tsx
│   │   ├── discount-badge.tsx
│   │   ├── featured-collection-cards.tsx
│   │   ├── header-search.tsx
│   │   ├── image-gallery-editor.tsx
│   │   ├── image.tsx                 # Custom Image with hover preview
│   │   ├── long-specs-table.tsx
│   │   ├── product-card.tsx          # Product card with variant drawer
│   │   ├── product-info-editor.tsx
│   │   ├── product-showcase-section.tsx
│   │   ├── review-card.tsx
│   │   ├── review-form.tsx
│   │   ├── search-overlay.tsx
│   │   ├── section-editor.tsx
│   │   ├── section-list.tsx
│   │   ├── section-preview.tsx
│   │   ├── shipping-marquee.tsx
│   │   ├── specs-table.tsx
│   │   ├── star-rating.tsx
│   │   ├── supplier-info.tsx
│   │   ├── variant-list.tsx
│   │   └── variant-selector-editor.tsx
│   │
│   ├── hooks/
│   │   ├── index.ts                  # React Query hooks for ALL API endpoints
│   │   ├── use-cart.ts               # Cart convenience hook
│   │   ├── use-mobile.tsx            # Mobile breakpoint detection
│   │   └── use-toast.ts              # Toast notification hook
│   │
│   ├── lib/
│   │   ├── api.ts                    # Re-exports of hooks, types, utils
│   │   └── utils.ts                  # cn() utility (clsx + tailwind-merge)
│   │
│   ├── services/
│   │   ├── api.ts                    # All API endpoint functions (Axios)
│   │   ├── auth.ts                   # Auth token interceptor setup
│   │   └── client.ts                 # Axios instance + error handling
│   │
│   ├── stores/
│   │   ├── auth.ts                   # Zustand auth store (persisted)
│   │   ├── cart.ts                   # Zustand cart store (persisted, v1)
│   │   ├── search-filters.ts         # Zustand search filters (URL-synced)
│   │   ├── sidebar.ts                # Zustand sidebar state
│   │   └── toast.ts                  # Zustand toast state
│   │
│   └── types/
│       ├── admin.ts                  # Brand, Supplier, Category types
│       ├── auth.ts                   # Auth schemas (Zod), AuthUser, AuthResponse
│       ├── product.ts                # Product, AdminProduct, ProductImage types
│       ├── review.ts                 # Review types
│       └── section.ts                # Custom section types
│
├── .env.local                        # Environment variables
├── components.json                   # shadcn/ui config
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 4. Routing & Pages

### Route Mapping (wouter → Next.js App Router)

| Current Route | Next.js Path | Component Source |
|---|---|---|
| `/` | `src/app/(storefront)/page.tsx` | `pages/storefront/home.tsx` |
| `/products` | `src/app/(storefront)/products/page.tsx` | `pages/storefront/products.tsx` |
| `/products/:id` | `src/app/(storefront)/products/[id]/page.tsx` | `pages/storefront/product-detail.tsx` |
| `/cart` | `src/app/(storefront)/cart/page.tsx` | `pages/storefront/cart.tsx` |
| `/checkout` | `src/app/(storefront)/checkout/page.tsx` | `pages/storefront/checkout.tsx` |
| `/order-confirmation/:orderNumber` | `src/app/(storefront)/order-confirmation/[orderNumber]/page.tsx` | `pages/storefront/order-confirmation.tsx` |
| `/track` | `src/app/(storefront)/track/page.tsx` | `pages/storefront/track.tsx` |
| `/search` | `src/app/(storefront)/search/page.tsx` | `pages/storefront/search.tsx` |
| `/signup` | `src/app/(storefront)/auth/signup/page.tsx` | `pages/storefront/auth/signup.tsx` |
| `/login` | `src/app/(storefront)/auth/login/page.tsx` | `pages/storefront/auth/login.tsx` |
| `/profile` | `src/app/(storefront)/auth/profile/page.tsx` | `pages/storefront/auth/profile.tsx` |
| `/admin/login` | `src/app/admin/login/page.tsx` | `pages/admin/login.tsx` |
| `/admin` | `src/app/admin/page.tsx` | `pages/admin/dashboard.tsx` |
| `/admin/products` | `src/app/admin/products/page.tsx` | `pages/admin/products/index.tsx` |
| `/admin/products/new` | `src/app/admin/products/new/page.tsx` | `pages/admin/products/form.tsx` |
| `/admin/products/:id/edit` | `src/app/admin/products/[id]/edit/page.tsx` | `pages/admin/products/form.tsx` |
| `/admin/orders` | `src/app/admin/orders/page.tsx` | `pages/admin/orders/index.tsx` |
| `/admin/orders/:id` | `src/app/admin/orders/[id]/page.tsx` | `pages/admin/orders/detail.tsx` |
| `/admin/shipping` | `src/app/admin/shipping/page.tsx` | `pages/admin/shipping.tsx` |
| `/admin/finance` | `src/app/admin/finance/page.tsx` | `pages/admin/finance.tsx` |
| `/admin/audit` | `src/app/admin/audit/page.tsx` | `pages/admin/audit.tsx` |
| `/admin/settings` | `src/app/admin/settings/page.tsx` | `pages/admin/settings.tsx` |
| `/admin/suppliers` | `src/app/admin/suppliers/page.tsx` | `pages/admin/suppliers/index.tsx` |
| `/admin/brands` | `src/app/admin/brands/page.tsx` | `pages/admin/brands/index.tsx` |
| `/admin/categories` | `src/app/admin/categories/page.tsx` | `pages/admin/categories/index.tsx` |
| `/admin/admins` | `src/app/admin/admins/page.tsx` | `pages/admin/admins/index.tsx` |
| `*` (404) | `src/app/not-found.tsx` | `pages/not-found.tsx` |

### Important: Route Groups

- `(storefront)` — wraps all storefront pages with `StoreLayout` (header + footer, `dir="rtl"`)
- `admin` — wraps all admin pages with `AdminLayout` (sidebar + content, `dir="ltr"`)
- The `admin/login` page must NOT be wrapped by `AdminLayout` (it's outside the layout auth guard)

### Dynamic Routes

- `products/[id]` — product detail page, `id` is the product ID (number)
- `order-confirmation/[orderNumber]` — order confirmation, `orderNumber` is a string
- `admin/orders/[id]` — order detail, `id` is the order ID (number)
- `admin/products/[id]/edit` — edit product form, `id` is the product ID (number)

---

## 5. Layouts & Components

### 5.1 Root Layout (`src/app/layout.tsx`)

```tsx
// Must include:
// - <html lang="ar" dir="rtl"> (default to storefront)
// - Google Fonts: Cairo (primary), Inter (secondary)
// - QueryClientProvider (React Query)
// - TooltipProvider
// - Toaster component
// - ThemeProvider from next-themes
```

### 5.2 Store Layout (`src/components/layout/store-layout.tsx`)

Wraps all storefront pages. Contains:

**Header (sticky, `h-[7dvh]`):**
- Left: Hamburger menu (mobile only, `<Menu>` icon)
- Left: Logo (`/images/Logo.png`, links to `/`)
- Center (hidden on mobile): Nav links — الرئيسية (`/`), المنتجات (`/products`), تتبع طلبك (`/track`)
- Right: Search component (`HeaderSearch`)
- Right: Cart icon (`ShoppingCart`) with item count badge (from `useCart` hook)

**Footer:**
- 4-column grid (responsive):
  - Col 1: Logo + tagline "براندك الأول للأحذية في مصر."
  - Col 2: Quick links — المنتجات, تتبع الطلب
  - Col 3: Contact — email, phone numbers
  - Col 4: Social links — Facebook, Instagram, TikTok (from content API)
- Copyright bar: "© {year} SNKRHIVE جميع الحقوق محفوظة."

**Scroll-to-top button:**
- Fixed bottom-left, circular with progress ring
- Shows when scrolled > 5% of page
- SVG circle progress indicator + ArrowUp icon

**Key behavior:**
- `dir="rtl"` on root div
- Uses `useCart()` for cart count
- Uses `useGetContent()` for footer data
- Uses `useAuthStore` for auth state
- `setOnUnauthorized` callback for 401 handling

### 5.3 Admin Layout (`src/components/layout/admin-layout.tsx`)

Wraps all admin pages (except login). Contains:

**Sidebar (fixed `w-64`, `h-screen sticky top-0`):**
- Top: Logo + "Techa Admin" text (links to `/admin`)
- Navigation items (filtered by permissions):
  - Dashboard (`LayoutDashboard`)
  - Orders (`ShoppingBag`)
  - Products (`Package`)
  - Shipping (`MapPin`)
  - Finance (`DollarSign`)
  - Audit Logs (`FileText`)
  - Categories (`Tags`)
  - Suppliers (`Truck`)
  - Brands (`Building2`)
  - Settings (`Settings`)
  - Admins (`Shield`)
- Bottom: Admin avatar (initial letter) + name + Logout button

**Key behavior:**
- Checks admin auth via `useGetAdminMe` query
- Redirects to `/admin/login` if not authenticated
- Filters nav items by `hasPermission(resource)` for non-super-admin users
- `dir="ltr"` on root div
- Active route highlighting (exact match for `/admin`, prefix match for others)

### 5.4 Key Custom Components

All these components must be ported from the current codebase:

| Component | File | Purpose |
|---|---|---|
| `ProductCard` | `product-card.tsx` | Product card with hover effects, variant selection drawer |
| `ProductShowcaseSection` | `product-showcase-section.tsx` | Horizontal scrolling product row |
| `FeaturedCollectionCards` | `featured-collection-cards.tsx` | Featured collection cards section |
| `ShippingMarquee` | `shipping-marquee.tsx` | Scrolling marquee with shipping info |
| `HeaderSearch` | `header-search.tsx` | Search icon that opens search overlay |
| `SearchOverlay` | `search-overlay.tsx` | Full-screen search overlay |
| `Image` | `image.tsx` | Custom Image component with hover preview |
| `StarRating` | `star-rating.tsx` | Star rating display/input |
| `ReviewCard` | `review-card.tsx` | Customer review card |
| `ReviewForm` | `review-form.tsx` | Review submission form |
| `BrandBadge` | `brand-badge.tsx` | Brand badge display |
| `DiscountBadge` | `discount-badge.tsx` | Discount percentage badge |
| `SpecsTable` | `specs-table.tsx` | Product specifications table |
| `LongSpecsTable` | `long-specs-table.tsx` | Extended specifications table |
| `SupplierInfo` | `supplier-info.tsx` | Supplier information display |
| `VariantList` | `variant-list.tsx` | Product variant list |
| `AddVariantDialog` | `add-variant-dialog.tsx` | Dialog for adding variants |
| `DescriptionEditor` | `description-editor.tsx` | Rich text description editor |
| `ImageGalleryEditor` | `image-gallery-editor.tsx` | Image gallery management |
| `ProductInfoEditor` | `product-info-editor.tsx` | Product info form |
| `SectionEditor` | `section-editor.tsx` | Custom section editor |
| `SectionList` | `section-list.tsx` | List of custom sections |
| `SectionPreview` | `section-preview.tsx` | Section preview |
| `VariantSelectorEditor` | `variant-selector-editor.tsx` | Variant selector configuration |

---

## 6. State Management

### 6.1 Zustand Stores

#### `stores/auth.ts` — Customer Auth Store
```ts
interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: AuthUser, token: string) => void;
  clearAuth: () => void;
}
// Persisted to localStorage key: "techa-auth"
```

#### `stores/cart.ts` — Cart Store
```ts
interface CartItem {
  productId: number;
  variantId?: number;
  title: string;
  price: number;
  quantity: number;
  image?: string;
  size?: string;
}
interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: number, variantId?: number) => void;
  updateQuantity: (productId: number, quantity: number, variantId?: number) => void;
  clearCart: () => void;
}
// Persisted to localStorage key: "techa-cart" (version 1)
```

#### `stores/search-filters.ts` — Search Filters Store
```ts
interface SearchFiltersState {
  search: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  isInStock?: boolean;
  setSearchFilters: (filters: Partial<SearchFiltersState>) => void;
  resetFilters: () => void;
}
// Synced with URL query params (useSearchParams)
```

#### `stores/sidebar.ts` — Sidebar State
```ts
interface SidebarState {
  isOpen: boolean;
  toggle: () => void;
  setOpen: (open: boolean) => void;
}
```

#### `stores/toast.ts` — Toast State
```ts
interface ToastState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}
```

### 6.2 React Query Configuration

```ts
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000, // 30 seconds
    },
  },
});
```

All API calls are wrapped in `useQuery` / `useMutation` hooks in `hooks/index.ts`.
Query key helpers are used for cache invalidation patterns.

---

## 7. API Layer & Data Fetching

### 7.1 HTTP Client (`services/client.ts`)

- Create Axios instance with `baseURL` from `NEXT_PUBLIC_BACKEND_URL` (default: `http://localhost:8000/api`)
- Request interceptor: attaches `Authorization: Bearer <token>` from localStorage
- Response interceptor: transforms errors to `ApiError` class, handles 401 by calling `clearAuth()`
- Export `setOnUnauthorized` callback setter

### 7.2 API Endpoints (`services/api.ts`)

All endpoints are proxy calls to the backend. Here is the complete list:

**Products:**
- `GET /products` — List products (pagination, filtering)
- `GET /admin/products` — List products (admin view)
- `GET /products/featured` — Featured products
- `GET /products/categories-summary` — Category counts
- `GET /products/:id` — Single product
- `GET /products/:id/related` — Related products
- `GET /products/search` — Search with filters (search, categoryId, minPrice, maxPrice, isInStock, page, limit, sort)
- `POST /products` — Create product
- `PATCH /products/:id` — Update product
- `DELETE /products/:id` — Delete product

**Orders:**
- `GET /orders` — List orders
- `POST /orders` — Create order
- `GET /orders/track` — Track order (params: phone, orderNumber)
- `GET /orders/stats` — Order statistics
- `GET /orders/:id` — Order detail
- `PATCH /orders/:id` — Update order status

**Shipping:**
- `GET /shipping-regions` — List regions
- `POST /shipping-regions/upload` — Upload pricing PDF (multipart)
- `PATCH /shipping-regions/:id` — Update region price

**Finance:**
- `GET /finance/summary` — Financial summary
- `GET /finance/revenue-chart` — Revenue chart data
- `GET /expenses` — List expenses
- `POST /expenses` — Create expense
- `DELETE /expenses/:id` — Delete expense

**Content & Settings:**
- `GET /content` — Site content (hero, footer, promo banners)
- `PATCH /content` — Update site content
- `GET /settings` — Settings (payment methods)
- `PATCH /settings` — Update settings

**Admin Auth:**
- `POST /admin/login` — Admin login
- `POST /admin/logout` — Admin logout
- `GET /admin/me` — Get current admin

**Customer Auth:**
- `POST /auth/signup` — Customer signup
- `POST /auth/login` — Customer login
- `GET /auth/me` — Get customer profile
- `PATCH /auth/me` — Update profile

**Reviews:**
- `GET /reviews` — List reviews (by product)
- `POST /reviews` — Create review
- `PATCH /reviews/:id` — Update review
- `DELETE /reviews/:id` — Delete review

**Brands:**
- `GET /brands` — List brands (paginated)
- `GET /brands/:id` — Get brand
- `POST /brands` — Create brand
- `PATCH /brands/:id` — Update brand
- `DELETE /brands/:id` — Delete brand

**Suppliers:**
- `GET /suppliers` — List suppliers (paginated)
- `GET /suppliers/:id` — Get supplier
- `POST /suppliers` — Create supplier
- `PATCH /suppliers/:id` — Update supplier
- `DELETE /suppliers/:id` — Delete supplier

**Categories:**
- `GET /categories` — List categories (paginated)
- `GET /categories/:id` — Get category
- `POST /categories` — Create category
- `PATCH /categories/:id` — Update category
- `DELETE /categories/:id` — Delete category

**Admin Management (super_admin):**
- `GET /admin` — List admin accounts
- `POST /admin` — Create admin
- `GET /admin/:id` — Get admin
- `PATCH /admin/:id` — Update admin (role, permissions, isActive)
- `PATCH /admin/:id/password` — Change admin password
- `DELETE /admin/:id` — Delete admin
- `GET /admin/permissions/resources` — Get permission resources/actions

**Custom Sections (per product):**
- `GET /admin/products/:productId/sections` — List sections
- `POST /admin/products/:productId/sections` — Create section
- `PATCH /admin/products/:productId/sections/:sectionId` — Update section
- `DELETE /admin/products/:productId/sections/:sectionId` — Delete section
- `PATCH /admin/products/:productId/sections/reorder/bulk` — Reorder sections

**AI:**
- `POST /ai/generate-description` — AI description generation
- `POST /ai/generate-image` — AI image generation

**Upload:**
- `POST /upload` — File upload (multipart)

**Dashboard:**
- `GET /dashboard/summary` — Dashboard summary (revenue, orders, products)

**Health:**
- `GET /healthz` — Health check

### 7.3 React Query Hooks (`hooks/index.ts`)

Port all 50+ hooks from the current codebase. Each API function gets a corresponding hook:

**Query hooks (useQuery):**
- `useListProducts(params)` — `queryKey: ['products', params]`
- `useListAdminProducts(params)` — `queryKey: ['admin-products', params]`
- `useGetFeaturedProducts()` — `queryKey: ['featured-products']`
- `useGetCategoriesSummary()` — `queryKey: ['categories-summary']`
- `useGetProduct(id)` — `queryKey: ['product', id]`
- `useGetRelatedProducts(id)` — `queryKey: ['related-products', id]`
- `useSearchProducts(params)` — `queryKey: ['search-products', params]`
- `useListOrders(params)` — `queryKey: ['orders', params]`
- `useGetOrderStats(params)` — `queryKey: ['order-stats', params]`
- `useGetOrder(id)` — `queryKey: ['order', id]`
- `useTrackOrder(params)` — `queryKey: ['track-order', params]`
- `useListShippingRegions()` — `queryKey: ['shipping-regions']`
- `useGetFinanceSummary(params)` — `queryKey: ['finance-summary', params]`
- `useGetRevenueChart(params)` — `queryKey: ['revenue-chart', params]`
- `useListExpenses(params)` — `queryKey: ['expenses', params]`
- `useListAuditLogs(params)` — `queryKey: ['audit-logs', params]`
- `useGetContent()` — `queryKey: ['content']`
- `useGetSettings()` — `queryKey: ['settings']`
- `useGetAdminMe()` — `queryKey: ['admin-me']`
- `useGetDashboardSummary()` — `queryKey: ['dashboard-summary']`
- `useListReviews(params)` — `queryKey: ['reviews', params]`
- `useListBrands(params)` — `queryKey: ['brands', params]`
- `useListSuppliers(params)` — `queryKey: ['suppliers', params]`
- `useListCategories(params)` — `queryKey: ['categories', params]`
- `useListAdmins()` — `queryKey: ['admins']`
- `useGetPermissionResources()` — `queryKey: ['permission-resources']`
- `useListProductSections(productId)` — `queryKey: ['product-sections', productId]`
- `useCustomerMe()` — `queryKey: ['customer-me']`

**Mutation hooks (useMutation):**
- `useCreateProduct()` — invalidates `['products']`, `['admin-products']`
- `useUpdateProduct()` — invalidates `['product', id]`, `['products']`
- `useDeleteProduct()` — invalidates `['products']`
- `useCreateOrder()` — invalidates `['orders']`
- `useUpdateOrder()` — invalidates `['order', id]`, `['orders']`
- `useUpdateShippingRegion()` — invalidates `['shipping-regions']`
- `useUploadShippingPdf()` — invalidates `['shipping-regions']`
- `useCreateExpense()` — invalidates `['expenses'], ['finance-summary']`
- `useDeleteExpense()` — invalidates `['expenses'], ['finance-summary']`
- `useUpdateContent()` — invalidates `['content']`
- `useUpdateSettings()` — invalidates `['settings']`
- `useAdminLogin()` — sets auth token
- `useAdminLogout()` — clears auth
- `useCustomerSignup()` — sets auth
- `useCustomerLogin()` — sets auth
- `useUpdateCustomerProfile()` — invalidates `['customer-me']`
- `useCreateReview()` — invalidates `['reviews']`
- `useUpdateReview()` — invalidates `['reviews']`
- `useDeleteReview()` — invalidates `['reviews']`
- `useCreateBrand()` / `useUpdateBrand()` / `useDeleteBrand()` — invalidates `['brands']`
- `useCreateSupplier()` / `useUpdateSupplier()` / `useDeleteSupplier()` — invalidates `['suppliers']`
- `useCreateCategory()` / `useUpdateCategory()` / `useDeleteCategory()` — invalidates `['categories']`
- `useCreateAdmin()` / `useUpdateAdmin()` / `useDeleteAdmin()` / `useChangeAdminPassword()` — invalidates `['admins']`
- `useCreateProductSection()` / `useUpdateProductSection()` / `useDeleteProductSection()` / `useReorderProductSections()` — invalidates `['product-sections', productId]`
- `useGenerateDescription()` — AI description
- `useGenerateProductImage()` — AI image
- `useUploadFile()` — file upload

### 7.4 Next.js API Proxy

Since this is a frontend app that connects to a separate backend, use Next.js API routes as a proxy OR use the Axios client directly. Recommended approach:

**Option A (Direct):** Axios client calls `NEXT_PUBLIC_BACKEND_URL` directly from the browser.
**Option B (Proxy):** Create `src/app/api/[...proxy]/route.ts` that forwards requests to the backend.

Use Option A (simpler, matches current architecture). The `services/client.ts` Axios instance handles all communication.

---

## 8. Authentication

### 8.1 Customer Authentication

- **Signup schema (Zod):** email (valid email) + password (min 8 chars, uppercase, lowercase, number, special char) + name
- **Login schema (Zod):** email + password
- JWT token stored in `localStorage` as `authToken`
- Zustand `useAuthStore` manages `user`, `token`, `isAuthenticated`
- Token attached to all requests via Axios interceptor
- 401 responses trigger `clearAuth()` + redirect to `/login`

### 8.2 Admin Authentication

- Separate admin login flow at `/admin/login`
- JWT token stored in `localStorage` as `authToken`
- Role-based access: `super_admin` (full access) vs `admin` (permissions-based)
- Permissions stored in `adminPermissions` as `Record<string, string[]>` (resource -> actions)
- `AdminLayout` checks admin auth via `useGetAdminMe` query; redirects to `/admin/login` if unauthenticated
- Navigation items filtered by `hasPermission(resource)` for non-super-admin users

### 8.3 Helper Functions (in `pages/admin/login.tsx`)

```ts
function hasPermission(resource: string, action?: string): boolean
function clearAdminAuthInfo(): void
function setAuthTokenGetter(getter: (() => string | null) | null): void
function initAuth(): void  // Called on app load to restore token
```

---

## 9. Styling & Theming

### 9.1 Global CSS (`src/app/globals.css`)

```css
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap');
@import "tailwindcss";
@import "tw-animate-css";
@plugin "@tailwindcss/typography";

@custom-variant dark (&:is(.dark *));
```

### 9.2 Color Palette (CSS Custom Properties)

**Light Mode:**
```css
--background: 0 0% 100%;
--foreground: 222.2 84% 4.9%;
--border: 214.3 31.8% 91.4%;
--card: 0 0% 100%;
--card-foreground: 222.2 84% 4.9%;
--primary: 24 98% 52%;        /* Vibrant Orange/Amber */
--primary-foreground: 0 0% 100%;
--secondary: 180 100% 25%;    /* Vibrant Teal */
--secondary-foreground: 0 0% 100%;
--muted: 210 40% 96.1%;
--muted-foreground: 215.4 16.3% 46.9%;
--destructive: 0 84.2% 60.2%;
--destructive-foreground: 210 40% 98%;
--ring: 24 98% 52%;
```

**Dark Mode:** (`.dark` class)
```css
--background: 222.2 84% 4.9%;
--foreground: 210 40% 98%;
--border: 217.2 32.6% 17.5%;
--primary: 24 98% 52%;
--secondary: 180 100% 25%;
--muted: 217.2 32.6% 17.5%;
--muted-foreground: 215 20.2% 65.1%;
--destructive: 0 62.8% 30.6%;
--ring: 24 98% 52%;
```

### 9.3 Fonts

- **Primary (Cairo):** Used for Arabic storefront UI text
- **Secondary (Inter):** Used for English/admin text and fallback
- Load via Google Fonts in the root layout

### 9.4 Theme Configuration

```ts
// tailwind.config.ts or inline in globals.css
{
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        // ... all CSS variable-based colors
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["Cairo", "Inter", "sans-serif"],
      },
    },
  },
}
```

### 9.5 Custom Utilities

The CSS includes an "elevate" system for hover/active/toggle states and a marquee animation. Port these from `index.css`:

- `hover-elevate` / `hover-elevate-2` — hover brightness overlay
- `active-elevate` / `active-elevate-2` — active brightness overlay
- `toggle-elevate` / `toggle-elevated` — toggle state overlay
- `marquee-track` — infinite horizontal scroll animation (30s linear)

### 9.6 shadcn/ui Configuration

```json
// components.json
{
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

---

## 10. Page-by-Page Content Specification

### 10.1 Home Page (`/`)

**Layout:** `StoreLayout` (header + footer)

**Sections (top to bottom):**

1. **Hero Carousel** (full height `h-[93dvh]`)
   - Embla carousel with autoplay (5s delay, no stop on interaction, RTL direction, loop)
   - 3 slides with responsive images (desktop + mobile variants):
     - Slide 1: `her_hand_should_be_from_202606070320(1).jpeg` (desktop) / `ShoesOnHandMobile.png` (mobile)
     - Slide 2: `shoesOnTheFloor.png` / `shoesOnTheFloorMobile.png`
     - Slide 3: `Boxes.png` / `BoxesMobile.png`
   - Two CTA buttons at bottom-right:
     - "الأكثر مبيعًا" (primary, scrolls to best-sellers section)
     - "المضاف حديثًا" (outline, scrolls to recently-added section)

2. **Shipping Marquee** (`ShippingMarquee` component)
   - Scrolling horizontal marquee with shipping info

3. **Shop by Brand** (`dir="ltr"`)
   - Title: "تسوق حسب الماركة"
   - Subtitle: "اكتشف الماركات المفضلة لديك في مكان واحد"
   - 6 brand logos in a flex wrap row:
     - Nike, Adidas, Air Jordan, Vans, New Balance, Asics
     - Each links to `/search?search={brand_name_lowercase}`
     - Images from `/images/Brands/{Brand}.jpg`

4. **Recently Added Products** (id: `recently-added`)
   - `ProductShowcaseSection` component
   - Title: "المضاف حديثًا"
   - Subtitle: "اكتشف أحدث المنتجات في مجموعتنا"
   - Products from `useListProducts({ page: 1, limit: 30, sort: "newest", active: "true" })`

5. **Featured Collection Cards** (`FeaturedCollectionCards` component)

6. **Best Sellers** (id: `best-sellers`)
   - `ProductShowcaseSection` component
   - Title: "الأكثر مبيعًا"
   - Subtitle: "اكتشف أكثر المنتجات مبيعًا في مجموعتنا"
   - Products from `useGetFeaturedProducts()`
   - "View All" button linking to `/products`

7. **Customer Reviews** (`dir="ltr"`)
   - Title: "آراء العملاء"
   - Subtitle: "آراء العملاء الذين اشتروا منتجاتنا مؤخرًا"
   - 2 review cards in a 2-column grid:
     - Each card: image (40% width) + review content (60% width)
     - 5 stars, reviewer name, "Verified Buyer" badge, review text
     - Review 1: Ahmed Amr — "Weselli f maa3do el ma2as mazbout w el khama 10/10"
     - Review 2: Nada Gamal — "El sneakers di khatira bgd el khama tohfa w moreha awy bgd merci awy 🙏"

---

### 10.2 Products Page (`/products`)

**Layout:** `StoreLayout`

**Content:**
- Product grid with category filter
- "Load more" pagination (infinite scroll style)
- Product cards with image, title, price, variant options
- Category tabs/filters at top
- Products fetched from `useListProducts()`

---

### 10.3 Product Detail Page (`/products/[id]`)

**Layout:** `StoreLayout`

**Content:**
- Image gallery (main image + thumbnails)
- Product title, price, compare-at price (strikethrough)
- Brand badge
- Variant selector (size selection)
- Quantity selector
- Add to cart button
- Product description (HTML rendered)
- Specifications table
- Custom sections (if any)
- Reviews section (list + form)
- Related products section

---

### 10.4 Cart Page (`/cart`)

**Layout:** `StoreLayout`

**Content:**
- Cart items list with:
  - Product image
  - Title + variant (size)
  - Price per item
  - Quantity controls (+/-)
  - Remove button
- Cart summary:
  - Subtotal
  - Shipping estimate
  - Total
- "Proceed to Checkout" button
- Empty cart state with link to products

---

### 10.5 Checkout Page (`/checkout`)

**Layout:** `StoreLayout`

**Content:**
- Delivery information form:
  - Full name
  - Phone number
  - Address (governorate, city, details)
  - Notes (optional)
- Payment method selection:
  - Cash on Delivery (COD)
  - InstaPay
  - Vodafone Cash
- Order summary sidebar
- Place order button
- Form validation with Zod + react-hook-form

---

### 10.6 Order Confirmation Page (`/order-confirmation/[orderNumber]`)

**Layout:** `StoreLayout`

**Content:**
- Success icon/animation
- Order number display
- "Thank you" message
- Order summary
- "Track your order" link
- "Continue shopping" link

---

### 10.7 Order Tracking Page (`/track`)

**Layout:** `StoreLayout`

**Content:**
- Search form: phone number + order number
- Track button
- Order status display (if found):
  - Order number
  - Status badge
  - Items list
  - Timeline/history

---

### 10.8 Search Page (`/search`)

**Layout:** `StoreLayout`

**Content:**
- Search input (pre-filled from URL params)
- Filter sidebar/panel:
  - Category filter
  - Price range slider
  - Size filter
  - In-stock toggle
- Sort dropdown (newest, price low-high, price high-low, popular)
- Grid/list view toggle
- Product grid results
- Pagination
- URL-synced filters (search params)

---

### 10.9 Auth Pages

#### Signup (`/auth/signup`)
- Form: name, email, password, confirm password
- Zod validation (strong password requirements)
- Submit calls `useCustomerSignup()`
- Link to login page

#### Login (`/auth/login`)
- Form: email, password
- Zod validation
- Submit calls `useCustomerLogin()`
- Link to signup page

#### Profile (`/auth/profile`)
- Display current user info
- Edit form: name, address, profile picture
- Submit calls `useUpdateCustomerProfile()`

---

### 10.10 Admin Login (`/admin/login`)

**Layout:** No layout wrapper (standalone page)

**Content:**
- Centered login card
- Username + password form
- "Techa Admin" branding
- Submit calls `useAdminLogin()`
- On success: store token, redirect to `/admin`
- Helper functions: `hasPermission()`, `clearAdminAuthInfo()`, `initAuth()`

---

### 10.11 Admin Dashboard (`/admin`)

**Layout:** `AdminLayout` (sidebar)

**Content:**
- Summary cards row:
  - Total revenue
  - Total orders
  - Total products
  - Recent orders count
- Recent orders table (last 5)
- Top products list
- Revenue chart (Recharts)

---

### 10.12 Admin Products (`/admin/products`)

**Layout:** `AdminLayout`

**Content:**
- Products data table with:
  - Image thumbnail
  - Title
  - Price
  - Category
  - Stock status
  - Actions (edit, delete)
- Search input
- Pagination
- "Add Product" button → `/admin/products/new`

---

### 10.13 Admin Product Form (`/admin/products/new` + `/admin/products/[id]/edit`)

**Layout:** `AdminLayout`

**Content:**
- Tabs: Product Info, Images, Variants, Sections
- **Product Info tab:**
  - Title, handle (auto-generated), body HTML (rich editor)
  - Price, compare-at price, SKU
  - Category select
  - Brand select
  - Supplier select
  - Active toggle
  - AI description generator button
- **Images tab:**
  - Image gallery editor (drag-to-reorder, add/remove)
  - Upload or URL input
  - AI image generator
- **Variants tab:**
  - Variant list with size, price, compare-at price, SKU, available toggle
  - Add variant dialog
  - Variant selector configuration
- **Sections tab:**
  - Section list (custom HTML sections)
  - Section editor (create/edit sections)
  - Reorder sections
  - Section preview

---

### 10.14 Admin Orders (`/admin/orders`)

**Layout:** `AdminLayout`

**Content:**
- Orders data table with:
  - Order number
  - Customer name
  - Total
  - Status badge
  - Date
  - Actions (view)
- Status filter tabs
- Search input
- Pagination

---

### 10.15 Admin Order Detail (`/admin/orders/[id]`)

**Layout:** `AdminLayout`

**Content:**
- Order info header (number, date, status)
- Customer info (name, phone, address)
- Order items table
- Order summary (subtotal, shipping, total)
- Status update dropdown
- Payment status

---

### 10.16 Admin Shipping (`/admin/shipping`)

**Layout:** `AdminLayout`

**Content:**
- Shipping regions table:
  - Region name
  - Price
  - Actions (edit)
- Upload pricing PDF
- Edit region price inline

---

### 10.17 Admin Finance (`/admin/finance`)

**Layout:** `AdminLayout`

**Content:**
- Revenue summary cards
- Revenue chart (Recharts line chart)
- Expenses table with:
  - Description
  - Amount
  - Date
  - Actions (delete)
- Add expense form
- Date range filter

---

### 10.18 Admin Audit (`/admin/audit`)

**Layout:** `AdminLayout`

**Content:**
- Audit logs table with:
  - Timestamp
  - Admin username
  - Action
  - Resource
  - Details
- Pagination
- Date filter

---

### 10.19 Admin Settings (`/admin/settings`)

**Layout:** `AdminLayout`

**Content:**
- Payment methods configuration
- Storefront content settings:
  - Hero content
  - Footer content
  - Social media links
  - Contact info
- Save button

---

### 10.20 Admin Suppliers (`/admin/suppliers`)

**Layout:** `AdminLayout`

**Content:**
- Suppliers data table with:
  - Name
  - Contact info
  - Actions (edit, delete)
- Add supplier dialog
- Edit supplier dialog
- Search input
- Pagination

---

### 10.21 Admin Brands (`/admin/brands`)

**Layout:** `AdminLayout`

**Content:**
- Brands data table with:
  - Name
  - Image
  - Actions (edit, delete)
- Add brand dialog
- Edit brand dialog
- Search input
- Pagination

---

### 10.22 Admin Categories (`/admin/categories`)

**Layout:** `AdminLayout`

**Content:**
- Categories data table with:
  - Name
  - Product count
  - Actions (edit, delete)
- Add category dialog
- Edit category dialog
- Search input
- Pagination

---

### 10.23 Admin Admins (`/admin/admins`)

**Layout:** `AdminLayout`
**Access:** super_admin only

**Content:**
- Admin accounts table with:
  - Username
  - Role
  - Status (active/inactive)
  - Actions (edit, change password, deactivate, delete)
- Add admin dialog:
  - Username, password, role select
  - Permissions matrix (resource × action checkboxes)
- Edit admin dialog
- Change password dialog
- Permission resources fetched from API

---

### 10.24 404 Page

**Content:**
- "404" large text
- "Page not found" message
- "Go home" button

---

## 11. Static Assets

Copy all files from the current `public/images/` directory to the new `public/images/` directory. The complete list:

```
public/images/
├── Logo.png
├── White-sb.png
├── B&W-sb.png
├── Boxes.png
├── BoxesMobile.png
├── ShoesOnHandMobile.png
├── shoesOnTheFloor.png
├── shoesOnTheFloorMobile.png
├── asics.png
├── A_minimalist_commercial_showcase_of_202606060900.jpeg
├── her_hand_should_be_from_202606070320(1).jpeg
├── Reviews/
│   ├── Review1.jpg
│   └── Review2.jpg
└── Brands/
    ├── Adidas.jpg
    ├── Jordan.jpg
    ├── NewBalance.jpg
    ├── Nike.jpg
    ├── Vans.jpg
    └── asics.jpg
```

Also copy:
- `public/favicon.svg`
- `public/opengraph.jpg`
- `public/robots.txt`

---

## 12. Environment & Configuration

### 12.1 Environment Variables (`.env.local`)

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000/api
```

### 12.2 `next.config.ts`

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // If deploying behind a proxy, add rewrites here
};

export default nextConfig;
```

### 12.3 `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

## Implementation Notes for the Builder AI

1. **Start with:** `npx create-next-app@latest` with TypeScript, Tailwind, App Router, `src/` directory
2. **Install shadcn/ui:** `npx shadcn@latest init` (New York style, neutral base)
3. **Install all 55 shadcn/ui components:** `npx shadcn@latest add [component-name]` for each
4. **Copy all static assets** from the current `public/` directory
5. **Port the CSS variables** from `index.css` into `globals.css` (they are Tailwind v4 compatible)
6. **Port Zustand stores** as-is (they are framework-agnostic)
7. **Port services/** (Axios client, API functions) — change import paths from `@/` to work with Next.js
8. **Port hooks/** (React Query hooks) — they are framework-agnostic
9. **Port types/** as-is
10. **Port components/** — replace `wouter` Link/useLocation with Next.js `next/link` and `next/navigation` hooks
11. **Convert pages/** to App Router page.tsx files with proper layouts
12. **Replace `wouter` routing:**
    - `Link` → `next/link` `Link`
    - `useLocation()` → `usePathname()` from `next/navigation`
    - `setLocation(path)` → `router.push(path)` from `next/navigation`
    - `useRoute('/products/:id')` → `useParams()` from `next/navigation`
    - `Switch/Route` → App Router file-based routing
13. **RTL handling:** Storefront pages use `dir="rtl"`, admin pages use `dir="ltr"`. Set on layout root divs.
14. **Mark client components:** All components using hooks, event handlers, or browser APIs need `"use client"` directive
15. **Data fetching:** Keep using React Query hooks (client-side fetching) to maintain compatibility with the existing backend

---

## Migration Checklist

- [ ] Initialize Next.js project with App Router
- [ ] Install all dependencies
- [ ] Set up shadcn/ui (New York style)
- [ ] Copy static assets
- [ ] Configure globals.css with CSS variables
- [ ] Create root layout with providers
- [ ] Create storefront layout (StoreLayout)
- [ ] Create admin layout (AdminLayout)
- [ ] Port all 26 pages to App Router
- [ ] Port Zustand stores
- [ ] Port services (API client, auth, endpoints)
- [ ] Port hooks (React Query hooks)
- [ ] Port types
- [ ] Port all custom components
- [ ] Replace wouter with Next.js navigation
- [ ] Test all routes
- [ ] Test auth flows (customer + admin)
- [ ] Test RTL/LTR switching
- [ ] Test dark/light theme
