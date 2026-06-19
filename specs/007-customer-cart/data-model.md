# Data Model: Customer Cart

## Entities

### Cart

The full cart object returned by the API and stored in Zustand.

| Field | Type | Description | Source |
|-------|------|-------------|--------|
| `id` | `string` (UUID) | Cart identifier | API |
| `subtotal` | `number` | Sum of all item `total_price` values | API |
| `discount` | `number` | Discount amount from applied coupon | API |
| `total` | `number` | Final total after discount | API |
| `coupon` | `CartCoupon \| null` | Applied coupon, if any | API |
| `items` | `CartItem[]` | Line items in the cart | API |
| `version` | `number` | Optimistic concurrency version (server-tracked) | API |

### CartItem

A single product line item within the cart.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` (UUID) | Cart item identifier |
| `product_id` | `string` (UUID) | Product identifier |
| `product_name` | `string` | Product display name |
| `product_slug` | `string` | Product URL slug |
| `product_image` | `string \| null` | Product thumbnail URL |
| `variant_id` | `string \| null` | Variant identifier (nullable) |
| `variant_label` | `string \| null` | Variant display label (nullable) |
| `qty` | `number` | Quantity (integer, >= 1) |
| `unit_price` | `number` | Price at time item was added to cart |
| `total_price` | `number` | `qty * unit_price` |
| `current_price` | `number` | Current product price (may differ from `unit_price`) |
| `price_changed` | `boolean` | Whether `current_price !== unit_price` |

**Validation**:
- `qty` must be >= 1 and <= available stock
- `total_price` is `qty * unit_price` (computed by backend)

### CartCoupon

An applied coupon/discount code.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` (UUID) | Coupon identifier |
| `code` | `string` | Coupon code (e.g., "SAVE10") |
| `discount_type` | `"percentage" \| "fixed"` | Type of discount |
| `discount_value` | `number` | Discount amount/value |

## Request/Response Types

### AddItemRequest

```typescript
interface AddItemRequest {
  product_id: string;
  variant_id: string | null;
  qty: number;
}
```

### UpdateItemRequest

```typescript
interface UpdateItemRequest {
  qty: number;
}
```

### ApplyCouponRequest

```typescript
interface ApplyCouponRequest {
  code: string;
}
```

### CartResponse

The full `Cart` object — returned by all cart API endpoints.

## State Transitions

### Cart Item Lifecycle

```
[Empty] --addItem--> [Has Items] --addItem (same product+variant)--> [Qty Incremented]
                                      --removeItem--> [Empty]
                                      --updateItemQty (qty=0)--> [Removed]
                                      --updateItemQty--> [Qty Updated]
```

### Coupon Lifecycle

```
[No Coupon] --applyCoupon--> [Coupon Applied]
                             --removeCoupon--> [No Coupon]
```

### Store State Transitions

```
[Fetching] --success--> [Ready (items + totals)]
           --error-->   [Error (show toast, cached state)]

[Optimistic Action] --API success--> [Ready (updated)]
                    --API error-->   [Rollback to previous]
```

## Zustand Store Interface

```typescript
interface CartStore {
  // State
  items: CartItem[];
  coupon: CartCoupon | null;
  subtotal: number;
  discount: number;
  total: number;
  version: number;
  isLoading: boolean;
  error: string | null;

  // Computed
  itemCount: number;

  // Actions
  fetchCart: () => Promise<void>;
  addItem: (data: AddItemRequest) => Promise<void>;
  updateItemQty: (itemId: string, qty: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => Promise<void>;
  reset: () => void;
}
```
