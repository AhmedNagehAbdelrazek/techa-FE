# Feature Specification: Admin Coupons & Delivery Zones

**Feature Branch**: `017-admin-coupons-delivery-zones`

**Created**: 2026-06-23

**Status**: Draft

**Input**: User description: "Admin CRUD for coupons (data table with code, product, type, value, usage, expiry, status; create/edit Dialog with product combobox) and delivery zones (zone table, expandable row showing shipping rates, Add Zone Dialog, Add Rate Dialog per zone)."

## User Scenarios & Testing

### User Story 1 — Admin Manages Coupons (Priority: P1)

An admin navigates to `/admin/coupons` and sees a paginated data table with columns: code, product (if scoped), type, value, usage (used/max), expiry, status. They click "Add Coupon" to open a Dialog with form fields: code, product (searchable combobox), discount_type (percentage/fixed), discount_value, min_order_amount, max_uses, expires_at (date picker), is_active. They edit an existing coupon via the same Dialog pre-populated. They deactivate a coupon via a deactivate button with AlertDialog confirmation.

**Why this priority**: Coupons are the primary discount mechanism. Without coupon management, the admin cannot create or modify promotional campaigns.

**Independent Test**: An admin can open `/admin/coupons`, create a new coupon, verify it appears in the table, edit its value, deactivate it, and confirm it updates in the table.

**Acceptance Scenarios**:

1. **Given** an admin is on `/admin/coupons`, **When** they click "Add Coupon", fill in the form, and submit, **Then** the new coupon appears in the table with correct data.
2. **Given** a coupon has a `product_id`, **When** the table renders, **Then** the product name is displayed (null shown as "All Products").
3. **Given** an admin edits a coupon's `discount_value` and submits, **When** the page reloads, **Then** the updated value is shown.
4. **Given** an admin deactivates a coupon, **When** they confirm in the AlertDialog, **Then** the coupon's status badge shows "Inactive" and the row remains visible.
5. **Given** an admin searches for a product in the coupon product selector, **When** they type in the combobox, **Then** results are fetched from `/api/admin/products?search=...`.

---

### User Story 2 — Admin Manages Delivery Zones (Priority: P1)

An admin navigates to `/admin/delivery-zones` and sees a table of zones: name, city/region, status. Each row is expandable to reveal shipping rates. They click "Add Zone" to create a zone with name and regions (multi-tag chip input). They click "Add Rate" within a zone row to add a shipping rate (charge, estimated_days_min/max, free_above_amount, min/max order amounts). They edit or deactivate a zone, with a warning that deactivation also deactivates all its rates.

**Why this priority**: Delivery zones and rates directly control shipping configuration. Without this, the store cannot calculate shipping correctly.

**Independent Test**: An admin can open `/admin/delivery-zones`, create a zone, expand it, add a rate, deactivate the zone, and verify the rate is also deactivated.

**Acceptance Scenarios**:

1. **Given** an admin is on `/admin/delivery-zones`, **When** they click "Add Zone", fill in name and regions, and submit, **Then** the zone appears in the table.
2. **Given** an admin expands a zone row, **When** the rates are loaded, **Then** each rate's charge, estimated days, and status are displayed.
3. **Given** an admin clicks "Add Rate" on an expanded zone, **When** they fill in the form and submit, **Then** the new rate appears in the rates list.
4. **Given** an admin deactivates a zone, **When** the AlertDialog warns about rates being deactivated and they confirm, **Then** both the zone and its rates show as inactive.
5. **Given** there are no zones, **When** the page loads, **Then** an empty state is shown with a CTA to create the first zone.

---

### Edge Cases

- Deactivating a zone that has active rates: the frontend must show an AlertDialog warning that all rates will also be deactivated.
- Creating a coupon with a code that already exists: the API returns a validation error; the frontend shows the error on the code field inline.
- Expired coupons: show an "Expired" status badge when `is_active` is true but `expires_at` is in the past. If `is_active` is false, show "Inactive" regardless of expiry (Inactive takes precedence).
- Coupon product selector: if `product_id` is null, show "All Products" in the table.
- Network errors during create/update/delete: show a sonner toast with the error message; keep the Dialog open so the user can retry.

## Requirements

### Functional Requirements

- **FR-001**: System MUST display coupons as a paginated data table with columns: code, product, type, value, usage (used_count / max_uses), expiry date, status badge (Active/Inactive/Expired). Badge precedence: Inactive > Expired > Active — if `is_active` is false, show "Inactive" regardless of `expires_at`; if `is_active` is true but `expires_at` is past, show "Expired".
- **FR-002**: Admin MUST be able to create a coupon with: code, product_id (null for all products, searchable combobox), discount_type (percentage|fixed), discount_value, min_order_amount, max_uses, expires_at (date), is_active.
- **FR-003**: Admin MUST be able to edit any field of an existing coupon via the same form Dialog pre-populated with current values.
- **FR-004**: Admin MUST be able to deactivate a coupon (soft delete) via a deactivate button with AlertDialog confirmation.
- **FR-005**: The product selector in the coupon form MUST be a searchable combobox fetching from `/api/admin/products?search=`.
- **FR-006**: System MUST display delivery zones as a table with columns: name, regions (comma-joined), status badge.
- **FR-007**: Admin MUST be able to create a delivery zone with name and regions (array of strings).
- **FR-008**: Admin MUST be able to edit a zone's name, regions, and active status.
- **FR-009**: Admin MUST be able to deactivate a zone with an AlertDialog warning that all its rates will be deactivated.
- **FR-010**: Each zone row MUST be expandable to show its shipping rates.
- **FR-011**: Admin MUST be able to create a shipping rate within a zone with: charge, estimated_days_min, estimated_days_max, free_above_amount, min_order_amount, max_order_amount.
- **FR-012**: Admin MUST be able to edit a shipping rate's fields.
- **FR-013**: All pages MUST show permission-gated action buttons using `useAdminStore` — hide create buttons if lacking `create`, hide edit buttons if lacking `update`, hide deactivate/delete if lacking `delete`.
- **FR-014**: Each page MUST have a loading skeleton state and an error state with retry.
- **FR-015**: Each page MUST have an empty state when no items exist, with a CTA to create the first item (if the admin has create permission).

### Key Entities

- **Coupon**: A discount code. Has code, optional product scope, discount type (percentage/fixed), value, min order amount, max uses, used count, expiry date, active status.
- **Delivery Zone**: A geographic shipping zone. Has name, regions (array of city/region names), active status, and associated shipping rates.
- **Shipping Rate**: A rate within a delivery zone. Has charge, estimated delivery days range, free shipping threshold, min/max order amount bounds, active status.

### API Endpoints

#### Coupons

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/coupons?page=&limit=` | List paginated coupons |
| POST | `/api/admin/coupons` | Create coupon |
| PUT | `/api/admin/coupons/:id` | Update coupon |
| DELETE | `/api/admin/coupons/:id` | Deactivate coupon (soft delete) |

Coupon shape:
```json
{
  "id": "uuid",
  "product_id": "uuid | null",
  "product": { "id": "uuid", "name": "...", "slug": "..." } | null,
  "code": "SAVE20",
  "discount_type": "percentage",
  "discount_value": 20,
  "min_order_amount": 0,
  "max_uses": 100,
  "used_count": 5,
  "expires_at": "2026-12-31T23:59:59Z",
  "is_active": true
}
```

List response: `{ data: Coupon[], meta: { page, limit, total, totalPages } }`

#### Delivery Zones

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/delivery-zones` | List all zones |
| GET | `/api/admin/delivery-zones/:id` | Get zone with rates |
| POST | `/api/admin/delivery-zones` | Create zone |
| PUT | `/api/admin/delivery-zones/:id` | Update zone |
| DELETE | `/api/admin/delivery-zones/:id` | Deactivate zone + rates |

Zone shape:
```json
{
  "id": "uuid",
  "name": "Cairo",
  "regions": ["Cairo", "Giza", "Helwan"],
  "is_active": true,
  "ShippingRates": [ShippingRate]
}
```

List response: `{ zones: Zone[] }`

#### Shipping Rates

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/delivery-zones/:id/rates` | List rates for zone |
| POST | `/api/admin/delivery-zones/:id/rates` | Create rate |
| PUT | `/api/admin/rates/:id` | Update rate |

Rate shape:
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

List response: `{ rates: ShippingRate[] }`

## Success Criteria

### Measurable Outcomes

- **SC-001**: An admin can complete the full create-edit-deactivate cycle for both coupons and zones in under 5 minutes total.
- **SC-002**: The product combobox in the coupon form returns search results within 2 seconds of typing.
- **SC-003**: 100% of API error responses are displayed to the admin via toast notifications.
- **SC-004**: Empty states and loading skeletons are shown on all pages, covering every data-fetching state.

## Clarifications

### Session 2026-06-23

- Q: Permission granularity for coupons/delivery zones — same granular pattern as categories/brands? → A: Yes, granular (`read`/`create`/`update`/`delete`) using `coupons.*` and `zones.*` convention.
- Q: Rate deactivation — separate endpoint or via zone deactivation? → A: Zone deactivation (DELETE) cascade-deactivates rates. Individual rate deactivation is not needed — rate can be set to inactive via PUT.
- Q: Regions input UX — plain text or multi-tag chip? → A: Multi-tag chip input. Each region is an individual removable chip/tag component.
- Q: Permission key format for delivery zones — `delivery-zones` or shorter? → A: `zones` (short form, matching the single-word pattern of existing keys like `brands`, `orders`, `products`).
- Q: Expired vs Inactive badge precedence when both conditions are true? → A: Inactive takes precedence. If `is_active` is false, show "Inactive" regardless of `expires_at`. Only show "Expired" if `is_active` is true but `expires_at` is past.

## Assumptions

- Admin permissions use granular `resource.action` convention: `coupons.read`, `coupons.create`, `coupons.update`, `coupons.delete` and `zones.read`, `zones.create`, `zones.update`, `zones.delete`.
- The coupons list endpoint returns paginated data matching the `{ data: [...], meta: {...} }` pattern.
- The delivery zones list endpoint returns an array (not paginated) since there are typically few zones.
- Coupon deactivation is soft delete (is_active = false), not hard delete.
- Zone deactivation is soft delete (is_active = false) and cascade-deactivates all associated shipping rates.
- The product combobox in coupon form uses the same admin products list endpoint with a `search` query parameter.
- Date fields (`expires_at`) use ISO 8601 string format.
- The `Regions` field in the zone form is a multi-tag chip input where each region is added as a discrete chip/tag. The submitted value is an array of strings.
