"use client";

import { formatDateTime, cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/client";
import type { OrderStatusHistory } from "@/lib/types/order";

interface OrderStatusTimelineProps {
  statusHistory: OrderStatusHistory[];
  currentStatus: string;
}

export function OrderStatusTimeline({ statusHistory, currentStatus }: OrderStatusTimelineProps) {
  const { t } = useTranslation();
  if (statusHistory.length === 0) return null;

  return (
    <div className="relative" role="region" aria-label={t("Order status timeline")}>
      <ol className="hidden" aria-label={t("Status steps")}>
        {statusHistory.map((entry, i) => {
          const label = entry.status || entry.to_status || "";
          return (
            <li key={i}>
              {t("Step {{number}}: {{label}} — {{date}}", { number: i + 1, label, date: formatDateTime(entry.changed_at) })}
            </li>
          );
        })}
      </ol>

      <div className="space-y-0" aria-hidden="true">
        {statusHistory.map((entry, i) => {
          const label = entry.status || entry.to_status || "";
          const isCurrent = label === currentStatus;
          const isCompleted = !isCurrent && i < statusHistory.length - 1;
          const isLast = i === statusHistory.length - 1;

          return (
            <div key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full border-2",
                    isCurrent
                      ? "border-primary bg-primary"
                      : isCompleted
                        ? "border-primary bg-primary/20"
                        : "border-muted-foreground/30 bg-background",
                  )}
                >
                  <div
                    className={cn(
                      "h-2 w-2 rounded-full",
                      isCurrent
                        ? "bg-background"
                        : isCompleted
                          ? "bg-primary"
                          : "bg-muted-foreground/30",
                    )}
                  />
                </div>
                {!isLast && (
                  <div
                    className={cn(
                      "h-full w-0.5",
                      isCompleted ? "bg-primary/30" : "bg-muted-foreground/20",
                    )}
                  />
                )}
              </div>
              <div className={cn("pb-6", isLast && "pb-0")}>
                <p
                  className={cn(
                    "text-sm font-medium capitalize",
                    isCurrent
                      ? "text-foreground"
                      : isCompleted
                        ? "text-foreground/80"
                        : "text-muted-foreground",
                  )}
                >
                  {label}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDateTime(entry.changed_at)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
