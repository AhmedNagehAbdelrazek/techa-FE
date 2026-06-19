import { create } from "zustand";
import type { User } from "@/lib/types/auth";
import { AUTH_COOKIE_NAME } from "@/lib/auth/constants";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  hydrateFromStorage: () => void;
  login: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  hydrateFromStorage: () => {
    const hasCookie =
      typeof document !== "undefined" &&
      document.cookie
        .split(";")
        .some((c) => c.trim().startsWith(`${AUTH_COOKIE_NAME}=`));
    set({ isAuthenticated: hasCookie, isLoading: false });
  },
  login: (user) =>
    set({ user, isAuthenticated: true, isLoading: false, error: null }),
  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    }),
}));
