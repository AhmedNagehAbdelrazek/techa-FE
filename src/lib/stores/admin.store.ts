import { create } from "zustand";
import { clearAdminToken } from "@/lib/api/admin-token";
import { persist } from "zustand/middleware";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: Record<string, string[]>;
}

interface AdminState {
  admin: AdminUser | null;
  isAuthenticated: boolean;
  setAdmin: (admin: AdminUser) => void;
  logout: () => void;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set) => ({
      admin: null,
      isAuthenticated: false,
      setAdmin: (admin) => set({ admin, isAuthenticated: true }),
      logout: () => {
        clearAdminToken();
        set({ admin: null, isAuthenticated: false });
      },
    }),
    {
      name: "admin-auth-storage",
      partialize: (state) => ({
        admin: state.admin,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
