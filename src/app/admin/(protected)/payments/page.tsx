"use client";

import { useEffect } from "react";
import { useTranslation } from "@/lib/i18n/client";
import { PaymentsTable } from "@/components/admin/PaymentsTable";

export default function AdminPaymentsPage() {
  const { t } = useTranslation();
  useEffect(() => { document.title = "إدارة المدفوعات — TechA"; }, []);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("Payments Awaiting Review")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("Review and approve or reject pending payments.")}
        </p>
      </div>
      <PaymentsTable />
    </div>
  );
}
