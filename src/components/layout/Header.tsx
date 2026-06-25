"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ShoppingCart, Heart, User, LogOut, Package, Settings, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { NotificationBell } from "@/components/store/NotificationBell";
import { Logo } from "@/components/layout/Logo";
import { MobileNav } from "@/components/layout/MobileNav";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { useTranslation } from "@/lib/i18n/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logout as logoutApi } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/stores/auth.store";
import { useCartStore } from "@/lib/stores/cart.store";
import { useWishlistStore } from "@/lib/stores/wishlist.store";

export function Header() {
  const router = useRouter();
  const { user, isAuthenticated, logout: storeLogout } = useAuthStore();
  const cartReset = useCartStore((s) => s.reset);
  const wishlistReset = useWishlistStore((s) => s.reset);
  const itemCount = useCartStore((s) => s.itemCount);
  const wishlistCount = useWishlistStore((s) => s.itemCount);
  const [searchQuery, setSearchQuery] = useState("");
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();

  const handleLogout = useCallback(async () => {
    try {
      await logoutApi();
    } catch {
      // proceed with local logout even if API call fails
    }
    storeLogout();
    cartReset();
    wishlistReset();
    router.push("/");
  }, [storeLogout, cartReset, wishlistReset, router]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 md:px-8 py-3 w-full max-w-7xl mx-auto gap-4">
        <div className="flex items-center gap-4">
          <MobileNav />
          <Logo />
        </div>

        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary">
            <Search className="h-4 w-4" />
          </div>
          <Input
            placeholder={t("Search for products, brands and more...")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-20 h-10 bg-card border-border rounded text-sm"
          />
          <button
            type="submit"
            className="absolute right-0 top-0 bottom-0 px-4 bg-primary text-primary-foreground text-xs font-semibold rounded-r hover:opacity-90 transition-opacity"
          >
            {t("Search")}
          </button>
        </form>

        <nav className="hidden lg:flex items-center gap-4">
          <Link href="#" className="text-xs font-semibold text-secondary hover:text-primary transition-colors">
            {t("Deals")}
          </Link>
          <Link href="#" className="text-xs font-semibold text-primary border-b-2 border-primary pb-0.5">
            {t("Best Sellers")}
          </Link>
          <Link href="#" className="text-xs font-semibold text-secondary hover:text-primary transition-colors">
            {t("New Arrivals")}
          </Link>
        </nav>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 text-secondary hover:text-primary hover:bg-muted rounded transition-colors"
            aria-label="Toggle dark mode"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          <Link
            href="/wishlist"
            className="p-2 text-secondary hover:text-primary hover:bg-muted rounded transition-colors relative"
            aria-label="Wishlist"
          >
            <Heart className="h-5 w-5" />
            {wishlistCount > 0 && (
              <Badge
                variant="secondary"
                className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full p-0 text-[10px]"
              >
                {wishlistCount > 99 ? "99+" : wishlistCount}
              </Badge>
            )}
          </Link>

          <Link
            href="/cart"
            className="p-2 text-secondary hover:text-primary hover:bg-muted rounded transition-colors relative"
            aria-label="Cart"
          >
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <Badge
                variant="secondary"
                className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full p-0 text-[10px]"
              >
                {itemCount > 99 ? "99+" : itemCount}
              </Badge>
            )}
          </Link>

          {isAuthenticated && user ? (
            <>
              <NotificationBell />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1 text-secondary hover:text-primary hover:bg-muted rounded-full transition-colors" aria-label="User menu">
                    <Avatar className="size-8">
                      <AvatarImage src={user.avatarUrl ?? undefined} />
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5 text-sm font-medium">{user.name}</div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/orders" className="flex cursor-pointer items-center gap-2">
                      <Package className="h-4 w-4" />
                      {t("My Orders")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/account" className="flex cursor-pointer items-center gap-2">
                      <Settings className="h-4 w-4" />
                      {t("My Account")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-destructive flex cursor-pointer items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    {t("Logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button variant="default" size="sm" asChild className="hidden sm:flex">
              <Link href="/login">{t("Login")}</Link>
            </Button>
          )}

          <LocaleSwitcher />
        </div>
      </div>
    </header>
  );
}
