"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import type { LucideIcon } from "lucide-react";

interface DashboardMetricCardProps {
  label: string;
  value: number;
  previousValue?: number;
  changePct?: number;
  icon: LucideIcon;
  href?: string;
  loading?: boolean;
  Highlighted ?: boolean
}

function formatValue(value: number): string {
  if (value > 9999) {
    return Intl.NumberFormat("en", { notation: "compact" }).format(value);
  }
  return Intl.NumberFormat("ar-EG").format(value);
}

export function DashboardMetricCard({
  label,
  value,
  previousValue,
  changePct,
  icon: Icon,
  href,
  loading,
  Highlighted,
}: DashboardMetricCardProps) {
  if (loading) {
    return <DashboardMetricCardSkeleton />;
  }

  const positive = changePct !== undefined && changePct >= 0;
  const showChange = changePct !== undefined && previousValue !== undefined;

  const content = (
    <div
      className={cn(
        "rounded-lg border bg-card p-6",
        href && "cursor-pointer transition-shadow hover:shadow-md",
        Highlighted == true && "border-amber-500!",
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{formatValue(value)}</p>
        </div>
        <div className="rounded-lg bg-primary/10 p-2 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {showChange && (
        <div className="mt-3 flex items-center gap-1.5 text-sm">
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-medium",
              positive
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
            )}
          >
            {positive ? "↑" : "↓"} {Math.abs(changePct).toFixed(1)}%
          </span>
          <span className="text-muted-foreground">
            مقابل {formatValue(previousValue)}
          </span>
        </div>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

export function DashboardMetricCardSkeleton() {
  return (
    <div className={cn("rounded-lg border bg-card p-6")}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-32" />
        </div>
        <Skeleton className="h-10 w-10 rounded-lg" />
      </div>
      <div className="mt-3 flex items-center gap-1.5">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}
