import { adminRequest } from "./AdminRequest";

// ─── Banners ──────────────────────────────────────────

export interface AdminBanner {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  link_url: string | null;
  position: string;
  sort_order: number;
  starts_at: string;
  ends_at: string | null;
  is_active: boolean;
}

export function getBanners(): Promise<{ data: AdminBanner[] }> {
  return adminRequest.get("/api/admin/banners");
}

export function createBanner(data: Partial<AdminBanner>): Promise<{ data: AdminBanner }> {
  return adminRequest.post("/api/admin/banners", data);
}

export function updateBanner(id: string, data: Partial<AdminBanner>): Promise<{ data: AdminBanner }> {
  return adminRequest.put(`/api/admin/banners/${id}`, data);
}

export function deleteBanner(id: string): Promise<void> {
  return adminRequest.delete(`/api/admin/banners/${id}`);
}

// ─── Settings ──────────────────────────────────────────

export interface Setting {
  key: string;
  value: string | number | boolean;
  type: string;
  is_active: boolean;
}

export function getSettings(): Promise<{ data: Record<string, Setting[]> }> {
  return adminRequest.get("/api/admin/settings");
}

export function updateSettings(payload: { settings: Record<string, string | number | boolean> }): Promise<void> {
  return adminRequest.put("/api/admin/settings", payload);
}

// ─── Media ────────────────────────────────────────────

export interface AdminMediaFile {
  id: string;
  url: string;
  filename: string;
  mime_type: string;
  file_size: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function getMedia(params: { page?: number; limit?: number }): Promise<{ data: AdminMediaFile[]; meta: PaginationMeta }> {
  return adminRequest.get("/api/admin/media", { params });
}

export function uploadMedia(files: File[]): Promise<{ data: AdminMediaFile[] }> {
  const form = new FormData();
  files.forEach((f) => form.append("files", f));
  return adminRequest.post("/api/admin/media", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export function deleteMedia(id: string): Promise<void> {
  return adminRequest.delete(`/api/admin/media/${id}`);
}

// ─── Query Keys ───────────────────────────────────────

export const adminBannerSettingsKeys = {
  all: ["admin", "banners-settings"] as const,
  banners: () => [...adminBannerSettingsKeys.all, "banners"] as const,
  settings: () => [...adminBannerSettingsKeys.all, "settings"] as const,
  media: () => [...adminBannerSettingsKeys.all, "media"] as const,
};
