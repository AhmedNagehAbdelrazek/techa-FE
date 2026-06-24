import { create } from "zustand";
import { persist } from "zustand/middleware";

interface I18nState {
  locale: string;
  translations: Record<string, Record<string, string>>;
  setLocale: (locale: string) => void;
  setTranslations: (translations: Record<string, Record<string, string>>) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

export const useI18nStore = create<I18nState>()(
  persist(
    (set, get) => ({
      locale: "en",
      translations: {},
      setLocale: (locale) => set({ locale }),
      setTranslations: (translations) => set({ translations }),
      t: (key, params) => {
        const { locale, translations } = get();
        let value = translations[locale]?.[key] ?? key;
        if (params) {
          for (const [k, v] of Object.entries(params)) {
            value = value.replace(`{{${k}}}`, String(v));
          }
        }
        return value;
      },
    }),
    { name: "locale-preference", partialize: (state) => ({ locale: state.locale }) },
  ),
);
