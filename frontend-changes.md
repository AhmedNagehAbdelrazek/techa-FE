# Frontend Changes — Variant-Only Pricing

## Summary

`base_price` and `discount_percent` have been **removed from the Product model**. All pricing now lives exclusively on **ProductVariants**. Every product **must have at least one variant**.

---

## API Changes

### 1. Create Product (`POST /api/admin/products`)

**Before:**
```json
{
  "name": "Product",
  "base_price": 49.99,
  "discount_percent": 10,
  "variants": [...]
}
```

**After:** `base_price` and `discount_percent` are gone. Price lives only on variants:
```json
{
  "name": "Product",
  "variants": [
    {
      "sku": "PRD-BLK",
      "price": 49.99,
      "stock_qty": 100,
      "discount_percent": 10,
      "options": [{ "option_name": "color", "option_value": "black" }]
    }
  ]
}
```

**Now required:** `variants` array with at least **1** item.

### 2. Update Product (`PUT /api/admin/products/:id`)

**Before:**
```json
{
  "base_price": 39.99,
  ...
}
```

**After:** Remove `base_price` from the payload. Update variant prices inside the `variants` array:
```json
{
  "name": "Updated Product",
  "variants": [
    { "id": "...", "version": 1, "price": 39.99, "stock_qty": 200 }
  ]
}
```

### 3. Get Product Detail (`GET /api/products/:slug`)

**Before response:**
```json
{
  "base_price": 49.99,
  "discount_percent": 10,
  "variants": [...]
}
```

**After response:** No `base_price` at product level:
```json
{
  "price": 49.99,
  "discount_percent": 10,
  "variants": [...]
}
```

`price` and `discount_percent` are now **computed** from the first active variant.

### 4. List Products (`GET /api/products`)

**Before response:**
```json
{
  "base_price": 49.99,
  "discount_percent": 10
}
```

**After response:**
```json
{
  "price": 49.99,
  "discount_percent": 10,
  "stock_qty": 100
}
```

- `price` = minimum price among active variants
- `discount_percent` = discount from first active variant
- `stock_qty` = sum of all variants stock

---

## Cart Changes

### Add to Cart (`POST /api/cart`)

`variant_id` is now **required**:

```json
{
  "product_id": "uuid",
  "variant_id": "uuid",
  "qty": 1
}
```

### Cart Response

The `current_price` field now always comes from the **variant price** (no more fallback to `product.base_price`).

---

## Wishlist Changes

### Wishlist Response

`base_price` replaced with `price` (from cheapest variant) and `stock_qty`:

```json
{
  "Product": {
    "price": 49.99,
    "stock_qty": 100,
    ...
  }
}
```

---

## Frontend Checklist

1. **Product create form** — Remove `base_price` and `discount_percent` inputs. Add variant editor as mandatory.
2. **Product edit form** — Remove `base_price` input. Edit variant prices instead.
3. **Product detail page** — Read `price` instead of `base_price` from response.
4. **Product list/cards** — Read `price` and `stock_qty` instead of `base_price`.
5. **Cart** — Always send `variant_id` when adding items.
6. **Checkout** — Unit price always comes from variant.
7. **Wishlist** — Read `price` and `stock_qty` from the Product object.
8. **Coupon validation** — Uses variant price (cheapest variant) instead of `base_price`.
