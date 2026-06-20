# API Contracts: Customer Checkout

Base URL: `{{base_url}}/api` (via `NEXT_PUBLIC_API_URL` or rewrite)

Authentication: All checkout endpoints require Bearer auth token unless marked as public.

---

## Addresses

### List Saved Addresses

```
GET /api/addresses
```

**Headers**: `Authorization: Bearer {{auth_token}}`

**Success Response (200)**:
```json
[
  {
    "id": "addr-uuid",
    "full_name": "Ahmed Ali",
    "phone": "01000000000",
    "street": "12 Nile Street",
    "city": "Cairo",
    "zone_id": "zone-uuid",
    "label": "Home",
    "building": "Building 5",
    "apartment": "3A",
    "landmark": "Near Tahrir Square",
    "notes": "Ring the bell twice",
    "is_default": true
  }
]
```

---

### Create Address

```
POST /api/addresses
```

**Headers**: `Authorization: Bearer {{auth_token}}`, `Content-Type: application/json`

**Request Body**:
```json
{
  "full_name": "Ahmed Ali",
  "phone": "01000000000",
  "street": "12 Nile Street",
  "city": "Cairo",
  "zone_id": "zone-uuid",
  "label": "Home",
  "building": "Building 5",
  "apartment": "3A",
  "landmark": "Near Tahrir Square",
  "notes": "Ring the bell twice"
}
```

**Success Response (201)**: The created address object (same shape as list response).

---

### Update Address

```
PUT /api/addresses/:id
```

**Headers**: `Authorization: Bearer {{auth_token}}`, `Content-Type: application/json`

**Request Body**: Partial address fields (same shape as create, all optional).

**Success Response (200)**: The updated address object.

---

### Set Default Address

```
PATCH /api/addresses/:id/set-default
```

**Headers**: `Authorization: Bearer {{auth_token}}`

**Success Response (200)**: The updated address object with `is_default: true`.

---

### Delete Address

```
DELETE /api/addresses/:id
```

**Headers**: `Authorization: Bearer {{auth_token}}`

**Success Response (204)**: No content.

---

## Delivery Zones (Public)

### Get Delivery Zones

```
GET /api/public/delivery-zones
```

**Headers**: None (public endpoint)

**Success Response (200)**:
```json
[
  {
    "id": "zone-uuid",
    "name": "Cairo",
    "regions": ["Nasr City", "Heliopolis", "Maadi"]
  }
]
```

---

## Shipping

### Get Shipping Rate

```
GET /api/shipping/rate?address_id=addr-uuid&order_total=250.00
```

**Headers**: `Authorization: Bearer {{auth_token}}`

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `address_id` | `string` (UUID) | Yes | The selected address ID |
| `order_total` | `number` | Yes | Current cart total for rate calculation |

**Success Response (200)**:
```json
{
  "zone_id": "zone-uuid",
  "zone_name": "Cairo",
  "rate_id": "rate-uuid",
  "charge": 35.00,
  "estimated_days_min": 1,
  "estimated_days_max": 3,
  "is_free": false
}
```

---

## Payment Methods

### Get Payment Methods

```
GET /api/payments/methods
```

**Headers**: None (public endpoint — receiving account info is public)

**Success Response (200)**:
```json
{
  "cash_on_delivery": {
    "enabled": true
  },
  "instapay": {
    "enabled": true,
    "handle": "@techa"
  },
  "vodafone_cash": {
    "enabled": true,
    "number": "01000000000"
  }
}
```

---

## Orders

### Place Order

```
POST /api/orders
```

**Headers**: `Authorization: Bearer {{auth_token}}`, `Content-Type: application/json`

**Request Body**:
```json
{
  "address_id": "addr-uuid",
  "payment_method": "vodafone_cash",
  "notes": "Leave at the door"
}
```

**Success Response (201)**:
```json
{
  "id": "order-uuid",
  "order_number": "ORD-20260620-001",
  "status": "pending",
  "payment_method": "vodafone_cash",
  "payment_status": "pending",
  "subtotal": 250.00,
  "discount": 0,
  "shipping_charge": 35.00,
  "total": 285.00,
  "coupon": null,
  "shipping_address": {
    "full_name": "Ahmed Ali",
    "phone": "01000000000",
    "street": "12 Nile Street",
    "city": "Cairo"
  },
  "notes": "Leave at the door",
  "items": [
    {
      "product_name": "Product Name",
      "variant_label": null,
      "qty": 2,
      "unit_price": 125.00,
      "line_total": 250.00
    }
  ],
  "status_history": [
    {
      "status": "pending",
      "timestamp": "2026-06-20T15:00:00Z"
    }
  ],
  "created_at": "2026-06-20T15:00:00Z",
  "updated_at": "2026-06-20T15:00:00Z"
}
```

---

### Get Order

```
GET /api/orders/:id
```

**Headers**: `Authorization: Bearer {{auth_token}}`

**Success Response (200)**: Full order object (same shape as Place Order response).

---

### Get Orders List

```
GET /api/orders
```

**Headers**: `Authorization: Bearer {{auth_token}}`

**Success Response (200)**: Array of order objects (summarized).

---

### Cancel Order

```
POST /api/orders/:id/cancel
```

**Headers**: `Authorization: Bearer {{auth_token}}`

**Success Response (200)**: Updated order object with status changed to `cancelled`.

---

## File Upload

### Upload File

```
POST /api/upload
```

**Headers**: `Authorization: Bearer {{auth_token}}`, `Content-Type: multipart/form-data`

**Request Body**: Form-data with `file` field containing the image.

**Success Response (200)**:
```json
{
  "url": "https://storage.example.com/uploads/screenshot-123.jpg"
}
```

---

## Payment Proof

### Submit Payment Proof

```
POST /api/payments/submit-proof
```

**Headers**: `Authorization: Bearer {{auth_token}}`, `Content-Type: application/json`

**Request Body**:
```json
{
  "order_id": "order-uuid",
  "proof_reference": "TXN123456",
  "proof_screenshot_url": "https://storage.example.com/uploads/screenshot-123.jpg"
}
```

**Success Response (200)**:
```json
{
  "status": "submitted",
  "message": "Payment proof submitted successfully. Pending verification."
}
```
