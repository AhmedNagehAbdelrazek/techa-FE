import { adminRequest } from "./AdminRequest";
import { getCategoryTree } from "./categories";
import { getBrands } from "./brands";
import type { Category } from "@/lib/types/category";

// ─── Types ─────────────────────────────────────────────

export interface AdminProductImage {
  id: string;
  url: string;
  alt_text: string;
  is_primary: boolean;
  sort_order: number;
}

export interface AdminVariantOption {
  option_name: string;
  option_value: string;
}

export interface AdminProductVariant {
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

export interface AdminProductAttribute {
  details: { label: string; value: string }[];
  specs: { label: string; value: string }[];
}

export interface AdminProductListItem {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  discount_percent: number;
  is_active: boolean;
  stock_qty: number;
  primary_image: { url: string; alt_text: string | null } | null;
  category: { id: string; name: string; slug: string } | null;
  brand: { id: string; name: string; slug: string } | null;
  created_at: string;
}

export interface AdminProduct {
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
  primary_image: { url: string; alt_text: string | null } | null;
  stock_qty: number;
  category: { id: string; name: string; slug: string } | null;
  brand: { id: string; name: string; slug: string } | null;
  tags: AdminTagOption[];
  attributes: AdminProductAttribute;
  images: AdminProductImage[];
  variants: AdminProductVariant[];
  created_at: string;
  updated_at: string;
}

export interface AdminProductListResponse {
  data: AdminProductListItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AdminCategoryOption {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface AdminBrandOption {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  is_active: boolean;
}

export interface AdminTagOption {
  id: string;
  name: string;
  slug: string;
}

export interface CreateProductPayload {
  name: string;
  slug?: string;
  category_id?: string | null;
  brand_id?: string | null;
  description?: string;
  about_points?: string[];
  base_price: number;
  discount_percent?: number;
  is_featured?: boolean;
  attributes?: AdminProductAttribute;
  tag_ids?: string[];
  images?: { url: string; alt_text: string; is_primary: boolean; sort_order: number }[];
  variants?: CreateVariantPayload[];
}

export interface UpdateProductPayload {
  name?: string;
  slug?: string;
  category_id?: string | null;
  brand_id?: string | null;
  description?: string;
  about_points?: string[];
  base_price?: number;
  discount_percent?: number;
  is_featured?: boolean;
  attributes?: AdminProductAttribute;
  tag_ids?: string[];
  images?: { url: string; alt_text: string; is_primary: boolean; sort_order: number }[];
  version: number;
  variants?: UpdateVariantPayload[];
}

export interface CreateVariantPayload {
  sku?: string;
  price: number;
  discount_percent?: number;
  stock_qty: number;
  options: AdminVariantOption[];
  images?: { url: string; alt_text: string; is_primary: boolean; sort_order: number }[];
}

export interface UpdateVariantPayload {
  id?: string;
  version?: number;
  sku?: string;
  price?: number;
  discount_percent?: number;
  stock_qty?: number;
  is_active?: boolean;
  options?: AdminVariantOption[];
  images?: { url: string; alt_text: string; is_primary: boolean; sort_order: number }[];
  _destroy?: boolean;
}

export interface AdminProductListParams {
  page?: number;
  limit?: number;
  search?: string;
  category_id?: string;
  brand_id?: string;
  is_active?: string;
  sort?: string;
}

export interface TagListResponse {
  data: AdminTagOption[];
}

export interface MediaUploadResponse {
  url: string;
  filename: string;
  cached: boolean;
}

export interface BulkActionPayload {
  ids: string[];
  action: "activate" | "deactivate";
}

// ─── Query Keys ─────────────────────────────────────────

export const adminProductsKeys = {
  all: ["admin", "products"] as const,
  lists: () => [...adminProductsKeys.all, "list"] as const,
  list: (params: AdminProductListParams) =>
    [...adminProductsKeys.lists(), params] as const,
  details: () => [...adminProductsKeys.all, "detail"] as const,
  detail: (id: string) => [...adminProductsKeys.details(), id] as const,
  categories: ["admin", "categories"] as const,
  brands: ["admin", "brands"] as const,
  tags: ["admin", "tags"] as const,
};

// ─── API Wrappers ───────────────────────────────────────

export function getProducts(params: AdminProductListParams): Promise<AdminProductListResponse> {
  const clean = Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v !== undefined),
  );
  return adminRequest.get<AdminProductListResponse>("/api/admin/products", { params: clean });
}

export function getProduct(id: string): Promise<AdminProduct> {
  return adminRequest.get<AdminProduct>(`/api/admin/products/${id}`);
}

export function createProduct(data: CreateProductPayload): Promise<AdminProduct> {
  return adminRequest.post<AdminProduct>("/api/admin/products", data);
}

export function updateProduct(id: string, data: UpdateProductPayload): Promise<AdminProduct> {
  return adminRequest.put<AdminProduct>(`/api/admin/products/${id}`, data);
}

export function deleteProduct(id: string): Promise<void> {
  return adminRequest.delete<void>(`/api/admin/products/${id}`);
}

export function bulkUpdateProducts(ids: string[], action: "activate" | "deactivate"): Promise<void> {
  return adminRequest.post<void>("/api/admin/products/bulk", { ids, action } as BulkActionPayload);
}

function flattenCategories(categories: Category[]): AdminCategoryOption[] {
  const result: AdminCategoryOption[] = [];
  function walk(list: Category[], parentId: string | null) {
    for (const cat of list) {
      result.push({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        parent_id: parentId,
        image_url: cat.image_url,
        sort_order: cat.sort_order,
        is_active: cat.is_active,
      });
      if (cat.children.length > 0) {
        walk(cat.children, cat.id);
      }
    }
  }
  walk(categories, null);
  return result;
}

export function getCategoryOptions(): Promise<AdminCategoryOption[]> {
  return getCategoryTree().then(flattenCategories);
}

export function getBrandOptions(): Promise<AdminBrandOption[]> {
  return getBrands().then((brands) =>
    brands.map((b) => ({
      id: b.id,
      name: b.name,
      slug: b.slug,
      logo_url: b.logo_url,
      is_active: true,
    })),
  );
}

export function getTagOptions(): Promise<AdminTagOption[]> {
  return adminRequest
    .get<TagListResponse>("/api/tags")
    .then((res) => res.data);
}

export function uploadMedia(file: File): Promise<MediaUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  return adminRequest.post<MediaUploadResponse>("/api/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}
