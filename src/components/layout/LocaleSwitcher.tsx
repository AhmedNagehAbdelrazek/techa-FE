"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n/client";

export function LocaleSwitcher() {
  const { locale, changeLocale, supportedLocales } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();

  const nextLocale = supportedLocales.find((l) => l.code !== locale);

  function handleSwitch() {
    if (!nextLocale) return;
    const currentPath = pathname.replace(/^\/(en|ar)(\/|$)/, "/");
    const target = `/${nextLocale.code}${currentPath}`;
    changeLocale(nextLocale.code);
    router.push(target);
  }

  return (
    <button
      onClick={handleSwitch}
      className="rounded-md border px-3 py-1 text-xs font-medium hover:bg-accent"
      title={nextLocale?.label}
    >
      {nextLocale?.code.toUpperCase() ?? locale.toUpperCase()}
    </button>
  );
}
