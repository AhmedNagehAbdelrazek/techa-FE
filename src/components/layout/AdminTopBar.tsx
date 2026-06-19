"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { request } from "@/lib/api/Request";

interface AdminUser {
  name: string;
  email: string;
  role: string;
}

export function AdminTopBar() {
  const [admin, setAdmin] = useState<AdminUser | null>(null);

  useEffect(() => {
    request
      .get<AdminUser>("/api/admin/auth/me")
      .then((data) => setAdmin(data))
      .catch(() => {});
  }, []);

  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-6">
      <div>{/* Breadcrumbs rendered separately in layout */}</div>
      <div className="flex items-center gap-3">
        {admin && (
          <>
            <div className="text-right">
              <p className="text-sm font-medium">{admin.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{admin.role}</p>
            </div>
            <Avatar className="size-8">
              <AvatarFallback>
                <User className="size-4" />
              </AvatarFallback>
            </Avatar>
          </>
        )}
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/logout">
            <LogOut className="size-4" />
            <span className="sr-only">Logout</span>
          </Link>
        </Button>
      </div>
    </header>
  );
}
