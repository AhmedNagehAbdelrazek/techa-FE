"use client";

import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatDateTime, cn } from "@/lib/utils";
import type { OrderListItem } from "@/lib/types/order";

const STATUS_BADGE_CLASSES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  confirmed: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  processing: "bg-indigo-100 text-indigo-800 hover:bg-indigo-100",
  shipped: "bg-cyan-100 text-cyan-800 hover:bg-cyan-100",
  delivered: "bg-green-100 text-green-800 hover:bg-green-100",
  cancelled: "bg-red-100 text-red-800 hover:bg-red-100",
  refunded: "bg-orange-100 text-orange-800 hover:bg-orange-100",
};

interface OrderCardProps {
  order: OrderListItem;
}

export function OrderCard({ order }: OrderCardProps) {
  const badgeClass = STATUS_BADGE_CLASSES[order.status] ?? "bg-secondary text-secondary-foreground";

  return (
    <Link
      href={`/orders/${order.id}`}
      className="block rounded-lg border p-4 transition-colors hover:bg-muted/50"
    >
      <div className="flex items-start gap-4">
        {order.first_item_thumbnail ? (
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border">
            <Image
              src={order.first_item_thumbnail}
              alt=""
              fill
              className="object-cover"
              sizes="64px"
            />
          </div>
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md border bg-muted text-xs text-muted-foreground">
            No img
          </div>
        )}
        <div className="flex min-w-0 flex-1 items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-medium">#{order.order_number}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {formatDateTime(order.createdat)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {order.item_count} item{order.item_count !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="font-semibold">{formatPrice(order.total)}</p>
            <Badge className={cn("mt-1 border-0", badgeClass)}>
              {order.status}
            </Badge>
          </div>
        </div>
      </div>
    </Link>
  );
}
