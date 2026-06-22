"use client";

import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminTopBar } from "@/components/layout/AdminTopBar";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { AdminAuthInitializer } from "@/components/admin/AdminAuthInitializer";
import { useAdminStore } from "@/lib/stores/admin.store";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { admin, isAuthenticated,_hydrated } = useAdminStore((s) => s);
  const router = useRouter();

  useEffect(() => {
    if ((!admin || !isAuthenticated) && _hydrated) {
      router.replace("/admin/login");
    }
    
  }, [admin, isAuthenticated, router ,_hydrated]);

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
