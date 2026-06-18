import { create } from "zustand";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatarUrl: string | null;
}

type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated";

interface AuthState {
  user: User | null;
  status: AuthStatus;
  setUser: (user: User | null) => void;
  setStatus: (status: AuthStatus) => void;
  login: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: "idle",
  setUser: (user) => set({ user }),
  setStatus: (status) => set({ status }),
  login: (user) => set({ user, status: "authenticated" }),
  logout: () => set({ user: null, status: "unauthenticated" }),
}));
