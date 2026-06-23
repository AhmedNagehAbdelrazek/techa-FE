"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

const segmentLabels: Record<string, string> = {
  admin: "Dashboard",
  products: "Products",
  categories: "Categories",
  brands: "Brands",
  tags: "Tags",
  orders: "Orders",
  coupons: "Coupons",
  banners: "Banners",
  "delivery-zones": "Delivery Zones",
  media: "Media",
  settings: "Settings",
  admins: "Admins",
};

export function Breadcrumbs() {
  const pathname = usePathname();
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
