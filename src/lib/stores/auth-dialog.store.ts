import { create } from "zustand";

interface AuthDialogStore {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

// 🐴 ponytail: minimal global store, no persist needed — ephemeral dialog state
export const useAuthDialogStore = create<AuthDialogStore>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
