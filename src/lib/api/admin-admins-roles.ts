import { adminRequest } from "./AdminRequest";

// ponytail: inline types, no separate types file
export interface AdminAccount {
  id: string;
  name: string;
  email: string;
  role: string | { id: number; name: string };
  is_active: boolean;
  created_at: string;
}

export interface AdminRole {
  id: string;
  name: string;
  permissions: Record<string, string[]>;
  is_active: boolean;
}

export const adminAdminsRolesKeys = {
  all: ["admin", "admins-roles"] as const,
  admins: () => [...adminAdminsRolesKeys.all, "admins"] as const,
  roles: () => [...adminAdminsRolesKeys.all, "roles"] as const,
};

// ─── Admins ────────────────────────────────────────

export function getAdmins() {
  return adminRequest.get<AdminAccount[]>("/api/admin/admins");
}

export function createAdmin(data: { name: string; email: string; password: string; role_id: number }) {
  return adminRequest.post("/api/admin/admins", data);
}

export function updateAdmin(id: string, data: { name?: string; email?: string; password?: string; role_id?: number; is_active?: boolean }) {
  return adminRequest.put(`/api/admin/admins/${id}`, data);
}

export function deactivateAdmin(id: string) {
  return adminRequest.delete(`/api/admin/admins/${id}`);
}

// ─── Roles ─────────────────────────────────────────

export function getRoles() {
  return adminRequest.get<AdminRole[]>("/api/admin/roles");
}

export function createRole(data: { name: string; permissions: Record<string, string[]> }) {
  return adminRequest.post("/api/admin/roles", data);
}

export function updateRole(id: string, data: { name?: string; permissions?: Record<string, string[]> }) {
  return adminRequest.put(`/api/admin/roles/${id}`, data);
}

export function deactivateRole(id: string) {
  return adminRequest.delete(`/api/admin/roles/${id}`);
}
