"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/forms/Button";
import { logout as logoutApi } from "@/lib/api/auth";
import { useAuthStore } from "@/lib/stores/auth.store";

export function LogoutButton() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await logoutApi();
    } catch {
      // Still log out locally even if API call fails
    }

    logout();
    toast.success("Logged out successfully.");
    router.push("/");
  }

  return (
    <Button
      variant="destructive"
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="w-full"
    >
      {isLoggingOut ? "Logging out..." : "Log Out"}
    </Button>
  );
}
