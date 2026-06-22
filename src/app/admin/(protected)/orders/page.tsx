"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { OrdersTable, OrdersTableSkeleton } from "@/components/admin/OrdersTable";

function OrdersPageContent() {
  const searchParams = useSearchParams();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Orders</h1>
        <p className="text-sm text-muted-foreground">
          View and manage customer orders.
        </p>
      </div>
      <OrdersTable
        searchParams={{
          search: searchParams.get("search") || undefined,
          status: searchParams.get("status") || undefined,
          payment_status: searchParams.get("payment_status") || undefined,
          date_from: searchParams.get("date_from") || undefined,
          date_to: searchParams.get("date_to") || undefined,
          sort: searchParams.get("sort") || undefined,
          page: searchParams.get("page") || undefined,
        }}
      />
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<OrdersTableSkeleton />}>
      <OrdersPageContent />
    </Suspense>
  );
}
