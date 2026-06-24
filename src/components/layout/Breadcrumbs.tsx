"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useTranslation } from "@/lib/i18n/client";

export function Breadcrumbs() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const segmentLabels: Record<string, string> = {
    admin: t("Dashboard"),
    products: t("Products"),
    categories: t("Categories"),
    brands: t("Brands"),
    tags: t("Tags"),
    orders: t("Orders"),
    coupons: t("Coupons"),
    reviews: t("Reviews"),
    banners: t("Banners"),
    "delivery-zones": t("Delivery Zones"),
    media: t("Media"),
    settings: t("Settings"),
    admins: t("Admins"),
    roles: t("Roles"),
  };
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-muted-foreground">
      {segments.map((segment, index) => {
        const href = "/" + segments.slice(0, index + 1).join("/");
        const label = segmentLabels[segment] ?? segment.replace(/-/g, " ");
        const isLast = index === segments.length - 1;

        return (
          <span key={href} className="flex items-center gap-1">
            {index > 0 && <ChevronLeft className="size-3" />}
            {isLast ? (
              <span className="font-medium text-foreground capitalize">{label}</span>
            ) : (
              <Link href={href} className="hover:text-foreground transition-colors capitalize">
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
