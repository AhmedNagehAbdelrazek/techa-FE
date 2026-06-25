"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/client";

interface SectionHeaderProps {
  title: string;
  href?: string;
  className?: string;
}

export function SectionHeader({ title, href, className }: SectionHeaderProps) {
  const { t } = useTranslation();
  return (
    <div
      className={cn(
        "mb-8 flex items-center justify-between",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <span className="bg-primary/80 dark:bg-primary size-1 rounded-full" />
        <h2 className="font-display text-lg font-bold tracking-wider sm:text-xl">{title}</h2>
      </div>
      {href && (
        <Link
          href={href}
          className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          {t("View All")} →
        </Link>
      )}
    </div>
  );
}
