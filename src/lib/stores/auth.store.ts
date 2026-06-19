import { create } from "zustand";
import type { User } from "@/lib/types/auth";

const AUTH_FLAG_KEY = "auth_logged_in";

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
    const isLoggedIn =
      typeof localStorage !== "undefined" &&
      localStorage.getItem(AUTH_FLAG_KEY) === "true";
    set({ isAuthenticated: isLoggedIn, isLoading: false });
  },
  login: (user) => {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem(AUTH_FLAG_KEY, "true");
    }
    set({ user, isAuthenticated: true, isLoading: false, error: null });
  },
  logout: () => {
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(AUTH_FLAG_KEY);
    }
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  },
}));
