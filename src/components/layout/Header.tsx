"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  LogOut,
  Package,
  Settings,
  Moon,
  Sun,
  Loader2,
  Bell,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useQuery } from "@tanstack/react-query";
import { searchProducts } from "@/lib/api/products";
import { useAuthDialogStore } from "@/lib/stores/auth-dialog.store";
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
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLFormElement>(null);
  const openAuthDialog = useAuthDialogStore((s) => s.open);
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
    setIsOpen(false);
    if (searchQuery.trim()) {
      router.push(`/search?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // raw setTimeout debounce, no dep needed
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const { data: results, isPending } = useQuery({
    queryKey: ["products-search", debouncedQuery],
    queryFn: () => searchProducts(debouncedQuery),
    enabled: debouncedQuery.length >= 1,
  });

  const handleSelect = (slug: string) => {
    setSearchQuery("");
    setDebouncedQuery("");
    setIsOpen(false);
    router.push(`/product/${slug}`);
  };

  return (
    <header className="bg-card border-border sticky top-0 z-50 border-b">
      <div className="flex w-full items-center justify-between gap-4 px-4 py-3 md:px-8">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-4">
            <MobileNav />
            <Logo />
          </div>

          <form ref={dropdownRef} onSubmit={handleSearch} className="relative hidden max-w-xl flex-1 md:flex">
            <div className="text-secondary absolute top-1/2 left-3 -translate-y-1/2">
              <Search className="h-4 w-4" />
            </div>
            <Input
              placeholder={t("Search for products, brands and more...")}
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setIsOpen(true); }}
              onFocus={() => setIsOpen(true)}
              onKeyDown={(e) => { if (e.key === "Escape") setIsOpen(false); }}
              className="bg-card border-border h-10 rounded pr-20 pl-10 text-sm placeholder:text-muted-foreground w-100"
            />
            <button
              type="submit"
              className="bg-primary text-primary-foreground absolute top-0 right-0 bottom-0 rounded-r px-4 text-xs font-semibold transition-opacity hover:opacity-90"
            >
              {t("Search")}
            </button>
            {isOpen && debouncedQuery.length >= 1 && (
              <div className="bg-card border-border absolute top-full left-0 right-0 z-50 mt-1 max-h-80 overflow-auto rounded border shadow-lg">
                {isPending ? (
                  <div className="flex items-center justify-center gap-2 px-4 py-6 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("Searching...")}
                  </div>
                ) : results && results.length > 0 ? (
                  results.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => handleSelect(product.slug)}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-accent"
                    >
                      <div className="bg-muted relative size-10 shrink-0 overflow-hidden rounded">
                        <img
                          src={product.image}
                          alt=""
                          className="size-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium">{product.name}</div>
                        <Badge
                          variant={product.available ? "default" : "secondary"}
                          className="mt-0.5 text-[10px]"
                        >
                          {product.available ? t("In Stock") : t("Out of Stock")}
                        </Badge>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                    {t("No products found")}
                  </div>
                )}
              </div>
            )}
          </form>
        </div>
        <div className="flex items-center gap-4">
          {/* <nav className="hidden items-center gap-4 lg:flex">
            <Link
              href="#"
              className="text-secondary hover:text-primary text-xs font-semibold transition-colors"
            >
              {t("Deals")}
            </Link>
            <Link
              href="#"
              className="text-primary border-primary border-b-2 pb-0.5 text-xs font-semibold"
            >
              {t("Best Sellers")}
            </Link>
            <Link
              href="#"
              className="text-secondary hover:text-primary text-xs font-semibold transition-colors"
            >
              {t("New Arrivals")}
            </Link>
          </nav> */}

          <div className="flex items-center gap-1">
            <LocaleSwitcher />

            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="text-secondary hover:text-primary hover:bg-muted rounded p-2 transition-colors"
              aria-label="Toggle dark mode"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {isAuthenticated ? (
              <NotificationBell />
            ) : (
              <button
                onClick={openAuthDialog}
                className="text-secondary hover:text-primary hover:bg-muted relative rounded p-2 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="size-5" />
              </button>
            )}

            {isAuthenticated ? (
              <Link
                href="/wishlist"
                className="text-secondary hover:text-primary hover:bg-muted relative rounded p-2 transition-colors"
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
            ) : (
              <button
                onClick={openAuthDialog}
                className="text-secondary hover:text-primary hover:bg-muted relative rounded p-2 transition-colors"
                aria-label="Wishlist"
              >
                <Heart className="h-5 w-5" />
              </button>
            )}

            <Link
              href="/cart"
              className="text-secondary hover:text-primary hover:bg-muted relative rounded p-2 transition-colors"
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="text-secondary hover:text-primary hover:bg-muted rounded-full p-1 transition-colors"
                    aria-label="User menu"
                  >
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
            ) : (
              <Button variant="default" size="sm" asChild className="hidden sm:flex">
                <Link href="/login">{t("Login")}</Link>
              </Button>
            )}

          </div>
        </div>
      </div>
    </header>
  );
}
