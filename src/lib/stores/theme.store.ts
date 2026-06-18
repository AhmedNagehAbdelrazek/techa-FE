import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ThemeState {
  palette: string;
  mode: "light" | "dark";
  setPalette: (palette: string) => void;
  setMode: (mode: "light" | "dark") => void;
  toggleMode: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      palette: "default",
      mode: "light",
      setPalette: (palette) => set({ palette }),
      setMode: (mode) => set({ mode }),
      toggleMode: () => set({ mode: get().mode === "light" ? "dark" : "light" }),
    }),
    { name: "theme-preference" },
  ),
);
