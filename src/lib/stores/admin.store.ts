import { create } from "zustand";
import { clearAdminToken } from "@/lib/api/admin-token";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
}

interface AdminState {
  admin: AdminUser | null;
  isAuthenticated: boolean;
  setAdmin: (admin: AdminUser) => void;
  logout: () => void;
}

export const useAdminStore = create<AdminState>()((set) => ({
  admin: null,
  isAuthenticated: false,
  setAdmin: (admin) => set({ admin, isAuthenticated: true }),
  logout: () => {
    clearAdminToken();
    set({ admin: null, isAuthenticated: false });
  },
}));
