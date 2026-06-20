"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const STATUS_TABS = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
  { value: "refunded", label: "Refunded" },
] as const;

interface OrderStatusTabsProps {
  active: string;
  onTabChange: (status: string) => void;
}

export function OrderStatusTabs({ active, onTabChange }: OrderStatusTabsProps) {
  return (
    <div className="flex gap-1 overflow-x-auto pb-2" role="tablist">
      {STATUS_TABS.map((tab) => (
        <Button
          key={tab.value}
          variant={active === tab.value ? "default" : "outline"}
          size="sm"
          onClick={() => onTabChange(tab.value)}
          role="tab"
          aria-selected={active === tab.value}
          className={cn(
            "shrink-0",
            active === tab.value && "pointer-events-none",
          )}
        >
          {tab.label}
        </Button>
      ))}
    </div>
  );
}
