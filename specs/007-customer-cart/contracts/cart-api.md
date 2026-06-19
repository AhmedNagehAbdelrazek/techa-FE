# API Contracts: Customer Cart

Base URL: `{{base_url}}/api` (via `NEXT_PUBLIC_API_URL` or rewrite)

Authentication: All cart endpoints require Bearer auth token.

---

## Get Cart

Fetches the current user's cart with items, totals, price-changed detection, and applied coupon.

```
GET /api/cart
```

### Headers

| Header | Value | Required |
|--------|-------|----------|
| `Authorization` | `Bearer {{auth_token}}` | Yes |

### Success Response (200)

```json
{
  "id": "cart-uuid",
  "subtotal": 99.98,
  "discount": 0,
  "total": 99.98,
  "coupon": null,
  "items": [
    {
      "id": "item-uuid",
      "product_id": "prod-uuid",
      "product_name": "Product Name",
      "product_slug": "product-name",
      "variant_id": null,
      "variant_label": null,
      "qty": 2,
      "unit_price": 49.99,
      "total_price": 99.98,
      "current_price": 49.99,
      "price_changed": false
    }
  ],
  "version": 1
}
```

---

## Add Item to Cart

Adds a product (with optional variant) to the cart. If the same product+variant exists, increments quantity.

```
POST /api/cart/items
```

### Headers

| Header | Value | Required |
|--------|-------|----------|
| `Authorization` | `Bearer {{auth_token}}` | Yes |
| `Content-Type` | `application/json` | Yes |

### Request Body

```json
{
  "product_id": "98002fe5-4511-45e9-89d9-5f43e9f3bdfd",
  "variant_id": null,
  "qty": 2
}
```

### Success Response (200)

Full cart object (same shape as Get Cart response).

---

## Update Cart Item Quantity

Updates the quantity of a cart item. Stock is re-validated.

```
PUT /api/cart/items/:id
```

### Headers

| Header | Value | Required |
|--------|-------|----------|
| `Authorization` | `Bearer {{auth_token}}` | Yes |
| `Content-Type` | `application/json` | Yes |

### Request Body

```json
{
  "qty": 3
}
```

### Success Response (200)

Full cart object with updated totals and version incremented.

---

## Remove Cart Item

Removes an item from the cart and recalculates totals.

```
DELETE /api/cart/items/:id
```

### Headers

| Header | Value | Required |
|--------|-------|----------|
| `Authorization` | `Bearer {{auth_token}}` | Yes |

### Success Response (200)

Full cart object with item removed and totals recalculated.

---

## Apply Coupon

Applies a coupon code to the cart. Discount is applied to eligible items.

```
POST /api/cart/coupon
```

### Headers

| Header | Value | Required |
|--------|-------|----------|
| `Authorization` | `Bearer {{auth_token}}` | Yes |
| `Content-Type` | `application/json` | Yes |

### Request Body

```json
{
  "code": "SAVE10"
}
```

### Success Response (200)

Full cart object with coupon applied and discount reflected in totals.

```json
{
  "id": "cart-uuid",
  "subtotal": 99.98,
  "discount": 10,
  "total": 89.98,
  "coupon": {
    "id": "coupon-uuid",
    "code": "SAVE10",
    "discount_type": "fixed",
    "discount_value": 10
  },
  "items": [],
  "version": 2
}
```

---

## Remove Coupon

Removes the applied coupon from the cart and resets totals.

```
DELETE /api/cart/coupon
```

### Headers

| Header | Value | Required |
|--------|-------|----------|
| `Authorization` | `Bearer {{auth_token}}` | Yes |

### Success Response (200)

Full cart object with coupon removed and discount reset to zero.
