"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import type { OrdersByStatus } from "@/lib/api/admin";

interface DonutChartItem {
  name: string;
  value: number;
  color: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  confirmed: "#3b82f6",
  processing: "#8b5cf6",
  shipped: "#06b6d4",
  delivered: "#22c55e",
  cancelled: "#ef4444",
  refunded: "#6b7280",
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

interface DashboardDonutChartProps {
  data?: OrdersByStatus;
  loading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
}

export function DashboardDonutChart({
  data,
  loading,
  error,
  onRetry,
}: DashboardDonutChartProps) {
  if (loading) return <DashboardDonutChartSkeleton />;

  if (error) {
    return (
      <div className="rounded-lg border bg-card p-6">
        <h3 className="mb-4 text-base font-semibold">Order Distribution</h3>
        <ErrorState
          title="Failed to load chart"
          message={error.message}
          onRetry={onRetry}
        />
      </div>
    );
  }

  const chartData: DonutChartItem[] = Object.entries(data ?? {})
    .filter(([, value]) => value > 0)
    .map(([key, value]) => ({
      name: STATUS_LABELS[key] ?? key,
      value,
      color: STATUS_COLORS[key] ?? "#9ca3af",
    }));

  return (
    <div className="rounded-lg border bg-card p-6">
      <h3 className="mb-4 text-base font-semibold">Order Distribution</h3>

      {chartData.length === 0 ? (
        <div className="flex min-h-[200px] items-center justify-center text-sm text-muted-foreground">
          No orders found
        </div>
      ) : (
        <div className="flex items-center gap-6">
          <div className="h-[220px] w-[220px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            {chartData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-muted-foreground">{item.name}</span>
                <span className="font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function DashboardDonutChartSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-6">
      <Skeleton className="mb-4 h-5 w-40" />
      <div className="flex items-center gap-6">
        <Skeleton className="h-[220px] w-[220px] rounded-full" />
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-8" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
