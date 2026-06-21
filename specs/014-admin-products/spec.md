# Feature Specification: Admin Panel — Products

**Feature Branch**: `014-admin-products`

**Created**: 2026-06-21

**Status**: Draft

**Input**: User description: "Phase 14 — Admin Panel: Products from the frontend-spec.md, using the endpoint references from the Postman collection"

## Clarifications

### Session 2026-06-21

- Q: What is explicitly out-of-scope for this phase? → A: CSV import/export, product duplication, and bulk edit (price/stock via spreadsheet) are excluded and deferred to a later phase.
- Q: How should admin permissions map to product management UI elements? → A: `products.create` → show Add Product; `products.read` → access list/page; `products.update` → show Edit; `products.delete` → show Deactivate. Full permissions schema saved in spec's Appendix.
- Q: What client-side validation rules should the product form enforce? → A: Minimal client-side validation: name required (non-empty), base_price required (positive number), category required. Slug auto-generated. SKU optional at create. Discount percent 0-100. All other fields optional. Let backend be the source of truth.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse and Manage Products List (Priority: P1)

An admin lands on `/admin/products` and sees a searchable, filterable, paginated data table of all products. The admin can search by product name, filter by category, brand, and status (active/inactive). Each row shows the product thumbnail, name, category, brand, price, stock quantity, and active status.

**Why this priority**: The product list is the primary entry point for all product management operations. Without it, admins cannot locate or manage products.

**Independent Test**: Can be fully tested by navigating to `/admin/products`, verifying the table renders with products, applying filters, and confirming pagination works.

**Acceptance Scenarios**:

1. **Given** an authenticated admin is on the products page, **When** the page loads, **Then** a paginated table displays with columns: image thumbnail, name, category, brand, price, stock quantity, active status, and action buttons
2. **Given** the products table is displayed, **When** the admin types in the search box, **Then** results filter in real-time to show only products whose name matches the search term
3. **Given** the products table is displayed, **When** the admin selects a category filter, **Then** only products in that category are shown
4. **Given** the admin has filtered the product list, **When** they clear a filter, **Then** the list updates to remove that filter's constraint
5. **Given** there are more products than the page limit, **When** the admin clicks a page number, **Then** the next page of results loads
6. **Given** the admin selects one or more products via checkboxes, **When** they click "Activate" or "Deactivate" bulk action, **Then** all selected products have their status updated accordingly with a success toast

---

### User Story 2 - Create a New Product (Priority: P1)

An admin clicks "Add Product" and is taken to a multi-tab form. The admin fills in basic info (name, description, category, brand, price, discount), adds about points and attributes, uploads images, assigns tags, and configures variants — all before clicking "Save".

**Why this priority**: Creating products is the core value of the feature — without it, the marketplace cannot list new items.

**Independent Test**: Can be fully tested by filling the form and submitting, then verifying the new product appears in the product list.

**Acceptance Scenarios**:

1. **Given** an admin is on the new product form, **When** they enter a product name, **Then** the slug field auto-populates from the name but remains manually editable
2. **Given** the admin is filling the "About & Attributes" tab, **When** they add an about point and click "Add", **Then** a new about point input appears in the list and the remove button works
3. **Given** the admin is on the "Images" tab, **When** they select an image file, **Then** a preview thumbnail appears with a remove button and a "Set as Primary" indicator
4. **Given** the admin is on the "Variants" tab, **When** they add option key-value pairs (e.g., Color: Red, Size: XL), **Then** new variant option rows are dynamically added
5. **Given** the admin has filled all required fields (name, category, base_price), **When** they click "Save", **Then** the product is created, a success toast appears, and they are redirected to the product list
6. **Given** the admin has unsaved changes, **When** they try to navigate away, **Then** a confirmation dialog warns them about unsaved changes

---

### User Story 3 - Edit an Existing Product (Priority: P2)

An admin clicks "Edit" on a product in the list and is taken to the same multi-tab form pre-populated with the product's existing data. The admin can modify any tab and save changes, or delete the product.

**Why this priority**: Editing is almost as important as creating — products need regular updates to prices, stock, descriptions, and images.

**Independent Test**: Can be tested by navigating to a product's edit page, modifying a field, saving, and verifying the change appears in the product list.

**Acceptance Scenarios**:

1. **Given** an admin clicks "Edit" on a product, **When** the edit form loads, **Then** all tabs show the existing data: basic info fields, attributes, about points, images (with previews), tags, and variants
2. **Given** the admin edits the base price in Basic Info tab, **When** they save, **Then** the product's price updates and the product list reflects the change
3. **Given** the admin removes an existing image and adds a new one, **When** they save, **Then** the removed image is deleted and the new image is associated with the product
4. **Given** the admin adds a new variant, updates an existing variant's price, and removes a variant via `_destroy`, **When** they save, **Then** all three variant changes are persisted correctly
5. **Given** the admin clicks "Deactivate" on a product, **When** they confirm in the dialog, **Then** the product's status changes to inactive and it is marked accordingly in the list

### Edge Cases

- What happens when an admin tries to save a product without a name? Client-side validation prevents submission and shows an inline error on the name field.
- How does the system handle duplicate slugs? The slug field is auto-generated but manually editable; if a duplicate slug is submitted, the API returns an error displayed as a toast.
- How are variants with the same options handled? The variant builder must detect duplicate option combinations and show an inline warning before submission.
- What happens if an image upload fails during create/edit? The form should allow retry of individual image uploads without losing other form data.
- How does the system handle optimistic locking (version field) on variants? If a variant's version has changed since the form loaded, the API returns a conflict error and the admin must reload and reapply changes.
- What happens when bulk deactivate includes already-inactive products? The action succeeds silently for those items; the toast reports how many were actually changed.
- How does the form behave when the session token expires mid-edit? The next API call fails with 401, triggering a redirect to the admin login page with a session expired message.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a paginated product data table with columns: thumbnail image, product name, category, brand, price (with discount), stock quantity (sum of variant stock), active status
- **FR-002**: Admin MUST be able to filter products by category, brand, and active status using dropdown selectors
- **FR-003**: Admin MUST be able to search products by name with results updating as they type
- **FR-004**: Admin MUST be able to select multiple products via checkboxes and perform bulk activate/deactivate actions
- **FR-005**: Admin MUST be able to create a new product via a multi-tab form with these tabs: Basic Info, About & Attributes, Images, Tags, Variants
- **FR-006**: Product slug MUST auto-populate from the product name using lowercase-dashed conversion but remain manually editable
- **FR-007**: Admin MUST be able to add, edit, and remove "about points" as a dynamic list of text inputs
- **FR-008**: Admin MUST be able to add, edit, and remove product attributes grouped by section (Details, Specs) as key-value pairs
- **FR-009**: Admin MUST be able to upload multiple images with preview thumbnails, mark one as primary, and reorder them
- **FR-010**: Admin MUST be able to select existing tags or create new tags inline via a multi-select combobox
- **FR-011**: Admin MUST be able to add variants with option key-value pairs (e.g., Color: Red, Size: XL), each with its own SKU, price, discount percent, stock quantity, and images
- **FR-012**: Admin MUST be able to edit an existing product using the same multi-tab form, pre-populated with the product's current data
- **FR-013**: Admin MUST be able to soft-delete (deactivate) a product via a delete button with confirmation dialog
- **FR-014**: System MUST warn the admin about unsaved changes when they try to navigate away from a form with unsaved edits
- **FR-015**: System MUST show loading skeletons for all data tables and forms while data is being fetched
- **FR-016**: System MUST show error states with retry capability when API calls fail
- **FR-017**: System MUST paginate the product list with page size of 20 by default
- **FR-018**: Admin MUST be able to view a single product's details (read-only view or the edit form pre-populated)
- **FR-019**: System MUST show an empty state when no products match the current filters with a "Clear Filters" button
- **FR-020**: System MUST conditionally show/hide product management UI elements based on the admin's permissions as defined in the Admin Permissions Reference (hide Add Product if no `products.create`, hide Edit if no `products.update`, hide Deactivate if no `products.delete`)

### Key Entities *(include if feature involves data)*

- **Product**: The core entity representing an item for sale. Has a name, slug, description, base price, discount percentage, category, brand, active/featured status, and optimistic locking version.
- **ProductVariant**: A specific version of a product defined by option combinations (e.g., Color: Red, Size: XL). Has its own SKU, price (which can override the base price), discount, stock quantity, and images. Uses optimistic locking via a version field.
- **ProductImage**: An image associated with a product or variant. Has a URL, alt text, sort order, and a primary flag (one image per product is primary).
- **ProductAttribute**: A key-value metadata entry grouped by section ("details" or "specs"). Has a label, value, and sort order.
- **Category**: A taxonomy entity that products are assigned to. Has a tree structure with parent/child relationships.
- **Brand**: A manufacturer or brand entity that products may be associated with.
- **Tag**: A lightweight label that can be assigned to products for additional classification.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An admin can create a new product with all data (basic info, attributes, images, tags, variants) in under 5 minutes
- **SC-002**: An admin can find any product in the catalog within 3 clicks or 10 seconds using search and filters
- **SC-003**: The product list page loads and renders within 2 seconds on a standard internet connection
- **SC-004**: Bulk actions (activate/deactivate) on multiple selected products complete within 5 seconds
- **SC-005**: The product form warns the user about unsaved changes within 1 second of attempting navigation
- **SC-006**: All product management operations (list, create, edit, delete) are fully functional on mobile viewport width of 375px

### Out of Scope

- CSV import/export of products — deferred to a future phase
- Product duplication (clone existing product) — deferred to a future phase
- Bulk edit of price/stock via spreadsheet — deferred to a future phase
- Product filtering by SKU, creation date, or price range in the list view
- Duplicate detection (identifying similar products by name or SKU)
- Product review management (handled in a separate admin phase)

### Admin Permissions Reference

Product management UI elements must be gated by the following permission checks:

| UI Element              | Required Permission | Behavior When Missing                         |
| ----------------------- | ------------------- | --------------------------------------------- |
| Product list page       | `products.read`     | Redirect to dashboard with access denied      |
| Add Product button      | `products.create`   | Button hidden from list and sidebar           |
| Edit button (per row)   | `products.update`   | Button hidden; row is read-only               |
| Deactivate button       | `products.delete`   | Button hidden                                 |
| Bulk activate/deactivate| `products.update`   | Checkbox selection hidden; bulk bar absent    |

Full system-wide permissions schema (applicable to all admin phases):

```
products:    create, read, update, delete
orders:      create, read, update, delete
media:       create, read, update, delete
coupons:     create, read, update, delete
brands:      create, read, update, delete
categories:  create, read, update, delete
suppliers:   create, read, update, delete
tags:        create, read, update, delete
reviews:     create, read, update, delete
expenses:    create, read, update, delete
content:     create, read, update, delete
settings:    create, read, update, delete
shipping:    create, read, update, delete
finance:     create, read, update, delete
dashboard:   create, read, update, delete
audit-logs:  create, read, update, delete
admins:      create, read, update, delete
product-sections: create, read, update, delete
notifications:    create, read, update, delete
```

## Assumptions

- The admin products list endpoint (`GET /api/admin/products`) supports query parameters: `search`, `category_id`, `brand_id`, `is_active`, `page`, `limit`, `sort`, following the same pattern as the admin orders endpoint
- The admin can fetch all categories (`GET /api/admin/categories`) and brands (`GET /api/admin/brands`) for populating filter dropdowns and form selects
- Image upload is handled via a separate media upload endpoint (`POST /api/admin/media`) that returns a URL — the product form submits URLs not raw files
- The variant builder uses optimistic locking: each variant has a `version` field that must be sent on update; variant removal uses `_destroy: true` convention
- The product form inlines variant and image management — variants and images are sent as part of the product payload (create/update), not via separate API calls for the initial flow
- Existing shadcn components (Tabs, Table, Dialog, Select, Checkbox, Badge, Button, Input, Textarea, Form, Toast) are available
- `react-hook-form` and `zod` are already installed and used for form validation throughout the project
- The product form has a maximum of 10 about points, 20 attributes per section, and 20 variants per product
