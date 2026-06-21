"use client";

import { useEffect } from "react";
import { getAdminProfile } from "@/lib/api/admin";
import { useAdminStore } from "@/lib/stores/admin.store";
import { getAdminToken } from "@/lib/api/admin-token";

export function AdminAuthInitializer() {
  const { admin, setAdmin } = useAdminStore();

  useEffect(() => {
    if (admin) return;
    if (!getAdminToken()) return;

    getAdminProfile()
      .then((data) => setAdmin(data))
      .catch(() => {});
  }, [admin, setAdmin]);

  return null;
}
