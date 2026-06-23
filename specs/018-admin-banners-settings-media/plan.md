# Implementation Plan: Admin Banners, Settings & Media

**Branch**: `018-admin-banners-settings-media` | **Date**: 2026-06-23 | **Spec**: `specs/018-admin-banners-settings-media/spec.md`

**Input**: Feature specification from `specs/018-admin-banners-settings-media/spec.md`. Postman collection (`Techa Auth API.postman_collection.json`) provides full API shapes. Updated Postman adds admin media CRUD endpoints.

## Summary

Build admin management UI for three pages:
1. **Banners** (`/admin/banners`): Data table with image thumbnails, CRUD via Dialog, status badge (Active/Expired/Inactive), hard delete.
2. **Settings** (`/admin/settings`): Grouped form sections (General, Appearance, SEO, Payment, Social) with dynamic input rendering by `type` field (string/textarea/boolean/image/color/number). Inline image upload for `type: "image"`. Bulk save per group.
3. **Media** (`/admin/media`): Paginated grid with thumbnail preview, multi-file batch upload (drag-and-drop), Copy URL, Delete with 409 conflict handling.

Permission gating via `useAdminStore` with `content.*` (banners), `settings.*` (settings), `media.*` (media). All three use `adminRequest`. No new npm packages. Sidebar links for Banners, Settings already exist; add Media link.

## Technical Context

**Language/Version**: TypeScript 5 (strict: true), Next.js 15 (App Router), React 19

**Primary Dependencies**: Next.js (react-dom, react), Tailwind CSS 4, shadcn/ui (New York, radix icons), lucide-react, zustand (@tanstack/react-query v5), sonner, react-hook-form + zod + @hookform/resolvers

**API Client**: `adminRequest` from `src/lib/api/AdminRequest.ts` — separate axios instance with `admin_access_token` (localStorage), interceptor for auth header injection. Used for all three resources (banners, settings, media). The legacy `/api/upload` endpoint exists but admin media should use `POST /api/admin/media` instead.

**Storage**: N/A (data fetched from backend REST API)

**Testing**: N/A (testing deferred — existing Vitest + @testing-library/react + Playwright setup available but not used in this phase)

**Target Platform**: Web (Next.js 15, server + client rendering)

**Project Type**: Web application (Next.js App Router, frontend-only — consumes backend REST API)

**Performance Goals**: Banner table loads within 2 seconds; settings page loads within 2 seconds; media page with pagination loads within 2 seconds; media upload completes within 5 seconds (depends on file size and Cloudinary)

**Constraints**: No new npm packages; all required dependencies already in `package.json`. Arabic-first (RTL, `lang="ar"`, `dir="rtl"`). Mobile-responsive (375px). Frontend-only — backend provides REST API.

**Scale/Scope**: Banners not paginated (typically <50); settings grouped into ~5 groups; media paginated at 20/page with persistent backend.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Check | Status |
|------|-------|--------|
| Pre-Flight Checklist | Applied to every new file | ✅ |
| Package additions | Zero new packages needed — all dependencies exist | ✅ |
| No new dependencies for core logic | All patterns exist: adminRequest, useAdminStore, React Query, shadcn ui wrappers | ✅ |
| Existing patterns followed | Uses adminRequest, useAdminStore, ErrorState/EmptyState, skeleton export pattern, React Query query keys, Dialog for CRUD forms, pagination for media | ✅ |

## Project Structure

### Documentation (this feature)

```text
specs/018-admin-banners-settings-media/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── banners-api.md
│   ├── settings-api.md
│   └── media-api.md
└── tasks.md             # Phase 2 output (NOT created by /speckit.plan)
```

### Source Code (repository root)

```
src/
├── lib/
│   └── api/
│       └── admin-banners-settings-media.ts    # NEW — API wrappers + inline types for banners, settings, media CRUD
├── components/
│   ├── ui/
│   │   └── (existing: Table, Dialog, AlertDialog, Badge, Button, Input, Textarea, Switch, Select, Calendar, ErrorState, EmptyState, Skeleton)
│   └── admin/
│       ├── BannersTable.tsx                   # NEW — banners data table with image thumbnails, position, period, status
│       ├── BannerFormDialog.tsx               # NEW — create/edit banner form in Dialog
│       ├── SettingsGroup.tsx                  # NEW — single settings group with dynamic inputs + save button
│       ├── SettingsPage.tsx                   # NEW — settings page wrapper loading all groups
│       ├── MediaGrid.tsx                      # NEW — paginated media grid with thumbnails, copy URL, delete (409 handling)
│       └── MediaUploadZone.tsx                # NEW — drag-and-drop upload area (multi-file batch)
├── app/
│   └── admin/
│       └── (protected)/
│           ├── banners/
│           │   └── page.tsx                   # NEW — banner management page
│           ├── settings/
│           │   └── page.tsx                   # NEW — settings management page
│           └── media/
│               └── page.tsx                   # NEW — media management page
└── components/
    └── layout/
        ├── AdminSidebar.tsx                   # MODIFY — add Media link (Banners and Settings already exist)
        └── Breadcrumbs.tsx                    # MODIFY — add "media" segment label (banners and settings already exist)
```

**Structure Decision**: Three separate routes. Banners follow the table+Dialog CRUD pattern from Phases 14-17. Settings use a novel grouped-section pattern with dynamic input rendering via switch on `type` field. Media uses a paginated grid with batch upload — similar pattern to product tables but with file operations.

## Implementation Order

1. Create `src/lib/api/admin-banners-settings-media.ts` — API wrappers and types for banners (list, create, update, delete), settings (list, update), media (list with pagination, upload, delete)
2. Create `src/components/admin/BannersTable.tsx` — data table with image thumbnail, title, position, period, sort_order, status badge
3. Create `src/components/admin/BannerFormDialog.tsx` — create/edit form in Dialog with react-hook-form + zod validation
4. Create `src/components/admin/SettingsPage.tsx` + `SettingsGroup.tsx` — grouped settings with dynamic input rendering
5. Create `src/components/admin/MediaGrid.tsx` + `MediaUploadZone.tsx` — paginated grid with batch upload
6. Create page files: `/admin/banners/page.tsx`, `/admin/settings/page.tsx`, `/admin/media/page.tsx`
7. Modify `AdminSidebar.tsx` — add Media link
8. Modify `Breadcrumbs.tsx` — add "media" segment label
9. Tree-shake / final review
10. Build verification: `pnpm run build`

## Critical Patterns (enforced)

- **No new npm packages**: All dependencies already in package.json
- **Permission gating**: `useAdminStore` with `EMPTY_PERMISSIONS` — `content.*` for banners, `settings.*` for settings, `media.*` for media
- **React Query keys**: `adminBannerSettingsKeys` pattern matching existing patterns
- **Skeleton exports**: Each component exports `*Skeleton`
- **Error/empty states**: Reuse `ErrorState` / `EmptyState` from `src/components/ui/`
- **Admin API client**: `adminRequest` for all three resources
- **Form validation**: react-hook-form + zod for banner form; controlled state for settings
- **Banner status badge**: Three-way — Inactive > Expired > Active precedence. Null `ends_at` = no expiry.
- **Settings dynamic input**: Switch on `type` field renders correct component (string/textarea/boolean/image/color/number). Image type includes inline upload button.
- **Settings inactive rendering**: Grayed out but editable, with tooltip "Inactive setting"
- **Media pagination**: React Query with `keepPreviousData`, page/limit params
- **Media multi-file upload**: Batch upload via single `POST /api/admin/media` with `files[]` form field
- **Media delete**: Handle 409 Conflict — show error in AlertDialog, keep item in grid
- **Sidebar**: Add Media link; Banners and Settings already exist
- **Deactivation**: AlertDialog confirmation for banner delete and media delete

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Settings dynamic input rendering | Settings have variable `type` field requiring different inputs | Separate hardcoded form per group — too brittle when new settings are added |
| Media 409 conflict handling | Backend returns 409 for in-use files | Ignoring 409 would leave grid inconsistent — user would think delete succeeded |
| Settings inline image upload | Settings `type: "image"` needs upload-then-URL flow | URL-only input requires context-switching to Media page — inline upload is better UX |
