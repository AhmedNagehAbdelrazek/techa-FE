"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ShoppingCart, Heart, User, LogOut, Package, Settings } from "lucide-react";
import { NotificationBell } from "@/components/store/NotificationBell";
import { Logo } from "@/components/layout/Logo";
import { MobileNav } from "@/components/layout/MobileNav";
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
    <header className="bg-background sticky top-0 z-50 w-full border-b">
      <div className="mx-auto flex flex-row justify-between h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
       

        <div className="flex items-center gap-4">
          <form onSubmit={handleSearch} className="hidden max-w-md flex-1 md:flex">
            <div className="relative w-full">
              <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </form>

          <div className="mr-auto flex items-center gap-2 md:mr-0">
            <Link
              href="/wishlist"
              className="hover:bg-accent relative rounded-md p-2"
              aria-label="Wishlist"
            >
              <Heart className="size-5" />
              {wishlistCount > 0 && (
                <Badge
                  variant="secondary"
                  className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full p-0 text-[10px]"
                >
                  {wishlistCount > 99 ? "99+" : wishlistCount}
                </Badge>
              )}
            </Link>

            <Link
              href="/cart"
              className="hover:bg-accent relative rounded-md p-2"
              aria-label="Cart"
            >
              <ShoppingCart className="size-5" />
              {itemCount > 0 && (
                <Badge
                  variant="secondary"
                  className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full p-0 text-[10px]"
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
                    <button className="hover:bg-accent rounded-full p-1" aria-label="User menu">
                      <Avatar className="size-8">
                        <AvatarImage src={user.avatarUrl ?? undefined} />
                        <AvatarFallback>
                          <User className="size-4" />
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-2 py-1.5 text-sm font-medium">{user.name}</div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/orders" className="flex cursor-pointer items-center gap-2">
                        <Package className="size-4" />
                        My Orders
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/account" className="flex cursor-pointer items-center gap-2">
                        <Settings className="size-4" />
                        My Account
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-destructive flex cursor-pointer items-center gap-2"
                    >
                      <LogOut className="size-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/register">Register</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
         <div>
          <MobileNav />
          <Logo />
        </div>
      </div>
    </header>
  );
}
