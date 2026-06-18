"use client";

import { useEffect } from "react";
import { useI18nStore } from "@/lib/stores/i18n.store";
import type { Translations } from "./types";

interface I18nProviderProps {
  children: React.ReactNode;
  initialTranslations?: Translations;
}

export function I18nProvider({
  children,
  initialTranslations,
}: I18nProviderProps) {
  const { setTranslations, locale } = useI18nStore();

  useEffect(() => {
    if (initialTranslations) {
      setTranslations(initialTranslations);
    }
  }, [initialTranslations, setTranslations]);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return <>{children}</>;
}
