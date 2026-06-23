# Feature Specification: Admin Categories, Brands & Tags

**Feature Branch**: `016-admin-categories-brands-tags`

**Created**: 2026-06-23

**Status**: Draft

**Input**: User description: "Admin CRUD for categories (tree view with expand/collapse, add/edit/deactivate in Dialog), brands (data table with create/edit Dialog), and tags (inline edit/delete list)."

## User Scenarios & Testing

### User Story 1 - Admin Manages Categories (Priority: P1)

An admin navigates to `/admin/categories` and sees the full category hierarchy displayed as an indented tree. They can expand/collapse parent categories to reveal subcategories. They add a new top-level category via a Dialog form (name, slug, parent, image, sort_order, is_active), or add a subcategory from within the tree (parent_id pre-filled). They edit any category by clicking an Edit button on the node, which opens the same Dialog pre-populated. They deactivate a category; if it has active products, the backend rejects with 409 and the frontend shows a warning message.

**Why this priority**: Categories are the primary navigation taxonomy. Without category management, products cannot be organized or found.

**Independent Test**: An admin can open `/admin/categories`, add a new top-level category, verify it appears in the tree, edit its name, deactivate it, and confirm it disappears from the tree.

**Acceptance Scenarios**:

1. **Given** an admin is on `/admin/categories`, **When** they click "Add Category", fill in the form, and submit, **Then** the new category appears in the tree at the correct level.
2. **Given** a category has subcategories, **When** the admin clicks the category node, **Then** the children expand/collapse.
3. **Given** an admin clicks "Add Subcategory" on an existing category, **When** the Dialog opens, **Then** the parent_id field is pre-filled with that category.
4. **Given** an admin deactivates a category that has active products, **When** the API returns 409, **Then** the admin sees a warning toast explaining the conflict.
5. **Given** an admin edits a category's name and submits, **When** the page reloads, **Then** the updated name is shown in the tree.

---

### User Story 2 - Admin Manages Brands (Priority: P1)

An admin navigates to `/admin/brands` and sees a paginated data table with columns: logo, name, slug, description, status. They open a Dialog to create a new brand (name, slug, logo upload, description, is_active) or edit an existing one. They deactivate a brand; if it has active products, the backend returns 409 and the frontend shows a warning.

**Why this priority**: Brands are a core product attribute used in filtering and product display. Both brands and categories are P1 because products require both.

**Independent Test**: An admin can open `/admin/brands`, create a new brand, verify it appears in the table, edit it, and deactivate it.

**Acceptance Scenarios**:

1. **Given** an admin is on `/admin/brands`, **When** they click "Add Brand", fill in the form, and submit, **Then** the new brand appears in the table.
2. **Given** an admin clicks "Edit" on a brand row, **When** the Dialog opens with pre-populated data and they modify a field, **Then** the row updates after submission.
3. **Given** an admin deactivates a brand with active products, **When** the API returns 409, **Then** a warning toast is displayed.
4. **Given** a brand has a logo URL, **When** the table renders, **Then** the logo thumbnail is displayed.

---

### User Story 3 - Admin Manages Tags (Priority: P2)

An admin navigates to `/admin/tags` and sees a flat list of all tags. Each tag row shows the name and slug with inline Edit/Delete buttons. Clicking Edit opens an inline input or a small Dialog to rename the tag. Deleting removes the tag immediately after confirmation via AlertDialog.

**Why this priority**: Tags are supplementary to categories/brands and have simpler CRUD (no image, no hierarchy, no active/inactive state). P2 is appropriate since tags are not essential for product creation.

**Independent Test**: An admin can open `/admin/tags`, add a new tag, edit its name inline, and delete it.

**Acceptance Scenarios**:

1. **Given** an admin is on `/admin/tags`, **When** they click "Add Tag", type a name, and submit, **Then** the tag appears in the list.
2. **Given** an admin clicks "Edit" on a tag, **When** they change the name and save, **Then** the updated name appears.
3. **Given** an admin clicks "Delete" on a tag, **When** they confirm in the AlertDialog, **Then** the tag is removed from the list.

---

### Edge Cases

- Deactivating a category or brand that still has active products: the backend should return a 409 Conflict with a message. The frontend must display this message in a toast and not remove the item from the UI.
- Adding a category with a duplicate slug: the API should return a validation error; the frontend shows the error on the slug field inline.
- Deleting a tag that is attached to products: the API should handle this gracefully (either cascade, detach, or reject); the frontend shows whatever error the API returns.
- Empty states: each page (categories, brands, tags) must have a designed empty state with a CTA to create the first item.
- Network errors during create/update/delete: show a sonner toast with the error message; keep the Dialog open so the user can retry.

## Requirements

### Functional Requirements

- **FR-001**: System MUST display categories as a nested indented tree with expand/collapse on parent nodes.
- **FR-002**: Admin MUST be able to create a category with: name, slug (auto-generated from name, manually editable), parent category (dropdown), image URL input (text field), sort_order (number), is_active (toggle).
- **FR-003**: Admin MUST be able to edit any field of an existing category via the same form Dialog pre-populated with current values.
- **FR-004**: Admin MUST be able to deactivate a category (soft delete) via a deactivate button that shows a confirmation AlertDialog.
- **FR-005**: When adding a subcategory from within the tree, the parent_id field MUST be pre-filled with the selected parent.
- **FR-006**: If the API returns a 409 when deactivating a category with active products, the frontend MUST show the error message in a toast and keep the item visible.
- **FR-007**: System MUST display brands as a paginated data table with columns: logo thumbnail, name, slug, description, is_active status badge.
- **FR-008**: Admin MUST be able to create a brand with: name, slug (auto-generated, editable), logo URL (text input with preview), description (textarea), is_active (toggle).
- **FR-009**: Admin MUST be able to edit a brand via a Dialog pre-populated with current values.
- **FR-010**: Admin MUST be able to deactivate a brand with the same 409 conflict handling as categories.
- **FR-011**: System MUST display tags as a flat list with name, slug, and inline Edit/Delete action buttons.
- **FR-012**: Admin MUST be able to create a tag by entering a name in an input (slug auto-generated).
- **FR-013**: Admin MUST be able to edit a tag name via an inline input or small Dialog.
- **FR-014**: Admin MUST be able to delete a tag after confirming via AlertDialog.
- **FR-015**: All three pages MUST show permission-gated action buttons using `useAdminStore` permissions pattern — hide the page entirely if the admin lacks `categories.read` (or `brands.read`/`tags.read`), hide create buttons if lacking `create`, hide edit buttons if lacking `update`, hide deactivate/delete buttons if lacking `delete`.
- **FR-016**: Each page MUST have a loading skeleton state and an error state with retry.
- **FR-017**: Each page MUST have an empty state when no items exist, with a CTA to create the first item (if the admin has write permission).

### Key Entities

- **Category**: A hierarchical grouping for products. Has a parent (null for top-level), ordered children array, name, slug, image URL, sort order, and active status. Can be nested arbitrarily deep.
- **Brand**: A product brand/manufacturer. Has name, slug, logo URL, description, and active status. Flat list (no hierarchy).
- **Tag**: A lightweight product label. Has name and slug only. Flat list, no active state (hard delete).

## Success Criteria

### Measurable Outcomes

- **SC-001**: An admin can complete the full create-edit-deactivate cycle for all three taxonomy types in under 5 minutes total.
- **SC-002**: The category tree renders with correct indentation and expand/collapse for hierarchies up to 3 levels deep without performance degradation.
- **SC-003**: 100% of API error responses (validation errors, 409 conflicts) are displayed to the admin via toast notifications.
- **SC-004**: Empty states and loading skeletons are shown on all three pages, covering every data-fetching state.

## Clarifications

### Session 2026-06-23

- Q: Permission granularity for categories/brands/tags — combined `write` or granular `read`/`create`/`update`/`delete`? → A: Granular (`read`/`create`/`update`/`delete`) to match existing codebase convention.

## Assumptions

- Admin permissions for categories/brands/tags use granular `resource.action` convention: `categories.read`, `categories.create`, `categories.update`, `categories.delete` (and the same pattern for `brands` and `tags`).
- The brands list endpoint returns paginated data matching the `{ data: [...], meta: {...} }` pattern used by other admin list endpoints.
- The admin categories list endpoint returns an array of categories (not paginated) since the tree is the full hierarchy.
- Tag deletion is hard delete (not soft delete) — the DELETE endpoint removes the tag permanently.
- The logo upload for brands uses a URL text input (not a file upload), consistent with the Create Brand endpoint body in the Postman collection (`logo_url` is a string).
- Image fields for categories also use URL text inputs.
- Slug auto-generation follows the same pattern as admin products: derived from name but manually editable.
