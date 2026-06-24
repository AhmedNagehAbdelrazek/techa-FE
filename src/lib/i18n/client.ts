"use client";

import { useI18nStore } from "@/lib/stores/i18n.store";
import { SUPPORTED_LOCALES } from "./types";

export function useTranslation() {
  const { locale, translations, setLocale } = useI18nStore();

  const t = (key: string, params?: Record<string, string | number>): string => {
    let value = translations[locale]?.[key] ?? key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        value = value.replace(`{{${k}}}`, String(v));
      }
    }
    return value;
  };

  const changeLocale = (newLocale: string) => {
    const target = SUPPORTED_LOCALES.find((l) => l.code === newLocale);
    if (target) {
      document.documentElement.dir = target.direction;
      document.documentElement.lang = target.code;
      setLocale(newLocale);
    }
  };

  const currentLocale = SUPPORTED_LOCALES.find((l) => l.code === locale);
  const direction = currentLocale?.direction ?? "ltr";

  return { t, locale, changeLocale, direction, supportedLocales: SUPPORTED_LOCALES };
}
