"use client";

import { useEffect } from "react";
import { setOnUnauthorized } from "@/services/client";
import { useAuthStore } from "@/lib/stores/auth.store";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    useAuthStore.getState().hydrateFromStorage();

    setOnUnauthorized(() => {
      useAuthStore.getState().logout();
    });

    return () => {
      setOnUnauthorized(null);
    };
  }, []);

  return <>{children}</>;
}
