# Research: Admin Banners, Settings & Media

## Tech Stack Decisions

### API Client Pattern
- **Decision**: Use `adminRequest` from `src/lib/api/AdminRequest.ts` for banners, settings, and media.
- **Rationale**: All three now use `{{admin_token}}` based on updated Postman collection. Media endpoints (`/api/admin/media`) are admin-scoped.
- **Alternatives**: Using `Request.ts` (customer client) for media upload — rejected because media endpoints now require admin token.

### State Management
- **Decision**: TanStack React Query v5 for banners, settings, and media list.
- **Rationale**: Banners, settings, and media are all server-state fetched from API with pagination (media).
- **Alternatives**: Local state for media grid — rejected because media now has persistent backend with pagination.

### Permission Gating
- **Decision**: `useAdminStore` with `EMPTY_PERMISSIONS` hoisted pattern (same as Phases 14-17).
- **Rationale**: Banners use `content.*` permissions. Settings use `settings.*`. Media uses `media.*` with `media.read`, `media.create`, `media.delete`.

### Form Validation
- **Decision**: Use `react-hook-form` with `zod` for banner form, plain controlled state for settings and media.
- **Rationale**: Banner form has multiple fields — react-hook-form + zod provides validation. Settings are simpler individual inputs with bulk save. Media has no form, just file upload.

### Dynamic Input Rendering (Settings)
- **Decision**: Use a `renderSettingInput(setting)` switch function that returns the correct shadcn input component based on `setting.type`.
- **Rationale**: Each setting has a `type` field. A switch function maps type → component.
- **Pattern**:
  ```tsx
  function renderSettingInput(setting: Setting, value: any, onChange: (v: any) => void) {
    switch (setting.type) {
      case "string": return <Input value={value} onChange={onChange} />;
      case "textarea": return <Textarea value={value} onChange={onChange} />;
      case "boolean": return <Switch checked={value} onCheckedChange={onChange} />;
      case "image": return <ImageUploadSetting value={value} onChange={onChange} />; // inline upload + URL input
      case "color": return <input type="color" value={value} onChange={onChange} />;
      case "number": return <Input type="number" value={value} onChange={onChange} />;
    }
  }
  ```

### Settings Image Upload Flow
- **Decision**: Settings with `type: "image"` render a URL text input AND an inline "Upload" button. The upload button calls `POST /api/admin/media` (single file), gets the URL back, and auto-fills the input. The admin can also paste a URL manually.
- **Rationale**: Best UX — admin can either paste an existing URL or upload a new image directly from the settings page without switching to the Media page.
- **Pattern**: The upload button opens a file picker, uploads the selected file, and calls `onChange(url)` on the setting value.

### Media Grid with Pagination
- **Decision**: Use React Query with paginated list from `GET /api/admin/media?page=&limit=`. Use `keepPreviousData` for smooth page transitions.
- **Rationale**: Media list is now persistent and paginated server-side.
- **Pattern**: Same as Phase 14-17 paginated tables.

### Multi-File Upload (Media)
- **Decision**: Use native HTML5 drag-and-drop with `multiple` attribute on file input. Upload each file sequentially or batch via the `files` form field.
- **Rationale**: Backend accepts multiple files in a single request via form field `files`. Use `FormData` with multiple `files` entries.
- **Pattern**: `const formData = new FormData(); files.forEach(f => formData.append("files", f));`

### Copy URL
- **Decision**: Use `navigator.clipboard.writeText(url)` with a toast confirmation.
- **Rationale**: Native Clipboard API is well-supported.

### Image Thumbnail Preview (Banners Table)
- **Decision**: Use plain `<img>` with fallback, sized to ~80x40px.
- **Rationale**: Cloudinary URLs are external; Next.js Image optimization isn't needed for table thumbnails.

### Position Dropdown Values
- **Decision**: Hardcoded array: `["hero", "promo", "sidebar", "bottom"]`.

### Delete with 409 Handling (Media)
- **Decision**: On delete, call `DELETE /api/admin/media/:id`. On 409, show the error message in an AlertDialog. On 200, invalidate the media list query and show a success toast.
- **Rationale**: The backend returns 409 when a file is referenced by a product, brand, or banner. The frontend must handle this gracefully by showing the conflict message and NOT removing the item from the grid.

## Existing Code Patterns

### React Query Keys Pattern
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

### Skeleton Export Pattern
Each component exports `*Skeleton` for loading states.

### Permission Check Pattern (EMPTY_PERMISSIONS)
```typescript
const EMPTY_PERMISSIONS: Record<string, string[]> = {};
const permissions = useAdminStore((s) => s.admin?.permissions ?? EMPTY_PERMISSIONS);
const canRead = permissions["content"]?.includes("read") ?? false;
const canCreate = permissions["content"]?.includes("create") ?? false;
// For media:
const canReadMedia = permissions["media"]?.includes("read") ?? false;
```

### Dialog CRUD Pattern
```typescript
// Dialog opens on "Add" / "Edit" button click
// Form inside Dialog uses react-hook-form + zod
// On submit, calls create or update mutation
// On success, invalidates list query, closes Dialog, shows toast
// On error, shows toast with error message
```

### Pagination Pattern (from admin-products, admin-orders)
Uses `useQuery` with page/limit params, `keepPreviousData`, and a pagination component.

## No New NPM Packages

All required dependencies are already in `package.json`:
- `lucide-react` — icons (Upload, Copy, Trash2, Plus, Edit2, Image, Settings, Layout, etc.)
- `sonner` — toasts
- `@tanstack/react-query` — server state
- `zustand` — `useAdminStore`
- `react-hook-form` + `zod` + `@hookform/resolvers` — form validation (banner form)
- shadcn/ui components: Table, Dialog, AlertDialog, Badge, Badge, Button, Input, Textarea, Switch, Select, Calendar, ErrorState, EmptyState, Skeleton, all already present
