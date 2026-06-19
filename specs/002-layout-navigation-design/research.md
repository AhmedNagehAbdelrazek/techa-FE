# Research: Layout, Navigation & Design System

## 1. Settings API Response Shape

**Endpoint**: `GET /api/settings/public`

**Finding**: No saved response in Postman collection. Based on frontend-spec.md Phase 2 and common e-commerce patterns, the expected response fields are:

```json
{
  "site_name": "Techa",
  "logo_url": "https://...",
  "currency_code": "SAR",
  "currency_symbol": "ر.س",
  "social_links": {
    "facebook": "https://facebook.com/...",
    "twitter": "https://twitter.com/...",
    "instagram": "https://instagram.com/..."
  },
  "support_email": "support@techa.com",
  "support_phone": "+966..."
}
```

**Decision**: Use `snake_case` field names (backend convention). Map to camelCase in the Zustand store. If the actual response differs, the settings store interface is the single point of mapping.

## 2. Cart API Response Shape

**Endpoint**: `GET /api/cart`

**Finding**: No saved response. Expected to return full cart object. For Phase 2 (badge count only), the frontend should derive `itemCount` from `items.length` in the response. No dedicated count endpoint exists.

```json
{
  "items": [
    {
      "id": "...",
      "product_id": "...",
      "quantity": 2,
      "unit_price": 99.99
    }
  ],
  "subtotal": 199.98,
  "discount_amount": 0,
  "total": 199.98,
  "coupon": null
}
```

**Decision**: `cartStore.itemCount` = `items.length`. Full cart data not needed until Phase 7 — store only tracks count for the badge in Phase 2. The fetch call can be minimal: call `GET /api/cart`, extract count, discard the rest. Refresh after add/remove mutations.

## 3. Wishlist API Response Shape

**Endpoint**: `GET /api/wishlist`

**Finding**: No saved response. Common e-commerce patterns suggest:

```json
{
  "data": [
    {
      "id": "...",
      "product_id": "...",
      "product": {
        "name": "...",
        "slug": "...",
        "primary_image": "...",
        "price": 99.99
      }
    }
  ],
  "total": 3
}
```

Or simpler: just an array of wishlist items.

**Decision**: `wishlistStore.itemCount` = `data.length` or the array length. Structure confirmed as array regardless of wrapper. Store only tracks count in Phase 2; full items fetched for wishlist page in Phase 5/6.

## 4. Shadcn Components Needed

| Component | Status | Add Command (if needed) |
|-----------|--------|------------------------|
| `Sheet` | NOT installed | `npx shadcn@latest add sheet` |
| `Avatar` | NOT installed | `npx shadcn@latest add avatar` |
| `DropdownMenu` | NOT installed | `npx shadcn@latest add dropdown-menu` |
| `Separator` | NOT installed | `npx shadcn@latest add separator` |
| `Input` | NOT installed | `npx shadcn@latest add input` |
| `Badge` | INSTALLED | Already present (`badge.tsx`) |
| `Button` | INSTALLED | Already present (`button.tsx`) |

**All can be added via**: `npx shadcn@latest add sheet avatar dropdown-menu separator input`

## 5. Existing Component Patterns

### Convention Summary
- All interactive components: `"use client"` directive
- Named exports for reusable components
- `cn()` for class merging (clsx + tailwind-merge)
- Props interfaces defined above component, exported when reused
- `forwardRef` for form elements
- `useId()` for HTML IDs
- `aria-*` for accessibility

### Zustand Store Pattern
```typescript
import { create } from "zustand";

interface StoreState {
  // state fields
  // actions
}

export const useStore = create<StoreState>((set, get) => ({
  // initial state
  // actions
}));
```

### Auth Store Pattern (for reference)
Uses `create<Interface>()()` without persist. Has both state fields and action functions. Non-persisted stores follow this pattern.

## 6. Admin Auth Check

Admin auth uses the same `access_token` httpOnly cookie as customer auth. Admin layout must:
1. On the server (layout server component), check if user is authenticated
2. If not, redirect to `/admin/login`
3. On the client, the admin sidebar/top bar fetch `GET /api/admin/auth/me` to get admin name and role

**No dedicated admin login endpoint** in the Postman collection auth section — admin likely uses the same login endpoint with admin credentials. The `/api/admin/auth/me` endpoint differentiates admin vs customer.

## 7. Response Shape Risk Mitigation

Since no API responses are saved in the Postman collection for settings, cart, or wishlist:
- The Zustand store interfaces serve as the contract between frontend and backend
- API wrapper functions parse responses and map to store interfaces
- If backend fields differ, only the API wrapper needs updating (single point of change)
- During development, mock data matching the assumed shape should be used
