# Data Model: Admin Products

## Types (TypeScript)

```typescript
// ─── Product ───────────────────────────────────────────

interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  category_id: string | null;
  brand_id: string | null;
  description: string;
  about_points: string[];
  base_price: number;
  discount_percent: number;
  is_active: boolean;
  is_featured: boolean;
  version: number;
  primary_image: { url: string; alt_text: string } | null;
  stock_qty: number; // sum of variant stock_qty
  category: { id: string; name: string; slug: string } | null;
  brand: { id: string; name: string; slug: string } | null;
  tags: AdminTag[];
  attributes: AdminProductAttribute[];
  images: AdminProductImage[];
  variants: AdminProductVariant[];
  created_at: string;
  updated_at: string;
}

interface AdminProductListItem {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  discount_percent: number;
  is_active: boolean;
  stock_qty: number;
  primary_image: { url: string; alt_text: string } | null;
  category: { id: string; name: string; slug: string } | null;
  brand: { id: string; name: string; slug: string } | null;
  created_at: string;
}

interface AdminProductListResponse {
  data: AdminProductListItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ─── Product Variant ───────────────────────────────────

interface AdminProductVariant {
  id: string;
  product_id: string;
  sku: string;
  price: number;
  discount_percent: number;
  stock_qty: number;
  is_active: boolean;
  version: number;
  options: AdminVariantOption[];
  images: AdminProductImage[];
}

interface AdminVariantOption {
  option_name: string;
  option_value: string;
}

// ─── Product Image ─────────────────────────────────────

interface AdminProductImage {
  id: string;
  url: string;
  alt_text: string;
  is_primary: boolean;
  sort_order: number;
}

// ─── Product Attribute ─────────────────────────────────

interface AdminProductAttribute {
  id?: string;
  section: "details" | "specs";
  label: string;
  value: string;
  sort_order: number;
}

// ─── Category (for dropdown) ───────────────────────────

interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
}

// ─── Brand (for dropdown) ──────────────────────────────

interface AdminBrand {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  is_active: boolean;
}

// ─── Tag ───────────────────────────────────────────────

interface AdminTag {
  id: string;
  name: string;
  slug: string;
}

// ─── Media Upload ──────────────────────────────────────

interface MediaUploadResponse {
  url: string;
  filename: string;
  size: number;
}

// ─── Create / Update Payloads ─────────────────────────

interface CreateProductPayload {
  name: string;
  slug?: string;
  category_id?: string | null;
  brand_id?: string | null;
  description?: string;
  about_points?: string[];
  base_price: number;
  discount_percent?: number;
  is_featured?: boolean;
  attributes?: Omit<AdminProductAttribute, "id">[];
  tag_ids?: string[];
  images?: { url: string; alt_text: string; is_primary: boolean; sort_order: number }[];
  variants?: CreateVariantPayload[];
}

interface UpdateProductPayload extends Partial<CreateProductPayload> {
  version: number; // optimistic locking
  variants?: UpdateVariantPayload[];
  images?: { url: string; alt_text: string; is_primary: boolean; sort_order: number }[];
}

interface CreateVariantPayload {
  sku?: string;
  price: number;
  discount_percent?: number;
  stock_qty: number;
  options: AdminVariantOption[];
  images?: { url: string; alt_text: string; is_primary: boolean; sort_order: number }[];
}

interface UpdateVariantPayload {
  id?: string; // present for existing variants
  version?: number; // required when id is present (optimistic locking)
  sku?: string;
  price?: number;
  discount_percent?: number;
  stock_qty?: number;
  is_active?: boolean;
  options?: AdminVariantOption[];
  images?: { url: string; alt_text: string; is_primary: boolean; sort_order: number }[];
  _destroy?: boolean; // true to remove this variant
}

// ─── Product List Query Params ─────────────────────────

interface AdminProductListParams {
  page?: number;
  limit?: number;
  search?: string;
  category_id?: string;
  brand_id?: string;
  is_active?: boolean | string;
  sort?: string;
}

// ─── Bulk Action ───────────────────────────────────────

interface BulkActionPayload {
  ids: string[];
  action: "activate" | "deactivate";
}
```

### UI State Types

```typescript
type SectionState<T> =
  | { status: "idle" | "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: Error };

type FormMode = "create" | "edit";
```

### React Query Keys

```typescript
const adminProductKeys = {
  all: ["admin", "products"] as const,
  lists: () => [...adminProductKeys.all, "list"] as const,
  list: (params: AdminProductListParams) =>
    [...adminProductKeys.lists(), params] as const,
  details: () => [...adminProductKeys.all, "detail"] as const,
  detail: (id: string) => [...adminProductKeys.details(), id] as const,
  categories: ["admin", "categories"] as const,
  brands: ["admin", "brands"] as const,
  tags: ["admin", "tags"] as const,
};
```
