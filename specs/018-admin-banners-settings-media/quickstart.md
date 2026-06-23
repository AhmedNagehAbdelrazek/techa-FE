# Quickstart: Admin Banners, Settings & Media

## Prerequisites

- Node.js 20+, pnpm 9+
- Backend running at the URL configured in `NEXT_PUBLIC_API_URL` or `NEXT_PUBLIC_BACKEND_URL`
- Admin account with granular permissions:
  - `content.read/create/update/delete` (banners)
  - `settings.read/update` (settings)
  - `media.read/create/delete` (media)

## Getting Started

No new npm packages are needed. All dependencies are already in `package.json`.

## Key Files

### API Layer
- `src/lib/api/admin-banners-settings-media.ts` — API wrappers and inline types for banners CRUD, settings list/update, media CRUD.

### Components
- `src/components/admin/BannersTable.tsx` — Banners data table with image thumbnails, position, active period, status. Exports `BannersTableSkeleton`.
- `src/components/admin/BannerFormDialog.tsx` — Create/edit Dialog for banners (title, description, image_url with preview, link_url, position dropdown, sort_order, starts_at date picker, ends_at date picker, is_active). Exports `BannerFormDialogSkeleton`.
- `src/components/admin/SettingsGroup.tsx` — Renders a single settings group with dynamic inputs based on `type` field. Each group has a "Save" button. `type: "image"` includes inline upload button.
- `src/components/admin/SettingsPage.tsx` — Settings page wrapper that loads all groups and renders `SettingsGroup` for each.
- `src/components/admin/MediaGrid.tsx` — Paginated media grid showing uploaded files with thumbnail, filename, mime_type, size. Copy URL and Delete buttons per file.
- `src/components/admin/MediaUploadZone.tsx` — Drag-and-drop upload area supporting multiple files. Accepts JPEG, PNG, WebP, GIF (max 20MB).

### Pages
- `src/app/admin/(protected)/banners/page.tsx` — Banner management page (uses `BannersTable` + `BannerFormDialog`)
- `src/app/admin/(protected)/settings/page.tsx` — Settings management page (uses `SettingsPage` + `SettingsGroup`)
- `src/app/admin/(protected)/media/page.tsx` — Media management page (uses `MediaGrid` + `MediaUploadZone`)

## Patterns to Follow

- All API calls use `adminRequest` from `AdminRequest.ts` (including media)
- Banners/settings/media data fetching uses TanStack React Query with `adminBannerSettingsKeys`
- Media list uses pagination (page/limit) with `keepPreviousData`
- Permission check for banners: `permissions["content"]?.includes("read") ?? false`
- Permission check for settings: `permissions["settings"]?.includes("read") ?? false`
- Permission check for media: `permissions["media"]?.includes("read") ?? false`
- Settings `type: "image"` renders inline upload button + URL text input
- Each component exports `*Skeleton` for loading states
- Error/empty states use `ErrorState` / `EmptyState` from `src/components/ui/`
- Toast notifications use `toast()` from `sonner`
- Delete actions show confirmation via AlertDialog
- Media delete handles 409 Conflict (file in use) — show AlertDialog with error message
- Banner status badge: Inactive (gray) > Expired (red) > Active (green) precedence
- Media upload: JPEG, PNG, WebP, GIF only, max 20MB, field name `files` (plural)
- Copy URL uses `navigator.clipboard.writeText()` with toast confirmation
- Arabic-first RTL layout (already handled by root layout)
- Mobile-responsive at 375px width

## Build & Verify

```bash
pnpm run build
pnpm run lint
```
