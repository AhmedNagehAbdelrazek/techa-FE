"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { useTranslation } from "@/lib/i18n/client";

import { CouponsTable } from "@/components/admin/CouponsTable";
import { CouponFormDialog } from "@/components/admin/CouponFormDialog";
import { useAdminStore } from "@/lib/stores/admin.store";
import { Button } from "@/components/ui/button";
import type { AdminCoupon } from "@/lib/api/admin-coupons-zones";

const EMPTY_PERMISSIONS: Record<string, string[]> = {};

export default function AdminCouponsPage() {
  useEffect(() => { document.title = "إدارة الكوبونات — TechA"; }, []);
  return (
    <Suspense fallback={<CouponsPageSkeleton />}>
      <AdminCouponsPageContent />
    </Suspense>
  );
}

function CouponsPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-8 w-24 bg-muted rounded animate-pulse" />
        <div className="h-9 w-28 bg-muted rounded animate-pulse" />
      </div>
    </div>
  );
}

function AdminCouponsPageContent() {
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const permissions = useAdminStore((s) => s.admin?.permissions ?? EMPTY_PERMISSIONS);
  const canCreate = permissions["coupons"]?.includes("create") ?? false;

  const page = Number(searchParams.get("page") ?? "1");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<AdminCoupon | null>(null);

  function handleAdd() {
    setEditingCoupon(null);
    setDialogOpen(true);
  }

  function handleEdit(coupon: AdminCoupon) {
    setEditingCoupon(coupon);
    setDialogOpen(true);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("Coupons")}</h1>
        {canCreate && (
          <Button onClick={handleAdd}>
            <Plus className="size-4" />
            {t("Add Coupon")}
          </Button>
        )}
      </div>
      <CouponsTable page={page} onEdit={handleEdit} />
      <CouponFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={editingCoupon}
      />
    </div>
  );
}
