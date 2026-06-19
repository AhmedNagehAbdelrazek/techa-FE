"use client";

import { create } from "zustand";

interface SettingsState {
  siteName: string;
  logoUrl: string | null;
  currencyCode: string;
  currencySymbol: string;
  socialLinks: Record<string, string>;
  supportEmail: string | null;
  supportPhone: string | null;
  isLoading: boolean;
  error: string | null;
  setSettings: (settings: Partial<SettingsState>) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  siteName: "Techa",
  logoUrl: null,
  currencyCode: "SAR",
  currencySymbol: "ر.س",
  socialLinks: {},
  supportEmail: null,
  supportPhone: null,
  isLoading: true,
  error: null,
  setSettings: (settings) =>
    set((state) => ({ ...state, ...settings, isLoading: false, error: null })),
}));
