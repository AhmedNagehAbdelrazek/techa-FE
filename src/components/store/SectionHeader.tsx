"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/client";
import { ArrowRight } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  href?: string;
  className?: string;
}

export function SectionHeader({ title, href, className }: SectionHeaderProps) {
  const { t } = useTranslation();
  return (
    <div className={cn("flex items-center justify-between mb-4", className)}>
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      {href && (
        <Link
          href={href}
          className="text-sm font-semibold text-primary hover:underline flex items-center gap-1"
        >
          {t("View All")} <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
