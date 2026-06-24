"use client";

import { User, LogOut, Moon, Sun } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { useAdminStore } from "@/lib/stores/admin.store";
import { useTranslation } from "@/lib/i18n/client";

export function AdminTopBar() {
  const router = useRouter();
  const { admin, logout } = useAdminStore();
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();

  function handleLogout() {
    logout();
    router.push("/admin/login");
  }

  return (
    <header className="flex h-14 items-center justify-between border-b bg-background px-6">
      <div />
      <div className="flex items-center gap-3">
        <LocaleSwitcher />
        {admin && (
          <>
            <div className="text-right">
              <p className="text-sm font-medium">{admin.name}</p>
              <p className="text-xs text-muted-foreground capitalize">
                {admin.role}
              </p>
            </div>
            <Avatar className="size-8">
              <AvatarFallback>
                <User className="size-4" />
              </AvatarFallback>
            </Avatar>
          </>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label={t("Toggle dark mode")}
        >
          {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          aria-label={t("Logout")}
        >
          <LogOut className="size-4" />
        </Button>
      </div>
    </header>
  );
}
