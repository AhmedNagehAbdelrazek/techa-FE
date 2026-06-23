# Delivery Zones & Rates API Contract

## Base URL

All endpoints are prefixed with `/api/admin`.

## Authentication

All endpoints require `Authorization: Bearer {{admin_token}}` header.

## Endpoints

### List All Zones

```
GET /api/admin/delivery-zones
```

**Response (200):**
```json
{
  "zones": [
    {
      "id": "uuid",
      "name": "Cairo",
      "regions": ["Cairo", "Giza", "Helwan"],
      "is_active": true
    }
  ]
}
```

### Get Zone by ID

```
GET /api/admin/delivery-zones/:id
```

**Response (200):**
```json
{
  "id": "uuid",
  "name": "Cairo",
  "regions": ["Cairo", "Giza", "Helwan"],
  "is_active": true,
  "ShippingRates": [
    {
      "id": "rate-uuid",
      "charge": 65,
      "estimated_days_min": 2,
      "estimated_days_max": 5,
      "free_above_amount": null,
      "is_active": true
    }
  ]
}
```

### Create Zone

```
POST /api/admin/delivery-zones
```

**Request Body:**
```json
{
  "name": "Cairo",
  "regions": ["Cairo", "Giza", "Helwan"]
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "name": "Cairo",
  "regions": ["Cairo", "Giza", "Helwan"],
  "is_active": true
}
```

### Update Zone

```
PUT /api/admin/delivery-zones/:id
```

**Request Body** (partial update):
```json
{
  "name": "Cairo Updated",
  "regions": ["Cairo", "Giza", "Helwan", "New Cairo"],
  "is_active": true
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "name": "Cairo Updated",
  "regions": ["Cairo", "Giza", "Helwan", "New Cairo"],
  "is_active": true
}
```

### Deactivate Zone

```
DELETE /api/admin/delivery-zones/:id
```

Soft-deletes a zone and deactivates all its shipping rates.

**Response (200):**
```json
{
  "message": "Delivery zone deactivated successfully."
}
```

---

### List Rates for Zone

```
GET /api/admin/delivery-zones/:id/rates
```

**Response (200):**
```json
{
  "rates": [
    {
      "id": "rate-uuid",
      "charge": 65,
      "estimated_days_min": 2,
      "estimated_days_max": 5,
      "free_above_amount": null,
      "min_order_amount": 0,
      "max_order_amount": null,
      "is_active": true
    }
  ]
}
```

### Create Rate

```
POST /api/admin/delivery-zones/:id/rates
```

**Request Body:**
```json
{
  "charge": 65.00,
  "estimated_days_min": 2,
  "estimated_days_max": 5,
  "free_above_amount": null,
  "min_order_amount": 0,
  "max_order_amount": null
}
```

**Response (201):**
```json
{
  "id": "rate-uuid",
  "delivery_zone_id": "zone-uuid",
  "charge": 65,
  "estimated_days_min": 2,
  "estimated_days_max": 5,
  "free_above_amount": null,
  "min_order_amount": 0,
  "max_order_amount": null,
  "is_active": true
}
```

### Update Rate

```
PUT /api/admin/rates/:id
```

**Request Body** (partial update):
```json
{
  "charge": 70.00,
  "estimated_days_min": 2,
  "free_above_amount": 500.00,
  "is_active": true
}
```

**Response (200):**
```json
{
  "id": "rate-uuid",
  "delivery_zone_id": "zone-uuid",
  "charge": 70,
  "estimated_days_min": 2,
  "estimated_days_max": 5,
  "free_above_amount": 500,
  "min_order_amount": 0,
  "max_order_amount": null,
  "is_active": true
}
```

## Error Responses

### Validation Error (422)
```json
{
  "message": "Validation failed",
  "errors": {
    "name": ["Zone name is required"]
  }
}
```

### Not Found (404)
```json
{
  "message": "Delivery zone not found"
}
```
