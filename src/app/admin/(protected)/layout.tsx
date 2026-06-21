import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminTopBar } from "@/components/layout/AdminTopBar";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { AdminAuthInitializer } from "@/components/admin/AdminAuthInitializer";
import { AUTH_COOKIE_NAME } from "@/lib/auth/constants";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    redirect("/admin/login");
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminAuthInitializer />
      <AdminSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminTopBar />
        <div className="flex items-center gap-2 border-b bg-muted/30 px-6 py-2">
          <Breadcrumbs />
        </div>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
