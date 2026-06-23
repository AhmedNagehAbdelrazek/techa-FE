import { adminRequest } from "./AdminRequest";

// ─── Categories ──────────────────────────────────────────

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  parent_id: string | null;
  children: AdminCategory[];
}

export function getAdminCategories(): Promise<AdminCategory[]> {
  return adminRequest.get<AdminCategory[]>("/api/admin/categories/tree");
}

export function createAdminCategory(data: {
  name: string;
  slug: string;
  parent_id?: string | null;
  image_url?: string | null;
  sort_order?: number;
  is_active?: boolean;
}): Promise<AdminCategory> {
  return adminRequest.post<AdminCategory>("/api/admin/categories", data);
}

export function updateAdminCategory(
  id: string,
  data: Partial<{
    name: string;
    slug: string;
    parent_id: string | null;
    image_url: string | null;
    sort_order: number;
    is_active: boolean;
  }>,
): Promise<AdminCategory> {
  return adminRequest.put<AdminCategory>(`/api/admin/categories/${id}`, data);
}

export function deactivateAdminCategory(id: string): Promise<void> {
  return adminRequest.delete<void>(`/api/admin/categories/${id}`);
}

// ─── Brands ──────────────────────────────────────────────

export interface AdminBrand {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
  is_active: boolean;
}

export interface AdminBrandListResponse {
  data: AdminBrand[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export function getAdminBrands(params: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<AdminBrandListResponse> {
  const clear = Object.fromEntries(
    Object.entries(params).map(([k, v]) => [k, v === "" ? undefined : v]),
  );
  return adminRequest.get<AdminBrandListResponse>("/api/admin/brands", { params: clear });
}

export function createAdminBrand(data: {
  name: string;
  slug: string;
  logo_url?: string | null;
  description?: string | null;
  is_active?: boolean;
}): Promise<AdminBrand> {
  return adminRequest.post<AdminBrand>("/api/admin/brands", data);
}

export function updateAdminBrand(
  id: string,
  data: Partial<{
    name: string;
    slug: string;
    logo_url: string | null;
    description: string | null;
    is_active: boolean;
  }>,
): Promise<AdminBrand> {
  return adminRequest.put<AdminBrand>(`/api/admin/brands/${id}`, data);
}

export function deactivateAdminBrand(id: string): Promise<void> {
  return adminRequest.delete<void>(`/api/admin/brands/${id}`);
}

// ─── Tags ────────────────────────────────────────────────

export interface AdminTag {
  id: string;
  name: string;
  slug: string;
}

export function getAdminTags(): Promise<AdminTag[]> {
  return adminRequest.get<AdminTag[]>("/api/tags");
}

export function createAdminTag(data: { name: string; slug: string }): Promise<AdminTag> {
  return adminRequest.post<AdminTag>("/api/admin/tags", data);
}

export function updateAdminTag(id: string, data: { name?: string; slug?: string }): Promise<AdminTag> {
  return adminRequest.put<AdminTag>(`/api/admin/tags/${id}`, data);
}

export function deleteAdminTag(id: string): Promise<void> {
  return adminRequest.delete<void>(`/api/admin/tags/${id}`);
}

// ─── Query Keys ──────────────────────────────────────────

export const adminTaxonomyKeys = {
  all: ["admin", "taxonomy"] as const,
  categories: () => [...adminTaxonomyKeys.all, "categories"] as const,
  brands: () => [...adminTaxonomyKeys.all, "brands"] as const,
  tags: () => [...adminTaxonomyKeys.all, "tags"] as const,
};
