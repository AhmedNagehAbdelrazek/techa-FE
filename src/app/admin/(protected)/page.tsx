"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ShoppingCart, DollarSign, Users, Clock, CreditCard } from "lucide-react";
import { useTranslation } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";
import { getOrderStats } from "@/lib/api/admin";
import { DashboardMetricCard } from "@/components/admin/DashboardMetricCard";
import { DashboardDonutChart } from "@/components/admin/DashboardDonutChart";
import { DashboardRecentOrders } from "@/components/admin/DashboardRecentOrders";

const PERIODS = ["7d", "30d", "90d", "this_month", "last_month"] as const;

const PERIOD_LABELS: Record<string, string> = {
  "7d": "7 Days",
  "30d": "30 Days",
  "90d": "90 Days",
  this_month: "This Month",
  last_month: "Last Month",
};

function PeriodSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (p: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex gap-1 rounded-lg bg-muted p-1" role="tablist">
      {PERIODS.map((p) => (
        <button
          key={p}
          role="tab"
          aria-selected={value === p}
          onClick={() => onChange(p)}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            value === p
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {t(PERIOD_LABELS[p])}
        </button>
      ))}
    </div>
  );
}

function DashboardContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();
  const period = searchParams.get("period") ?? "30d";

  const {
    data: stats,
    isLoading: statsLoading,
    isError: statsError,
    error: statsErrorObj,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ["admin", "stats", period],
    queryFn: () => getOrderStats(period),
  });

  function handlePeriodChange(p: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", p);
    router.replace(`/admin?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("Dashboard")}</h1>
        <PeriodSelector value={period} onChange={handlePeriodChange} />
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <DashboardMetricCard
          label={t("Total Orders")}
          value={stats?.total_orders.current ?? 0}
          previousValue={stats?.total_orders.previous}
          changePct={stats?.total_orders.change_pct}
          icon={ShoppingCart}
          loading={statsLoading}
        />
        <DashboardMetricCard
          label={t("Total Revenue")}
          value={stats?.total_revenue.current ?? 0}
          previousValue={stats?.total_revenue.previous}
          changePct={stats?.total_revenue.change_pct}
          icon={DollarSign}
          loading={statsLoading}
        />
        <DashboardMetricCard
          label={t("New Customers")}
          value={stats?.new_customers.current ?? 0}
          previousValue={stats?.new_customers.previous}
          changePct={stats?.new_customers.change_pct}
          icon={Users}
          loading={statsLoading}
        />
        <DashboardMetricCard
          label={t("Pending Orders")}
          value={stats?.by_status.pending ?? 0}
          icon={Clock}
          href="/admin/orders?status=pending"
          loading={statsLoading}
          Highlighted={true}
        />
        <DashboardMetricCard
          label={t("Payments Awaiting Review")}
          value={stats?.pending_payments ?? 0}
          icon={CreditCard}
          href="/admin/payments"
          loading={statsLoading}
          Highlighted={true}
        />
      </div>

      {/* Error State for Stats */}
      {statsError && !statsLoading && (
        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm text-destructive">
            {t("Failed to load metrics:")} {(statsErrorObj as Error)?.message}
          </p>
          <button
            onClick={() => refetchStats()}
            className="mt-2 text-sm text-primary hover:underline"
          >
            {t("Try again")}
          </button>
        </div>
      )}

      {/* Chart + Recent Orders */}
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <DashboardDonutChart
            data={stats?.by_status}
            loading={statsLoading}
          />
        </div>
        <div className="lg:col-span-3">
          <DashboardRecentOrders />
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { t } = useTranslation();
  useEffect(() => { document.title = "لوحة التحكم — TechA"; }, []);
  return (
    <Suspense fallback={<div className="p-8 text-center">{t("Loading...")}</div>}>
      <DashboardContent />
    </Suspense>
  );
}
