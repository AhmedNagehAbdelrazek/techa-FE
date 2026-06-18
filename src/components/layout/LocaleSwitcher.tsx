"use client";

import { useTranslation } from "@/lib/i18n/client";

export function LocaleSwitcher() {
  const { locale, changeLocale, supportedLocales } = useTranslation();

  const nextLocale = supportedLocales.find((l) => l.code !== locale);

  return (
    <button
      onClick={() => nextLocale && changeLocale(nextLocale.code)}
      className="rounded-md border px-3 py-1 text-xs font-medium hover:bg-accent"
      title={nextLocale?.label}
    >
      {nextLocale?.code.toUpperCase() ?? locale.toUpperCase()}
    </button>
  );
}
