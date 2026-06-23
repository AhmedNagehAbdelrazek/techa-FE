<!-- SPECKIT START -->

## Pre-Flight Checklist (MANDATORY — run before EVERY code decision)

Before writing any code, answering any task, or making any decision — run this checklist in order. Stop at the first rule that applies and act on it. Do not continue down the list.

```
1. Does this need to exist?       → If no clear requirement drives it, skip it entirely. (YAGNI)
2. Does the stdlib do it?         → Use it. No import needed.
3. Is it a native platform API?   → Use it. (Node built-ins, browser APIs, Next.js built-ins)
4. Is it an installed dependency? → Use it. Check package.json first.
5. Can it be written in one line? → Write one line.
6. Only then: write the minimum code that makes it work. Nothing more.
```

This checklist is not optional and is not a suggestion. It runs before every function, every file, every component, every utility. If you catch yourself about to write something without having run this checklist first, stop and run it now.

### What this looks like in practice

| Situation | Wrong | Right |
|---|---|---|
| Need to capitalize a string | Install `lodash` | `str[0].toUpperCase() + str.slice(1)` |
| Need to generate a UUID | Write a UUID function | `crypto.randomUUID()` (Node 14.17+) |
| Need to check if array is empty | `_.isEmpty(arr)` | `arr.length === 0` |
| Need to deep clone an object | Write a recursive clone | `structuredClone(obj)` (Node 17+) |
| Need to parse a URL | Install `url-parse` | `new URL(str)` |
| Need to format a date | Install `moment` | `new Intl.DateTimeFormat(...)` or `date.toLocaleDateString()` |
| Need to sleep/delay | Write a sleep utility | `await new Promise(r => setTimeout(r, ms))` |
| Need to flatten an array one level | Write a reduce | `arr.flat()` |
| Need to get unique values | Write a filter loop | `[...new Set(arr)]` |
| Need to read an env variable | Abstract it into a helper | `process.env.VAR_NAME` |

### The only valid reasons to add a new dependency

- The task is genuinely complex and the library solves a hard, well-defined problem (e.g. parsing multipart form data, JWT signing, bcrypt hashing)
- The library is already in `package.json` — it costs nothing to use it
- Writing it from scratch would take more than 20 lines and is not core business logic

If none of these apply, do not add the dependency. Ask first.

## Current Plan

**Feature**: Admin Banners, Settings & Media
**Branch**: `018-admin-banners-settings-media`
**Plan file**: `specs/018-admin-banners-settings-media/plan.md`
**Spec file**: `specs/018-admin-banners-settings-media/spec.md`

### Key Artifacts

- [spec.md](specs/018-admin-banners-settings-media/spec.md) — Feature specification
- [plan.md](specs/018-admin-banners-settings-media/plan.md) — Implementation plan
- [research.md](specs/018-admin-banners-settings-media/research.md) — Tech inventory & findings
- [data-model.md](specs/018-admin-banners-settings-media/data-model.md) — Types & API shapes
- [quickstart.md](specs/018-admin-banners-settings-media/quickstart.md) — Setup guide
- [contracts/banners-api.md](specs/018-admin-banners-settings-media/contracts/banners-api.md) — Banners API contract
- [contracts/settings-api.md](specs/018-admin-banners-settings-media/contracts/settings-api.md) — Settings API contract
- [contracts/media-api.md](specs/018-admin-banners-settings-media/contracts/media-api.md) — Media API contract

### Implementation Order

1. Create `src/lib/api/admin-banners-settings-media.ts` — API wrappers and types for banners (list, create, update, delete), settings (list, update), media (list with pagination, upload, delete)
2. Create `src/components/admin/BannersTable.tsx` — data table with image thumbnail, title, position, active period, sort_order, status badge (Active/Expired/Inactive)
3. Create `src/components/admin/BannerFormDialog.tsx` — create/edit banner form in Dialog with react-hook-form + zod (title, description, image_url with preview, link_url, position dropdown, sort_order, starts_at/ends_at date pickers, is_active)
4. Create `src/components/admin/SettingsPage.tsx` + `SettingsGroup.tsx` — grouped settings with dynamic input rendering by type (string/textarea/boolean/image/color/number). Image type has inline upload button.
5. Create `src/components/admin/MediaGrid.tsx` + `MediaUploadZone.tsx` — paginated grid with batch multi-file upload, thumbnail preview, Copy URL, Delete with 409 conflict handling
6. Create page files: `/admin/banners/page.tsx`, `/admin/settings/page.tsx`, `/admin/media/page.tsx`
7. Modify `AdminSidebar.tsx` — add Media link (Banners and Settings already exist)
8. Modify `Breadcrumbs.tsx` — add "media" segment label (banners and settings already exist)
9. Tree-shake / final review
10. Build verification: `pnpm run build`

### Critical Patterns (enforced)

- **No new npm packages**: All dependencies already in package.json. No new shadcn wrappers needed.
- **Permission gating**: `useAdminStore` with `EMPTY_PERMISSIONS` — granular `read`/`create`/`update`/`delete` per resource (`content.*` for banners, `settings.*` for settings, `media.*` for media)
- **React Query keys**: `adminBannerSettingsKeys` pattern matching `adminProductsKeys`/`adminOrdersKeys`
- **Skeleton exports**: Each component exports `*Skeleton` (existing convention)
- **Error/empty states**: Reuse `ErrorState` / `EmptyState` from `src/components/ui/`
- **Admin API client**: `adminRequest` from `AdminRequest.ts` for all admin API calls
- **Form validation**: react-hook-form + zod for banner form; controlled state for settings
- **Banner status badge**: Three-way — Inactive > Expired > Active precedence. Null `ends_at` = no expiry (Active).
- **Settings dynamic inputs**: Switch on `type` field renders correct component. Image type includes inline upload button.
- **Settings inactive rendering**: Grayed out but editable, with tooltip "Inactive setting"
- **Media pagination**: React Query with `keepPreviousData`, page/limit params
- **Media multi-file upload**: Batch upload via single `POST /api/admin/media` with `files[]` form field
- **Media delete 409**: Show conflict error in AlertDialog, keep item in grid on 409
- **Deactivation**: AlertDialog confirmation for banner delete and media delete
- **Sidebar links**: Add Media link (Banners and Settings already exist)
- **Breadcrumbs**: Add "media" segment label (banners and settings already exist)
- **Arabic-first RTL**: Already handled by root layout

### Completed

- **Phase 17** (Admin Coupons & Delivery Zones): Coupons paginated table with CRUD dialog, zones table with expandable rate rows, permission gating. Build passes.
- **Phase 16** (Admin Categories, Brands & Tags): Category tree with expand/collapse, brands paginated table, tags inline edit/delete, permission gating, all three admin pages. Build passes.
- **Phase 15** (Admin Orders & Payment Review): Orders table with sort/filters, order detail with status timeline/update modal, payment approve/reject, pending payments queue, dashboard metric card, sidebar link. All files implemented, build passes.
- **Phase 14** (Admin Products): Full product CRUD with multi-tab form, paginated table, bulk actions, permission gating. Build passes.
- **Phase 13** (Admin Dashboard): Dashboard with metric cards, donut chart, recent orders table, period selector. Build passes.
- **Phase 12** (Customer Account & Addresses): All files implemented, build passes.
- **Phases 7-11**: Customer Cart, Checkout, Order History, Wishlist, Notifications, and prior features.

<!-- SPECKIT END -->
