"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n/client";
import { useQuery } from "@tanstack/react-query";
import { getRecentOrders } from "@/lib/api/admin";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatPrice, formatDateTime } from "@/lib/utils";

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline" | "ghost" | "link"> = {
  pending: "outline",
  confirmed: "default",
  processing: "secondary",
  shipped: "ghost",
  delivered: "default",
  cancelled: "destructive",
  refunded: "destructive",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export function DashboardRecentOrders() {
  const { t } = useTranslation();
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["admin", "recent-orders"],
    queryFn: getRecentOrders,
  });

  if (isLoading) return <DashboardRecentOrdersSkeleton />;

  if (isError) {
    return (
      <div className="rounded-lg border bg-card p-6">
        <h3 className="mb-4 text-base font-semibold">{t("Recent Orders")}</h3>
        <ErrorState
          title={t("Failed to load recent orders")}
          message={(error as Error)?.message}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-6">
        <h3 className="mb-4 text-base font-semibold">{t("Recent Orders")}</h3>
        <EmptyState
          title={t("No orders yet")}
          description={t("There are no recent orders to display.")}
        />
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-6">
      <h3 className="mb-4 text-base font-semibold">{t("Recent Orders")}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-center text-muted-foreground">
              <th className="pb-3 font-medium">{t("Order")}</th>
              <th className="pb-3 font-medium">{t("Customer")}</th>
              <th className="pb-3 font-medium">{t("Status")}</th>
              <th className="pb-3 font-medium">{t("Total")}</th>
              <th className="pb-3 font-medium">{t("Date")}</th>
              <th className="pb-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {data.map((order) => (
              <tr key={order.id} className="border-b last:border-0 text-center">
                <td className="py-3 font-medium">{order.order_number}</td>
                <td className="py-3 text-muted-foreground">
                  {order.customer.full_name ?? "—"}
                </td>
                <td className="py-3">
                  <Badge
                    variant={STATUS_VARIANTS[order.status] ?? "outline"}
                  >
                    {STATUS_LABELS[order.status] ?? order.status}
                  </Badge>
                </td>
                <td className="py-3">{formatPrice(order.total)}</td>
                <td className="py-3 text-muted-foreground">
                  {formatDateTime(order.createdat)}
                </td>
                <td className="py-3">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="text-primary hover:underline"
                  >
                    {t("View")}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function DashboardRecentOrdersSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-6">
      <Skeleton className="mb-4 h-5 w-32" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}
