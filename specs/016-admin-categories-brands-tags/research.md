# Research: Admin Panel — Categories, Brands & Tags

## Tech Stack Decisions

### API Client Pattern
- **Decision**: Use `adminRequest` from `src/lib/api/AdminRequest.ts`
- **Rationale**: Same pattern as Phases 13/14/15 — separate axios instance with admin auth interceptor (`admin_access_token` from localStorage). All admin API calls go through this.
- **Alternatives**: Using `Request.ts` (customer client) — rejected because admin auth uses a different token storage mechanism.

### State Management
- **Decision**: TanStack React Query v5 for server state; no Zustand for taxonomy state
- **Rationale**: All taxonomy data is server-state fetched from API. React Query handles caching, invalidation, and refetching. Zustand not needed — data is fetched fresh on page load.
- **Alternatives**: Zustand store for categories tree — rejected because categories rarely change and React Query caching (staleTime: Infinity) is sufficient.

### Permission Gating
- **Decision**: `useAdminStore` with `EMPTY_PERMISSIONS` hoisted pattern (same as Phases 14/15)
- **Rationale**: Granular permissions: `categories.read` gates page access, `categories.create` gates add button, `categories.update` gates edit, `categories.delete` gates deactivate. Same for `brands.*` and `tags.*`. Clarified during `/speckit.clarify`.
- **Alternatives**: Combined `categories.write` — rejected because it's inconsistent with existing `products.update`/`products.delete` granular pattern.

### Form Validation
- **Decision**: Use `react-hook-form` with `zod` for category and brand forms
- **Rationale**: Category and brand forms have multiple fields (name, slug, image, sort_order, is_active) with validation requirements (slug auto-generation, required name). react-hook-form + zod is already installed and used in Phase 14 admin products form.
- **Alternatives**: Plain `useState` — rejected because form fields have interdependent validation (slug sync with name).

### Category Tree Pattern
- **Decision**: Recursive React component rendering a nested `<ul>` with indentation via `padding-left` per level
- **Rationale**: Categories are fetched as a nested tree from the API. A recursive component renders each node with its children. Expand/collapse uses local `useState` per node. Same pattern as a typical file tree UI.
- **Alternatives**: Flat list with parent_id mapping — rejected because API returns nested structure directly.

### Tags Edit Pattern
- **Decision**: Inline edit for tags (click Edit → field becomes an input, save on Enter/blur)
- **Rationale**: Tags have only a name field, making full Dialog over-engineered. Inline editing is faster and matches the spec requirement "simple list with inline edit/delete".
- **Alternatives**: Dialog for tag edit — rejected as unnecessarily heavyweight for a single-field edit.

### Form Dialog Pattern
- **Decision**: Create and Edit share the same Dialog component with an `initialData` prop (null for create, populated for edit)
- **Rationale**: Same pattern as Phase 14 product form tabs (though that uses a page, not Dialog). The form fields are identical for create and edit.
- **Alternatives**: Separate create/edit pages — rejected because admin taxonomy is simple CRUD; Dialog is lighter and faster.

### Pagination Pattern
- **Decision**: Brands table uses server-side pagination at 20/page; categories and tags are full-list (not paginated)
- **Rationale**: Brands typically number in the dozens/hundreds, same as products. Categories are hierarchically structured (can't paginate a tree). Tags are simple labels that rarely exceed 100.
- **Note**: If brands count exceeds 1000, add pagination.

## Existing Code Patterns

### React Query Keys (from admin-products.ts, admin-orders.ts)
```typescript
export const adminTaxonomyKeys = {
  all: ["admin", "taxonomy"] as const,
  categories: () => [...adminTaxonomyKeys.all, "categories"] as const,
  category: (id: string) => [...adminTaxonomyKeys.categories(), id] as const,
  brands: () => [...adminTaxonomyKeys.all, "brands"] as const,
  brand: (id: string) => [...adminTaxonomyKeys.brands(), id] as const,
  tags: () => [...adminTaxonomyKeys.all, "tags"] as const,
  tag: (id: string) => [...adminTaxonomyKeys.tags(), id] as const,
};
```

### Skeleton Export Pattern
Each component exports `*Skeleton` for loading states. Skeletons are separate named exports using shadcn `<Skeleton />`.

### Permission Check Pattern (EMPTY_PERMISSIONS)
```typescript
const EMPTY_PERMISSIONS: Record<string, string[]> = {};
const permissions = useAdminStore((s) => s.admin?.permissions ?? EMPTY_PERMISSIONS);
const canCreate = permissions["categories"]?.includes("create") ?? false;
const canUpdate = permissions["categories"]?.includes("update") ?? false;
const canDelete = permissions["categories"]?.includes("delete") ?? false;
```

### Dialog CRUD Pattern (from ShopAdminFeatureForm)
```typescript
// Dialog + form pattern used in admin features:
// - Dialog opens on "Add" / "Edit" button click
// - Form inside Dialog uses react-hook-form + zod
// - On submit, calls create or update mutation
// - On success, invalidates list query, closes Dialog, shows toast
// - On error, shows toast with error message
```

### Empty State Pattern
```typescript
<div className="rounded-md border">
  <EmptyState
    title="No categories yet"
    description="Add your first category to organize products."
    action={canCreate ? <Button onClick={openAddDialog}>Add Category</Button> : undefined}
  />
</div>
```

### Error State Pattern
```typescript
<ErrorState
  title="Failed to load categories"
  message={(error as Error)?.message}
  onRetry={() => refetch()}
/>
```

## Backend API Endpoints

From Postman collection and spec:

### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/categories` | List all categories (nested tree) |
| POST | `/api/admin/categories` | Create category |
| PUT | `/api/admin/categories/:id` | Update category |
| DELETE | `/api/admin/categories/:id` | Deactivate category (soft delete) |

### Brands
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/brands` | List brands (paginated) |
| POST | `/api/admin/brands` | Create brand |
| PUT | `/api/admin/brands/:id` | Update brand |
| DELETE | `/api/admin/brands/:id` | Deactivate brand (soft delete) |

### Tags
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/tags` | List all tags |
| POST | `/api/admin/tags` | Create tag |
| PUT | `/api/admin/tags/:id` | Update tag |
| DELETE | `/api/admin/tags/:id` | Delete tag (hard delete) |

## No New NPM Packages

All required dependencies are already in `package.json`:
- `lucide-react` — icons (ChevronDown, ChevronRight, Plus, Edit2, Trash2, etc.)
- `sonner` — toasts
- `@tanstack/react-query` — server state
- `zustand` — `useAdminStore` (already exists)
- `react-hook-form` + `zod` + `@hookform/resolvers` — form validation (already installed, used in Phase 14)
- shadcn/ui components: Table, Dialog, AlertDialog, Badge, Button, Input, Select, Textarea, Checkbox, Label, Form (all already present)
