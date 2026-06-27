"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useI18nStore } from "@/lib/stores/i18n.store";
import { SUPPORTED_LOCALES } from "./types";
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
  const pathname = usePathname();

  useEffect(() => {
    if (initialTranslations) {
      setTranslations(initialTranslations);
    }
  }, [initialTranslations, setTranslations]);

  useEffect(() => {
    if (initialLocale && initialLocale !== locale) {
      setLocale(initialLocale);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const localeFromPath = pathname.split("/")[1];
    const target = SUPPORTED_LOCALES.find((l) => l.code === localeFromPath)?.code;
    if (target && target !== locale) {
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
