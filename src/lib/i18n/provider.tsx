"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useI18nStore } from "@/lib/stores/i18n.store";
import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from "./types";
import type { Translations } from "./types";

interface I18nProviderProps {
  children: React.ReactNode;
  initialTranslations?: Translations;
  initialLocale?: string;
}

export function I18nProvider({
  children,
  initialTranslations,
}: I18nProviderProps) {
  const { setTranslations, setLocale, locale } = useI18nStore();
  const pathname = usePathname();

  useEffect(() => {
    if (initialTranslations) {
      setTranslations(initialTranslations);
    }
  }, [initialTranslations, setTranslations]);

  useEffect(() => {
    const localeFromPath = pathname.split("/")[1];
    const target = SUPPORTED_LOCALES.find((l) => l.code === localeFromPath)?.code ?? DEFAULT_LOCALE;
    if (target !== locale) {
      setLocale(target);
    }
  }, [pathname, setLocale, locale]);

  useEffect(() => {
    const target = SUPPORTED_LOCALES.find((l) => l.code === locale);
    if (target) {
      document.documentElement.lang = target.code;
      document.documentElement.dir = target.direction;
    }
  }, [locale]);

  return <>{children}</>;
}
