# Feature Specification: Admin Banners, Settings & Media

**Feature Branch**: `018-admin-banners-settings-media`

**Created**: 2026-06-23

**Status**: Draft

**Input**: Frontend spec Phase 18 — "Admin Panel: Banners, Settings & Media". API endpoints from Postman collection (`Techa Auth API.postman_collection.json`): `/admin/banners` (CRUD), `/admin/settings` (list + bulk update), `/admin/media` (list, upload, delete with 409 conflict).

## User Scenarios & Testing

### User Story 1 — Admin Manages Banners (Priority: P1)

An admin navigates to `/admin/banners` and sees a table with columns: image preview, title, position, active period (starts_at → ends_at), sort_order, status badge. They click "Add Banner" to open a Dialog with fields: title, description (optional), image URL (text input with preview), link URL (optional), position (dropdown: hero, promo, sidebar, bottom), sort_order, starts_at (date picker), ends_at (date picker), is_active. They edit any banner via the same Dialog, or delete a banner with AlertDialog confirmation.

**Why this priority**: Banners control the store's promotional content on the homepage and other pages. Without banner management, the admin cannot update marketing campaigns.

**Independent Test**: An admin opens `/admin/banners`, creates a new banner, verifies it appears in the table with image thumbnail, edits the title, deletes it, and confirms the table updates.

**Acceptance Scenarios**:

1. **Given** an admin is on `/admin/banners`, **When** they click "Add Banner", fill in the form, and submit, **Then** the new banner appears in the table with correct data and image thumbnail.
2. **Given** a banner has `image_url` set, **When** the table renders, **Then** a thumbnail preview is shown.
3. **Given** an admin edits a banner's `title` and saves, **When** the page reloads, **Then** the updated title is shown.
4. **Given** an admin clicks delete on a banner, **When** they confirm the AlertDialog, **Then** the banner is removed from the table.
5. **Given** a banner's `ends_at` is in the past, **When** `is_active` is true, **Then** the status badge shows "Expired" (Inactive still takes precedence).
6. **Given** there are no banners, **When** the page loads, **Then** an empty state is shown with a CTA to create the first banner.

---

### User Story 2 — Admin Manages Settings (Priority: P1)

An admin navigates to `/admin/settings` and sees grouped form sections: General, Appearance, SEO, Payment, Social. Each setting renders the correct input based on its `type` field: `string` → Input, `textarea` → Textarea, `boolean` → Switch, `image` → Image upload with preview + URL input, `color` → Color picker input, `number` → Number Input. Each group has a "Save All" button that bulk-updates changed settings in that group.

**Why this priority**: Settings control the store's core configuration (name, currency, payment handles, SEO metadata, appearance). Without this, the admin cannot change the store's basic operation.

**Independent Test**: An admin opens `/admin/settings`, modifies a General setting (e.g., site_name), saves the General group, and verifies the change persists on reload.

**Acceptance Scenarios**:

1. **Given** an admin is on `/admin/settings`, **When** they see the General group, **Then** each setting renders the correct input type (string, textarea, boolean, image, color, number).
2. **Given** an admin changes a `string` setting and clicks "Save" for that group, **When** the page reloads, **Then** the updated value is shown.
3. **Given** an admin changes a `boolean` setting (Switch toggle) and saves, **Then** the new value persists.
4. **Given** a setting's input is of type `image`, **When** rendered, **Then** it shows an image preview and a URL text input (upload via media endpoint).
5. **Given** a `color` type setting, **When** rendered, **Then** it shows a color picker input.
6. **Given** an API error occurs on save, **Then** a toast shows the error and the form remains editable.

---

### User Story 3 — Admin Manages Media Library (Priority: P2)

An admin navigates to `/admin/media` and sees a paginated grid of uploaded files with thumbnail, filename, mime_type, and file_size. They upload one or more files via drag-and-drop or browse. Each file has a "Copy URL" button to copy the Cloudinary URL to clipboard and a "Delete" button. Delete calls the backend; if the file is in use by a product, brand, or banner, the backend returns 409 and the frontend shows the conflict message in an AlertDialog.

**Why this priority**: Media management provides a central image library. The backend now supports full CRUD (list, upload, delete with in-use detection). This replaces the ad-hoc upload approach.

**Independent Test**: An admin opens `/admin/media`, sees the paginated grid, uploads a file, copies its URL, and deletes a file.

**Acceptance Scenarios**:

1. **Given** an admin is on `/admin/media`, **When** they drag a file onto the upload area, **Then** the file uploads and appears in the grid with thumbnail, filename, mime_type, and size.
2. **Given** an admin is on `/admin/media`, **When** they click "Browse" and select multiple files, **Then** all files upload and appear in the grid.
3. **Given** an uploaded file is in the grid, **When** the admin clicks "Copy URL", **Then** the URL is copied to clipboard.
4. **Given** an admin clicks delete on an unused file, **When** they confirm, **Then** the file is removed from the grid (backend delete succeeds).
5. **Given** an admin clicks delete on a file that is in use, **When** the 409 response is returned, **Then** the conflict error message is shown in an AlertDialog and the file remains in the grid.
6. **Given** the media grid has many files, **When** the admin navigates to page 2, **Then** the next page of files is loaded.

---

### Edge Cases

- Banner position dropdown: values should match what the backend expects (hero, promo, sidebar, bottom — confirmed from Postman sample: `"position": "hero"`).
- Setting type `textarea`: render a multi-line Textarea instead of single-line Input.
- Setting type `boolean`: render a Switch toggle (controlled), display "true"/"false" labels.
- Setting type `image`: show current image preview + a URL input that can accept a new URL from the media upload flow.
- Setting type `color`: render an HTML color input (`<input type="color">`) — store value as hex string.
- Setting type `number`: render a number Input with min/max if available in the setting schema.
- Setting `is_active: false`: render the setting row dimmed/grayed out but still editable, with a tooltip "Inactive setting". Inactive settings are still saved if modified.
- Media upload: file must be JPEG, PNG, WebP, or GIF (max 20MB) — enforced by the backend, show frontend validation as well. Multiple files are uploaded in a single batch request (not sequentially).
- Media upload field name is `files` (plural), supporting multiple files at once.
- Media delete: API returns 409 Conflict if the file is referenced by a product image, brand logo, or banner. Show the error message in an AlertDialog and do NOT remove the item from the grid.
- Media grid is paginated — handle page changes via React Query with `keepPreviousData`.
- Bulk settings save: only changed settings within the group should be sent in the PUT request (optimized payload).

## Requirements

### Functional Requirements

- **FR-001**: System MUST display banners as a data table with columns: image thumbnail, title, position, active period (starts_at → ends_at range), sort_order, status badge (Active/Expired/Inactive). Inactive takes precedence over Expired.
- **FR-002**: Admin MUST be able to create a banner with: title, description, image_url, link_url, position (dropdown), sort_order, starts_at, ends_at (optional — null means never expires), is_active.
- **FR-003**: Admin MUST be able to edit any field of an existing banner via the same form Dialog pre-populated.
- **FR-004**: Admin MUST be able to delete a banner (hard delete) via delete button with AlertDialog confirmation.
- **FR-005**: System MUST display settings grouped by their `group` field (general, appearance, seo, payment, social) as separate form sections.
- **FR-006**: Each setting MUST render the correct input based on its `type` field: `string` → Input, `textarea` → Textarea, `boolean` → Switch, `image` → image URL input with preview AND an inline "Upload" button that calls `/api/admin/media` and auto-fills the URL, `color` → color picker, `number` → number Input.
- **FR-007**: Admin MUST be able to bulk-update settings in a group via a single "Save" button per group. Only changed settings in that group are sent in the PUT payload.
- **FR-008**: Media page MUST display a paginated grid of uploaded files fetched from `GET /api/admin/media`.
- **FR-009**: Media page MUST provide a drag-and-drop upload area AND a "Browse" button for file selection, supporting multiple files simultaneously via `POST /api/admin/media` (field: `files`).
- **FR-010**: Uploaded files in the media grid MUST show: thumbnail preview (via Cloudinary URL), filename, mime_type, file_size (human-readable format).
- **FR-011**: Each media item MUST have a "Copy URL" button to copy the Cloudinary URL to clipboard.
- **FR-012**: Each media item MUST have a "Delete" button that calls `DELETE /api/admin/media/:id`. On 409 Conflict (file in use), show an AlertDialog with the error message. On success, remove from grid and refetch list.
- **FR-013**: All pages MUST show permission-gated action buttons using `useAdminStore` — `content.*` for banners (`content.read`, `content.create`, `content.update`, `content.delete`), `settings.*` for settings (`settings.read`, `settings.update`), `media.*` for media (`media.read`, `media.create`, `media.delete`).
- **FR-014**: Each page MUST have a loading skeleton state and an error state with retry.
- **FR-015**: Each page MUST have an empty state when no items exist, with a CTA to create the first item (if the admin has create permission).

### Key Entities

- **Banner**: A promotional banner displayed on the storefront. Has title, description, image, link URL, position, sort_order, active dates, active status.
- **Setting**: A site configuration key-value pair. Has key, value, type (string/textarea/boolean/image/color/number), group (general/appearance/seo/payment/social), active status.
- **Media File**: An uploaded file (image) stored on Cloudinary. Has id, URL, filename, mime_type, file_size, timestamps. Managed server-side with paginated list, upload, and delete (with in-use conflict detection).

### API Endpoints

#### Banners

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/banners` | List all banners |
| POST | `/api/admin/banners` | Create a banner |
| PUT | `/api/admin/banners/:id` | Update a banner |
| DELETE | `/api/admin/banners/:id` | Hard-delete a banner |

Banner shape:
```json
{
  "id": "banner-uuid",
  "title": "Summer Sale",
  "description": "Get 50% off",
  "image_url": "https://cdn.example.com/banners/summer.jpg",
  "link_url": "https://techa.com/sale",
  "position": "hero",
  "sort_order": 1,
  "starts_at": "2026-06-01T00:00:00Z",
  "ends_at": null,
  "is_active": true
}
```

List response: `{ data: Banner[] }`

#### Settings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/settings` | List all settings grouped by group |
| PUT | `/api/admin/settings` | Bulk update setting values |

Setting shape (GET response):
```json
{
  "data": {
    "general": [
      {
        "key": "site_name",
        "value": "Techa Marketplace",
        "type": "string",
        "is_active": true
      }
    ],
    "payment": [
      {
        "key": "instapay_handle",
        "value": "@techa",
        "type": "string",
        "is_active": true
      }
    ]
  }
}
```

PUT request: `{ "settings": { "site_name": "Techa Updated", "currency": "USD" } }`

#### Media

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/media?page=&limit=` | Paginated list of uploaded media files |
| POST | `/api/admin/media` | Upload one or more files (multipart form-data, field: `files`) |
| DELETE | `/api/admin/media/:id` | Delete a media file (409 if in use) |

Media shape (list response):
```json
{
  "data": [
    {
      "id": "media-uuid",
      "url": "https://res.cloudinary.com/.../image/upload/v1/techa/media/uuid.jpg",
      "filename": "photo.jpg",
      "mime_type": "image/jpeg",
      "file_size": 123456,
      "createdAt": "2026-06-23T10:00:00.000Z",
      "updatedAt": "2026-06-23T10:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

Upload response (201):
```json
{
  "data": [
    {
      "id": "media-uuid",
      "url": "https://res.cloudinary.com/.../image/upload/v1/techa/media/uuid.jpg",
      "filename": "photo.jpg",
      "mime_type": "image/jpeg",
      "file_size": 123456
    }
  ]
}
```

Delete response (200): `{ "message": "Media file deleted successfully." }`
Delete conflict (409): `{ "message": "Cannot delete: file is used as product image, brand logo" }`

**Note**: The media list is persistent (server-side) and paginated. No local-state-only limitation.

## Success Criteria

### Measurable Outcomes

- **SC-001**: An admin can complete the full create-edit-delete cycle for banners in under 3 minutes.
- **SC-002**: An admin can update a single setting group and see the change persist on reload within 2 minutes.
- **SC-003**: An admin can upload an image and copy its URL within 30 seconds.
- **SC-004**: 100% of API error responses are displayed to the admin via toast notifications.
- **SC-005**: Empty states and loading skeletons are shown on all pages, covering every data-fetching state.

## Clarifications

### Session 2026-06-23

- Q: Permission granularity for banners — should it use `content.*` (from Postman: `content.read`, `content.create`, `content.update`, `content.delete`) or a dedicated `banners.*`? → A: Use `content.*` as specified in the Postman collection descriptions. Banners are treated as "content" resources alongside other content types.
- Q: Settings permissions — Postman says `settings.read` and `settings.update`. Is there `settings.create` or `settings.delete`? → A: No — settings are only read and updated (bulk). No create or delete operations.
- Q: Media permissions — is there any permission gating for upload? → A: The Postman collection uses `{{auth_token}}` (not admin token) for the upload endpoint, suggesting it's available to any authenticated user. No admin-specific permission needed.
- Q: `type` field values in settings — what are the exact allowed values? → A: Based on the frontend spec: `string` (Input), `textarea` (Textarea), `boolean` (Switch), `image` (image URL with preview), `color` (color picker), `number` (number Input). The Postman sample only shows `type: "string"` but the frontend must handle all six types.
- Q: Media grid persistence — since there's no backend list API, how should the grid work? → A: Local state only (React state + localStorage as optional enhancement). On page reload, previously uploaded files are lost. This is a known limitation.
- Q: Media delete — no backend endpoint exists. What should the delete button do? → A: Remove the item from the local grid state. Show an AlertDialog warning "This file may still be in use on banners or products" before removal, but no API call is made.
- Q: Banner position values — what are the valid positions? → A: From Postman sample: `"hero"`. Additional positions from spec: hero, promo, sidebar, bottom. The dropdown should include all four.
- Q: Settings `type: "image"` upload flow — inline upload or manual URL entry? → A: Inline upload button that calls `/api/admin/media` (or `/api/upload`) and auto-fills the URL field, plus a manual URL text input as fallback.
- Q: Banner `ends_at` — required or nullable? → A: Nullable. A null `ends_at` means the banner never expires (perpetually active until manually deactivated).
- Q: Sidebar navigation — add links for Banners, Settings, and Media? → A: Yes, add all three. Banners under "Content", Settings under "Configuration", Media under "Content" or standalone.
- Q: Media multi-file upload — batch or sequential? → A: Batch upload — all files in a single request, refetch list once done.
- Q: Settings `is_active` rendering — hide, gray out, or disable inactive settings? → A: Gray out / dim inactive settings but keep them visible and editable. Add a tooltip "Inactive setting" for clarity.

## Assumptions

- Banners use `content.*` permission keys (content.read, content.create, content.update, content.delete), matching Postman API descriptions.
- Settings use `settings.read` and `settings.update` permission keys (no create/delete).
- The settings GET response is grouped by group name (general, appearance, seo, payment, social) as keys in the `data` object.
- The settings PUT accepts `{ "settings": { key: value, ... } }` and updates only the provided keys.
- The settings `type` field can be: `string`, `textarea`, `boolean`, `image`, `color`, `number`.
- Banner position values: `hero`, `promo`, `sidebar`, `bottom`.
- Banner deletion is hard delete (DELETE endpoint removes the banner permanently).
- Media upload accepts JPEG, PNG, WebP, or GIF files, max 20MB (as documented in Postman).
- The admin media upload endpoint is `POST /api/admin/media` (multipart form-data, field: `files`), uses `{{admin_token}}`.
- The admin media list endpoint is `GET /api/admin/media` with pagination, returning `{ data: MediaFile[], meta: PaginationMeta }`.
- The admin media delete endpoint is `DELETE /api/admin/media/:id`, returning 200 on success and 409 on conflict.
- Media files have the shape: `{ id, url, filename, mime_type, file_size, createdAt, updatedAt }`.
- Media permissions are `media.*` (media.read, media.create, media.delete).
- Date fields (`starts_at`, `ends_at`) use ISO 8601 string format. `ends_at` can be null (no expiry date).
- Banner status badge: if `ends_at` is null and `is_active` is true, badge shows "Active" (never expires).
- The settings `color` type stores the value as a hex string (e.g., `#ff0000`).
- Settings groups are rendered as separate sections with their own "Save" button. Only the settings within that group are included in the save payload.
