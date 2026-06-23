"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Tag,
  Tags,
  ShoppingBag,
  Percent,
  Image,
  MapPin,
  Settings,
  Shield,
  ShieldCheck,
  CreditCard,
  ImagePlus,
  MessageSquare,
} from "lucide-react";

const navLinks = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Categories", href: "/admin/categories", icon: FolderTree },
  { label: "Brands", href: "/admin/brands", icon: Tag },
  { label: "Tags", href: "/admin/tags", icon: Tags },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { label: "Payments", href: "/admin/payments", icon: CreditCard },
  { label: "Coupons", href: "/admin/coupons", icon: Percent },
  { label: "Reviews", href: "/admin/reviews", icon: MessageSquare },
  { label: "Banners", href: "/admin/banners", icon: Image },
  { label: "Delivery Zones", href: "/admin/delivery-zones", icon: MapPin },
  { label: "Media", href: "/admin/media", icon: ImagePlus },
  { label: "Settings", href: "/admin/settings", icon: Settings },
  { label: "Admins", href: "/admin/admins", icon: Shield },
  { label: "Roles", href: "/admin/roles", icon: ShieldCheck },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 flex-col border-l bg-background">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/admin" className="text-lg font-bold tracking-tight">
          Techa Admin
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive =
              link.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
