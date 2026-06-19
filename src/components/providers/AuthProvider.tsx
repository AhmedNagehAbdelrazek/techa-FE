"use client";

import { useEffect } from "react";
import { setOnUnauthorized } from "@/services/client";
import { useAuthStore } from "@/lib/stores/auth.store";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    setOnUnauthorized(() => {
      useAuthStore.getState().logout();
    });

    return () => {
      setOnUnauthorized(null);
    };
  }, []);

  return <>{children}</>;
}
