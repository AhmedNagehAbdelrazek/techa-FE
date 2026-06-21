# API Contracts: Customer Account & Addresses

## Overview

All API calls use the existing `Request.ts` client (axios-based, `withCredentials: true`, auth interceptor injects Bearer token). All endpoints require customer auth token unless marked as public.

## Profile

### GET /api/auth/me

Fetch authenticated customer's profile.

**Auth**: Required (Bearer token)

**Response** (200):
```json
{
  "id": "uuid",
  "email": "ahmed@example.com",
  "name": "Ahmed Ali",
  "role": "customer",
  "phone": "+966501234567",
  "avatar_url": null,
  "is_verified": true,
  "created_at": "2026-01-15T10:30:00.000Z"
}
```

**Frontend**: `getMe()` in `src/lib/api/auth.ts`

### PATCH /api/auth/me

Update profile fields. All fields optional.

**Auth**: Required (Bearer token)

**Request**:
```json
{
  "name": "Ahmed Ali Updated",
  "phone": "+966501234567",
  "avatar_url": "https://cdn.example.com/avatar.jpg"
}
```

**Response** (200):
```json
{
  "message": "Profile updated successfully.",
  "user": {
    "id": "uuid",
    "email": "ahmed@example.com",
    "name": "Ahmed Ali Updated",
    "role": "customer",
    "phone": "+966501234567",
    "avatar_url": "https://cdn.example.com/avatar.jpg"
  }
}
```

**Frontend**: `updateMe(payload)` in `src/lib/api/auth.ts`

## Addresses

### GET /api/addresses

List authenticated customer's saved addresses.

**Auth**: Required (Bearer token)

**Response** (200):
```json
{
  "data": [
    {
      "id": "addr-uuid",
      "full_name": "John Doe",
      "phone": "+201234567890",
      "street": "123 Main St",
      "city": "Cairo",
      "zone_id": "zone-uuid",
      "label": "Home",
      "building": "Building 5",
      "apartment": "Apt 3B",
      "landmark": "Near mosque",
      "notes": "Leave with guard",
      "is_default": true
    }
  ]
}
```

**Frontend**: `listAddresses()` in `src/lib/api/addresses.ts`

### POST /api/addresses

Create a new address.

**Auth**: Required (Bearer token)

**Request**:
```json
{
  "full_name": "John Doe",
  "phone": "+201234567890",
  "street": "123 Main St",
  "city": "Cairo",
  "zone_id": "zone-uuid",
  "label": "Home",
  "building": "Building 5",
  "apartment": "Apt 3B",
  "landmark": "Near mosque",
  "notes": "Leave with guard"
}
```

**Response** (201):
```json
{
  "data": {
    "id": "addr-uuid",
    "full_name": "John Doe",
    "phone": "+201234567890",
    "street": "123 Main St",
    "city": "Cairo",
    "zone_id": "zone-uuid",
    "label": "Home",
    "building": "Building 5",
    "apartment": "Apt 3B",
    "landmark": "Near mosque",
    "notes": "Leave with guard",
    "is_default": true
  }
}
```

**Frontend**: `createAddress(data)` in `src/lib/api/addresses.ts`

### PUT /api/addresses/:id

Update an existing address. All fields optional (partial update).

**Auth**: Required (Bearer token)

**Request**:
```json
{
  "full_name": "Updated Name",
  "building": "Tower A"
}
```

**Response** (200):
```json
{
  "data": {
    "id": "addr-uuid",
    "full_name": "Updated Name",
    "phone": "+201234567890",
    "street": "123 Main St",
    "city": "Cairo",
    "zone_id": "zone-uuid",
    "label": "Home",
    "building": "Tower A",
    "apartment": "Apt 3B",
    "landmark": "Near mosque",
    "notes": "Leave with guard",
    "is_default": true
  }
}
```

**Frontend**: `updateAddress(id, data)` in `src/lib/api/addresses.ts`

### PUT /api/addresses/:id/default

Set an address as the default delivery address. The previous default loses its default status.

**Auth**: Required (Bearer token)

**Response** (200):
```json
{
  "message": "Default address updated successfully"
}
```

**Frontend**: `setDefaultAddress(id)` in `src/lib/api/addresses.ts`

### DELETE /api/addresses/:id

Delete an address.

**Auth**: Required (Bearer token)

**Response** (200):
```json
{
  "message": "Address deleted successfully"
}
```

**Frontend**: `deleteAddress(id)` in `src/lib/api/addresses.ts`

## Delivery Zones (Public)

### GET /api/public/delivery-zones

List active delivery zones. No auth required.

**Auth**: None (public)

**Response** (200):
```json
{
  "zones": [
    {
      "id": "zone-uuid",
      "name": "Cairo",
      "regions": ["Cairo", "Giza", "Helwan"]
    }
  ]
}
```

**Frontend**: `getDeliveryZones()` in `src/lib/api/addresses.ts`

## File Upload

### POST /api/upload

Upload a file (JPEG, PNG, WebP, GIF; max 20MB). Returns a URL.

**Auth**: Required (Bearer token)

**Request**: `multipart/form-data` with `file` field

**Response** (200):
```json
{
  "url": "https://cdn.example.com/uploaded-file.webp",
  "filename": "techa/filename",
  "cached": true
}
```

**Frontend**: `uploadFile(file)` in `src/lib/api/payments.ts`
