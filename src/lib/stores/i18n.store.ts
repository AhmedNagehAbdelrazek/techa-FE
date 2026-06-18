import { create } from "zustand";
import { persist } from "zustand/middleware";

interface I18nState {
  locale: string;
  translations: Record<string, Record<string, string>>;
  setLocale: (locale: string) => void;
  setTranslations: (translations: Record<string, Record<string, string>>) => void;
  t: (key: string) => string;
}

export const useI18nStore = create<I18nState>()(
  persist(
    (set, get) => ({
      locale: "en",
      translations: {},
      setLocale: (locale) => set({ locale }),
      setTranslations: (translations) => set({ translations }),
      t: (key) => {
        const { locale, translations } = get();
        return translations[locale]?.[key] ?? key;
      },
    }),
    { name: "locale-preference", partialize: (state) => ({ locale: state.locale }) },
  ),
);
