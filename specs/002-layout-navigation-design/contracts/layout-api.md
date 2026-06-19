# API Contracts: Layout, Navigation & Design System

> Contract definitions for API endpoints consumed by Phase 2 layout components.

## GET /api/settings/public

Fetches public site settings for the storefront header and footer.

### Response (200)

```typescript
interface PublicSettingsResponse {
  site_name: string;
  logo_url: string | null;
  currency_code: string;      // e.g., "SAR"
  currency_symbol: string;    // e.g., "ر.س"
  social_links: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    [key: string]: string | undefined;
  };
  support_email: string | null;
  support_phone: string | null;
}
```

### Client Mapping (settings.store.ts)

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
  // Actions
  setSettings: (settings: Partial<SettingsStore>) => void;
}
```

### Error Handling

| Status | Behavior |
|--------|----------|
| 200 | Hydrate store with response data |
| 4xx/5xx | Keep defaults, log warning, no user-facing error |
| Network error | Keep defaults (site name "Techa"), no logo |

---

## GET /api/cart

Fetches the current user's cart. Used in Phase 2 only for the badge count.

### Response (200)

```typescript
interface CartResponse {
  items: CartItem[];
  subtotal: number;
  discount_amount: number;
  total: number;
  coupon: string | null;
}

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
}
```

### Client Mapping (cart.store.ts)

```typescript
interface CartStore {
  itemCount: number;
  isLoading: boolean;
  // Actions
  fetchCart: () => Promise<void>;
  setItemCount: (count: number) => void;
}
```

### Error Handling

| Status | Behavior |
|--------|----------|
| 200 | Set itemCount from `items.length` |
| 401 | User not authenticated — set itemCount to 0 (silent) |
| 4xx/5xx | Set itemCount to 0, no user-facing error |

---

## GET /api/wishlist

Fetches the current user's wishlist. Used in Phase 2 only for the badge count.

### Response (200)

```typescript
// Response shape (either array or object wrapper)
interface WishlistResponse {
  data: WishlistItem[];
  total?: number;
}

// OR plain array:
// type WishlistResponse = WishlistItem[];

interface WishlistItem {
  id: string;
  product_id: string;
}
```

### Client Mapping (wishlist.store.ts)

```typescript
interface WishlistStore {
  itemCount: number;
  isLoading: boolean;
  // Actions
  fetchWishlist: () => Promise<void>;
  setItemCount: (count: number) => void;
}
```

### Error Handling

| Status | Behavior |
|--------|----------|
| 200 | Set itemCount from array length |
| 401 | User not authenticated — set itemCount to 0 (silent) |
| 4xx/5xx | Set itemCount to 0, no user-facing error |
