"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Search, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/Logo";
import { useAuthStore } from "@/lib/stores/auth.store";

const navLinks = [
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "FAQs", href: "/faqs" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

export function MobileNav() {
  const { user, isAuthenticated } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="rounded-md p-2 hover:bg-accent lg:hidden" aria-label="Open menu">
          <Menu className="size-5" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full max-w-sm">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b pb-4">
            <Logo />
            <SheetClose asChild>
              <button className="rounded-md p-2 hover:bg-accent" aria-label="Close menu">
                <X className="size-5" />
              </button>
            </SheetClose>
          </div>

          <form onSubmit={handleSearch} className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </form>

          <nav className="mt-6 flex-1">
            <ul className="space-y-1">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <SheetClose asChild>
                    <Link
                      href={link.href}
                      className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-accent transition-colors"
                    >
                      {link.label}
                    </Link>
                  </SheetClose>
                </li>
              ))}
            </ul>
          </nav>

          <div className="border-t pt-4">
            {isAuthenticated && user ? (
              <div className="space-y-2">
                <p className="text-sm font-medium px-1">{user.name}</p>
                <SheetClose asChild>
                  <Link
                    href="/account"
                    className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-accent transition-colors"
                  >
                    My Account
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    href="/account/orders"
                    className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-accent transition-colors"
                  >
                    My Orders
                  </Link>
                </SheetClose>
                <SheetClose asChild>
                  <Link
                    href="/logout"
                    className="block rounded-md px-3 py-2 text-sm font-medium text-destructive hover:bg-accent transition-colors"
                  >
                    Logout
                  </Link>
                </SheetClose>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Button asChild variant="outline" className="w-full">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild className="w-full">
                  <Link href="/register">Register</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
