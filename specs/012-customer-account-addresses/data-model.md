# Data Model: Customer Account & Addresses

## Existing Types (already in codebase)

### Address (src/lib/types/order.ts)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` (UUID) | ✅ | Unique identifier |
| `full_name` | `string` | ✅ | Recipient full name |
| `phone` | `string` | ✅ | Recipient phone number |
| `street` | `string` | ✅ | Street address |
| `city` | `string` | ✅ | City name |
| `zone_id` | `string` (UUID) | ✅ | Delivery zone reference |
| `label` | `string` | ❌ | Address label (e.g. "Home", "Work") |
| `building` | `string` | ❌ | Building name/number |
| `apartment` | `string` | ❌ | Apartment/unit number |
| `landmark` | `string` | ❌ | Nearby landmark |
| `notes` | `string` | ❌ | Delivery instructions |
| `is_default` | `boolean` | ✅ | Whether this is the default address |

### DeliveryZone (src/lib/types/order.ts)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` (UUID) | ✅ | Unique identifier |
| `name` | `string` | ✅ | Zone display name |
| `regions` | `string[]` | ✅ | Cities/regions in this zone |

### User (src/lib/types/auth.ts)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` (UUID) | ✅ | Unique identifier |
| `email` | `string` | ✅ | Email address |
| `name` | `string` | ✅ | Full name |
| `role` | `string` | ✅ | User role |
| `phone` | `string` | ✅ | Phone number |
| `avatarUrl` | `string` (URL) \| `null` | ❌ | Avatar image URL |
| `isVerified` | `boolean` | ❌ | Email verified flag |
| `createdAt` | `string` (ISO 8601) | ❌ | Account creation timestamp |

### UpdateProfilePayload (src/lib/types/auth.ts)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | `string` | ❌ | Updated full name |
| `phone` | `string` | ❌ | Updated phone number |
| `avatar_url` | `string` (URL) | ❌ | Updated avatar URL |

### CreateAddressRequest (src/lib/types/order.ts)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `full_name` | `string` | ✅ | Recipient name |
| `phone` | `string` | ✅ | Phone number |
| `street` | `string` | ✅ | Street address |
| `city` | `string` | ✅ | City |
| `zone_id` | `string` (UUID) | ✅ | Delivery zone ID |
| `label` | `string` | ❌ | Address label |
| `building` | `string` | ❌ | Building |
| `apartment` | `string` | ❌ | Apartment |
| `landmark` | `string` | ❌ | Landmark |
| `notes` | `string` | ❌ | Notes |

### UpdateAddressRequest (src/lib/types/order.ts)

Same fields as `CreateAddressRequest`, all optional (partial update).

## Upload Response (src/lib/types/order.ts)

| Field | Type | Description |
|-------|------|-------------|
| `url` | `string` | Public URL of uploaded file |
| `filename` | `string` | Uploaded filename |
| `cached` | `boolean` | Whether result was cached |

## State Transitions

### Address Lifecycle

```
[address created] ──┬──→ [edited] ──→ [updated]
                    ├──→ [set as default] ──→ previous default becomes non-default
                    └──→ [deleted] ──→ removed from list
```

- Addresses are independent — no cascade delete implications
- Only one address can be `is_default: true` at a time
- Setting a new default implicitly removes the default from the previous default address

### Avatar Lifecycle

```
[file selected] ──→ [upload to /api/upload] ──→ [URL returned] ──→ [PATCH /api/auth/me] ──→ [save to auth store]
```

## Validation Rules

- `full_name`: 2-100 characters, required
- `phone`: Must be a valid phone format, required
- `zone_id`: Must reference an existing active delivery zone
- `label`: Max 50 characters (optional)
- `building`, `apartment`, `landmark`, `notes`: Max 255 characters each (optional)
- Address limit: Maximum 10 addresses per customer (enforced client-side)
- Avatar file: Max 20MB, accepted formats: JPEG, PNG, WebP, GIF (enforced by backend on `/api/upload`)
