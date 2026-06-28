"use client";

import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminTopBar } from "@/components/layout/AdminTopBar";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { AdminAuthInitializer } from "@/components/admin/AdminAuthInitializer";
import { useAdminStore } from "@/lib/stores/admin.store";
import { useEffect } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { admin, isAuthenticated,_hydrated } = useAdminStore((s) => s);

  useEffect(() => {
    if ((!admin || !isAuthenticated) && _hydrated) {
      // ponytail: hard redirect — router.replace is unreliable here because
      // logout is triggered outside React (axios interceptor), and cross-layout-group
      // navigations from useEffect can be swallowed by Next.js router internals.
      window.location.href = "/admin/login";
    }
  }, [admin, isAuthenticated, _hydrated]);

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminAuthInitializer />
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminTopBar />
        <div className="bg-muted/30 flex items-center gap-2 border-b px-6 py-2">
          <Breadcrumbs />
        </div>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
