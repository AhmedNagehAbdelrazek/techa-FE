# Data Model: Customer Checkout

## Entities

### Address

A customer's shipping address, saved server-side and fetched during checkout.

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| `id` | `string` (UUID) | Address identifier | Yes |
| `full_name` | `string` | Recipient full name | Yes |
| `phone` | `string` | Recipient phone number | Yes |
| `street` | `string` | Street address | Yes |
| `city` | `string` | City name | Yes |
| `zone_id` | `string` (UUID) | Delivery zone identifier | Yes |
| `label` | `string` | Address label (e.g., "Home", "Work") | No |
| `building` | `string` | Building name/number | No |
| `apartment` | `string` | Apartment number | No |
| `landmark` | `string` | Nearby landmark | No |
| `notes` | `string` | Delivery notes | No |
| `is_default` | `boolean` | Whether this is the default address | Yes |

**Validation**:
- `full_name`, `phone`, `street`, `city`, `zone_id` are required
- `phone` should be a valid Egyptian phone number (client-side format validation)
- `zone_id` must reference an existing delivery zone

### DeliveryZone

A shipping zone for address selection (used in the zone dropdown).

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` (UUID) | Zone identifier |
| `name` | `string` | Zone display name |
| `regions` | `string[]` | Region names within the zone |

### ShippingRate

The calculated shipping rate for a selected address.

| Field | Type | Description |
|-------|------|-------------|
| `zone_id` | `string` (UUID) | Delivery zone identifier |
| `zone_name` | `string` | Zone display name |
| `rate_id` | `string` | Rate identifier |
| `charge` | `number` | Shipping charge amount |
| `estimated_days_min` | `number` | Minimum estimated delivery days |
| `estimated_days_max` | `number` | Maximum estimated delivery days |
| `is_free` | `boolean` | Whether shipping is free |

**Validation**:
- `charge` is `0` when `is_free` is `true`
- `estimated_days_min` <= `estimated_days_max`

### Order

A placed order, returned by `POST /api/orders` and `GET /api/orders/:id`.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` (UUID) | Order identifier |
| `order_number` | `string` | Human-readable order number |
| `status` | `string` | Order status (e.g., "pending", "confirmed", "shipped", "delivered", "cancelled") |
| `payment_method` | `"cash_on_delivery" \| "instapay" \| "vodafone_cash"` | Selected payment method |
| `payment_status` | `string` | Payment status (e.g., "pending", "submitted", "verified", "failed") |
| `subtotal` | `number` | Cart subtotal before discount and shipping |
| `discount` | `number` | Discount amount from coupon |
| `shipping_charge` | `number` | Shipping charge |
| `total` | `number` | Grand total (subtotal - discount + shipping_charge) |
| `coupon` | `object \| null` | Applied coupon details |
| `shipping_address` | `Address` | The shipping address snapshot |
| `notes` | `string \| null` | Optional delivery notes |
| `items` | `object[]` | Order line items (snapshot from cart) |
| `status_history` | `object[]` | Status change history |
| `created_at` | `string` (ISO 8601) | Order creation timestamp |
| `updated_at` | `string` (ISO 8601) | Last update timestamp |

### PaymentMethodInfo

Receiving account information for manual payment methods.

| Field | Type | Description |
|-------|------|-------------|
| `instapay` | `{ handle: string } \| null` | Instapay handle (e.g., "@techa") |
| `vodafone_cash` | `{ number: string } \| null` | Vodafone Cash number (e.g., "01000000000") |

## Request/Response Types

### CreateAddressRequest

```typescript
interface CreateAddressRequest {
  full_name: string;
  phone: string;
  street: string;
  city: string;
  zone_id: string;
  label?: string;
  building?: string;
  apartment?: string;
  landmark?: string;
  notes?: string;
}
```

### UpdateAddressRequest

```typescript
interface UpdateAddressRequest {
  full_name?: string;
  phone?: string;
  street?: string;
  city?: string;
  zone_id?: string;
  label?: string;
  building?: string;
  apartment?: string;
  landmark?: string;
  notes?: string;
  is_default?: boolean;
}
```

### PlaceOrderRequest

```typescript
interface PlaceOrderRequest {
  address_id: string;
  payment_method: "cash_on_delivery" | "instapay" | "vodafone_cash";
  notes?: string;
}
```

### SubmitProofRequest

```typescript
interface SubmitProofRequest {
  order_id: string;
  proof_reference: string;
  proof_screenshot_url: string;
}
```

### ShippingRateResponse

```typescript
interface ShippingRateResponse {
  zone_id: string;
  zone_name: string;
  rate_id: string;
  charge: number;
  estimated_days_min: number;
  estimated_days_max: number;
  is_free: boolean;
}
```

### PaymentMethodsResponse

```typescript
interface PaymentMethodsResponse {
  cash_on_delivery: { enabled: boolean };
  instapay: { enabled: boolean; handle: string };
  vodafone_cash: { enabled: boolean; number: string };
}
```

## State Transitions

### Checkout Step Flow

```
[Empty Cart] --redirect--> [/cart]
[Unauthenticated] --redirect--> [/login?next=/checkout]

Step 1: Address Selection
  [No saved addresses] --> [Inline create form]
  [Saved addresses] --> [Radio list with default pre-selected]
  [Select address] --> [Enable "Continue"]
  [Fill inline form] --> [POST /api/addresses] --> [Select new address] --> [Enable "Continue"]

Step 2: Review + Payment
  [Enter step 2] --> [GET /api/shipping/rate?address_id=&order_total=]
  [Rate loading] --> [Skeleton/spinner]
  [Rate loaded] --> [Display charge + estimated days]
  [Rate error] --> [Show error, disable Place Order]
  [Select payment method] --> [Highlight method, show receiving info for manual]
  [Click "Place Order"] --> [Spinner on button, POST /api/orders]
  [Order success] --> [cartStore.reset(), redirect to /orders/:id/confirmation]
  [Order failure] --> [Error toast, stay on step 2]

Confirmation Page:
  [COD order] --> [Show "Pay on delivery" message]
  [Instapay/Vodafone Cash] --> [Show proof submission form]
  [Submit proof] --> [POST /api/payments/submit-proof]
  [Proof success] --> [Show success message "Payment submitted — pending verification"]
  [Proof failure] --> [Error toast, allow retry]
```

### Order Status Lifecycle

```
[Pending] --confirmed--> [Confirmed]
[Pending] --cancelled--> [Cancelled]
[Confirmed] --shipped--> [Shipped]
[Shipped] --delivered--> [Delivered]
```

### Payment Status Lifecycle

```
[Pending] --proof submitted--> [Submitted]
[Submitted] --verified--> [Verified]
[Submitted] --failed--> [Failed]
```

## Checkout Component State Interface

```typescript
interface CheckoutState {
  step: 1 | 2;
  addresses: Address[];
  selectedAddressId: string | null;
  isAddingNewAddress: boolean;
  shippingRate: ShippingRateResponse | null;
  shippingRateLoading: boolean;
  shippingRateError: string | null;
  paymentMethod: "cash_on_delivery" | "instapay" | "vodafone_cash" | null;
  paymentMethods: PaymentMethodsResponse | null;
  notes: string;
  isPlacingOrder: boolean;
}
```
