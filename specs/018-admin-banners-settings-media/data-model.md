# Data Model: Admin Banners, Settings & Media

## Types (TypeScript)

```typescript
// ─── Banner ──────────────────────────────────────────────

interface AdminBanner {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  link_url: string | null;
  position: "hero" | "promo" | "sidebar" | "bottom";
  sort_order: number;
  starts_at: string; // ISO 8601
  ends_at: string | null; // ISO 8601 — null means never expires
  is_active: boolean;
}

interface AdminBannerListResponse {
  data: AdminBanner[];
}

interface AdminBannerFormData {
  title: string;
  description?: string;
  image_url: string;
  link_url?: string;
  position: "hero" | "promo" | "sidebar" | "bottom";
  sort_order: number;
  starts_at: string; // ISO 8601
  ends_at: string | null; // ISO 8601
  is_active: boolean;
}

// ─── Settings ────────────────────────────────────────────

interface Setting {
  key: string;
  value: string | number | boolean;
  type: "string" | "textarea" | "boolean" | "image" | "color" | "number";
  is_active: boolean;
}

interface AdminSettingsResponse {
  data: Record<string, Setting[]>; // keyed by group name
}

interface AdminSettingsUpdatePayload {
  settings: Record<string, string | number | boolean>;
}

// ─── Media ───────────────────────────────────────────────

interface AdminMediaFile {
  id: string;
  url: string;
  filename: string;
  mime_type: string;
  file_size: number;
  createdAt: string;
  updatedAt: string;
}

interface AdminMediaListResponse {
  data: AdminMediaFile[];
  meta: PaginationMeta;
}

// ─── Shared ──────────────────────────────────────────────

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
```

## State Transitions

### Banner
- `is_active: true` → admin can edit and set `is_active: false` → becomes inactive
- Banner can also be hard-deleted via DELETE endpoint (removed from database)
- Status badge logic: `is_active` false → "Inactive" (gray); `is_active` true + `ends_at` past → "Expired" (red); `is_active` true + `ends_at` future/null → "Active" (green). Inactive takes precedence.

### Settings
- No create/delete — settings are predefined by the backend
- Admin updates values via bulk PUT per group
- Each group is independent — saving one group does not affect others

### Media Files
- Upload: file(s) selected → `POST /api/admin/media` → response added to grid (refetch list)
- Delete: `DELETE /api/admin/media/:id` → 200 (success) → refetch list
- Delete conflict: 409 (in use) → show error AlertDialog, file remains in grid
- List is persistent and paginated via `GET /api/admin/media`

## React Query Keys

```typescript
export const adminBannerSettingsKeys = {
  all: ["admin", "banners-settings"] as const,
  banners: () => [...adminBannerSettingsKeys.all, "banners"] as const,
  banner: (id: string) => [...adminBannerSettingsKeys.banners(), id] as const,
  settings: () => [...adminBannerSettingsKeys.all, "settings"] as const,
  media: () => [...adminBannerSettingsKeys.all, "media"] as const,
  mediaList: (params: MediaListParams) => [...adminBannerSettingsKeys.media(), params] as const,
};
```

## Validation Rules (Zod)

### Banner Form
```typescript
const bannerSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(500).optional(),
  image_url: z.string().url("Must be a valid URL").min(1, "Image URL is required"),
  link_url: z.string().url().optional().or(z.literal("")),
  position: z.enum(["hero", "promo", "sidebar", "bottom"]),
  sort_order: z.coerce.number().int().min(0).default(0),
  starts_at: z.string().min(1, "Start date is required"),
  ends_at: z.string().optional().or(z.literal("")), // empty → null on submit = never expires
  is_active: z.boolean().default(true),
});
```

## API Endpoint Summary

| Resource | Method | Endpoint | Request Body | Response |
|----------|--------|----------|-------------|----------|
| Banners | GET | `/api/admin/banners` | — | `AdminBannerListResponse` |
| Banners | POST | `/api/admin/banners` | `AdminBannerFormData` | `{ data: AdminBanner }` |
| Banners | PUT | `/api/admin/banners/:id` | Partial `AdminBannerFormData` | `{ data: AdminBanner }` |
| Banners | DELETE | `/api/admin/banners/:id` | — | `{ message }` |
| Settings | GET | `/api/admin/settings` | — | `AdminSettingsResponse` |
| Settings | PUT | `/api/admin/settings` | `AdminSettingsUpdatePayload` | `{ message, updated[], not_found[] }` |
| Media | GET | `/api/admin/media?page=&limit=` | — | `AdminMediaListResponse` |
| Media | POST | `/api/admin/media` | FormData (files[]) | `{ data: AdminMediaFile[] }` |
| Media | DELETE | `/api/admin/media/:id` | — | `{ message }` or 409 `{ message }` |
