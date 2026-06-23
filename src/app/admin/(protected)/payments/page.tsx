"use client";

import { useEffect } from "react";
import { PaymentsTable } from "@/components/admin/PaymentsTable";

export default function AdminPaymentsPage() {
  useEffect(() => { document.title = "إدارة المدفوعات — TechA"; }, []);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Payments Awaiting Review</h1>
        <p className="text-sm text-muted-foreground">
          Review and approve or reject pending payments.
        </p>
      </div>
      <PaymentsTable />
    </div>
  );
}
