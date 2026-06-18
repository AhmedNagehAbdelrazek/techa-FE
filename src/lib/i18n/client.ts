"use client";

import { useI18nStore } from "@/lib/stores/i18n.store";
import { SUPPORTED_LOCALES } from "./types";

export function useTranslation() {
  const { locale, translations, setLocale } = useI18nStore();

  const t = (key: string): string => {
    return translations[locale]?.[key] ?? key;
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
