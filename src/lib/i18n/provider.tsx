"use client";

import { useEffect } from "react";
import { useI18nStore } from "@/lib/stores/i18n.store";
import type { Translations } from "./types";

interface I18nProviderProps {
  children: React.ReactNode;
  initialTranslations?: Translations;
  initialLocale?: string;
}

export function I18nProvider({
  children,
  initialTranslations,
  initialLocale,
}: I18nProviderProps) {
  const { setTranslations, setLocale, locale } = useI18nStore();

  useEffect(() => {
    if (initialTranslations) {
      setTranslations(initialTranslations);
    }
  }, [initialTranslations, setTranslations]);

  useEffect(() => {
    if (initialLocale && initialLocale !== locale) {
      setLocale(initialLocale);
    }
  }, [initialLocale, setLocale, locale]);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return <>{children}</>;
}
