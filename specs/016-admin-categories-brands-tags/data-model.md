# Data Model: Admin Categories, Brands & Tags

## Types (TypeScript)

```typescript
// ─── Category ──────────────────────────────────────────

interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  parent_id: string | null;
  children: AdminCategory[];
}

interface AdminCategoryListResponse {
  data: AdminCategory[];
}

interface AdminCategoryFormData {
  name: string;
  slug: string;
  parent_id: string | null;
  image_url: string;
  sort_order: number;
  is_active: boolean;
}

// ─── Brand ─────────────────────────────────────────────

interface AdminBrand {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  is_active: boolean;
}

interface AdminBrandListResponse {
  data: AdminBrand[];
  meta: PaginationMeta;
}

interface AdminBrandFormData {
  name: string;
  slug: string;
  description: string;
  logo_url: string;
  is_active: boolean;
}

// ─── Tag ───────────────────────────────────────────────

interface AdminTag {
  id: string;
  name: string;
  slug: string;
}

interface AdminTagListResponse {
  data: AdminTag[];
}

interface AdminTagFormData {
  name: string;
}

// ─── Shared ────────────────────────────────────────────

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
```

## State Transitions

### Category
- `is_active: true` → admin deactivates → `is_active: false` (soft delete)
- `is_active: false` → admin can reactivate → `is_active: true` (no bulk actions, manual toggle)
- Note: Deactivation fails with 409 if category has active products.

### Brand
- `is_active: true` → admin deactivates → `is_active: false` (soft delete)
- `is_active: false` → admin can reactivate → `is_active: true`
- Note: Deactivation fails with 409 if brand has active products.

### Tag
- Exists → admin deletes → removed permanently (hard delete)
- No active/inactive state.

## React Query Keys

```typescript
export const adminTaxonomyKeys = {
  all: ["admin", "taxonomy"] as const,
  categories: () => [...adminTaxonomyKeys.all, "categories"] as const,
  brands: () => [...adminTaxonomyKeys.all, "brands"] as const,
  tags: () => [...adminTaxonomyKeys.all, "tags"] as const,
};
```

## API Endpoint Summary

| Resource | Method | Endpoint | Request Body | Response |
|----------|--------|----------|-------------|----------|
| Categories | GET | `/api/admin/categories` | — | `{ data: AdminCategory[] }` |
| Categories | POST | `/api/admin/categories` | `AdminCategoryFormData` | `AdminCategory` |
| Categories | PUT | `/api/admin/categories/:id` | Partial `AdminCategoryFormData` | `AdminCategory` |
| Categories | DELETE | `/api/admin/categories/:id` | — | `{ message }` |
| Brands | GET | `/api/admin/brands?page=&limit=` | — | `AdminBrandListResponse` |
| Brands | POST | `/api/admin/brands` | `AdminBrandFormData` | `AdminBrand` |
| Brands | PUT | `/api/admin/brands/:id` | Partial `AdminBrandFormData` | `AdminBrand` |
| Brands | DELETE | `/api/admin/brands/:id` | — | `{ message }` |
| Tags | GET | `/api/admin/tags` | — | `{ data: AdminTag[] }` |
| Tags | POST | `/api/admin/tags` | `AdminTagFormData` | `AdminTag` |
| Tags | PUT | `/api/admin/tags/:id` | `AdminTagFormData` | `AdminTag` |
| Tags | DELETE | `/api/admin/tags/:id` | — | `{ message }` |
