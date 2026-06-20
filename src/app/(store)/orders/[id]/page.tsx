"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { getOrder, cancelOrder } from "@/lib/api/orders";
import { formatPrice, formatDateTime } from "@/lib/utils";
import type { Order } from "@/lib/types/order";

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (params.id) {
      getOrder(params.id)
        .then((data)=>{
          console.log(data)
          setOrder(data);
        })
        .catch(() => toast.error("Failed to load order"))
        .finally(() => setLoading(false));
        
    } else {
      toast.error("Invalid order ID");
      router.push("/orders");
    }
  }, [params.id]);

  async function handleCancel() {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    setCancelling(true);
    try {
      const updated = await cancelOrder(params.id);
      setOrder(updated);
      toast.success("Order cancelled");
    } catch {
      toast.error("Failed to cancel order");
    } finally {
      setCancelling(false);
    }
  }

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Button variant="ghost" className="mb-4 -ml-2" onClick={() => router.push("/orders")}>
          ← Back to Orders
        </Button>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
        ) : order ? (
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold">#{order.order_number}</h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Placed on {formatDateTime(order.created_at)}
              </p>
            </div>

            {/* Status Timeline */}
            <div className="rounded-lg border p-4">
              <h3 className="mb-3 text-sm font-medium">Status</h3>
              <div className="space-y-3">
                {order.status_history.map((entry, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <div className="bg-primary/10 flex h-6 w-6 items-center justify-center rounded-full">
                      <div className="bg-primary h-2 w-2 rounded-full" />
                    </div>
                    <div>
                      <p className="font-medium capitalize">{entry.status}</p>
                      <p className="text-muted-foreground text-xs">
                        {formatDateTime(entry.changed_at)}
                      </p>
                    </div>
                    {entry.from_status && entry.to_status && entry.from_status !== entry.to_status && (
                      <div className="flex items-center gap-3 text-sm">
                        <div className="bg-primary/10 flex h-6 w-6 items-center justify-center rounded-full">
                          <div className="bg-primary h-2 w-2 rounded-full" />
                        </div>
                        <div>
                          <p className="font-medium capitalize">{entry.from_status}</p>
                          <p className="text-muted-foreground text-xs">
                            {formatDateTime(entry.changed_at)}
                          </p>
                        </div>
                      </div>
                    )}
                    
                  </div>
                ))}
              </div>
              <div className="mt-2">
                <Badge
                  variant={
                    order.status === "delivered"
                      ? "default"
                      : order.status === "cancelled"
                        ? "destructive"
                        : "secondary"
                  }
                >
                  {order.status}
                </Badge>
              </div>
            </div>

            {/* Items */}
            <div className="rounded-lg border p-4">
              <h3 className="mb-3 text-sm font-medium">Items</h3>
              <div className="space-y-3">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-start justify-between text-sm">
                    <div className="flex-1">
                      <p className="font-medium">{item.product_name}</p>
                      {item.variant_label && (
                        <p className="text-muted-foreground text-xs">{item.variant_label}</p>
                      )}
                      <p className="text-muted-foreground text-xs">
                        Qty: {item.qty} × {formatPrice(item.unit_price)}
                      </p>
                    </div>
                    <p className="font-medium">{formatPrice(item.line_total)}</p>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatPrice(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>
                    {order.shipping_charge > 0 ? formatPrice(order.shipping_charge) : "Free"}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="rounded-lg border p-4">
              <h3 className="mb-3 text-sm font-medium">Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment</span>
                  <span className="capitalize">{order.payment_method.replace(/_/g, " ")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Status</span>
                  <Badge variant="secondary">{order.payment_status}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Deliver to</span>
                  <span className="max-w-48 text-right">
                    {order.shipping_address.full_name}, {order.shipping_address.street},{" "}
                    {order.shipping_address.city} · {order.shipping_address.phone}
                  </span>
                </div>
                {order.notes && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Notes</span>
                    <span className="max-w-48 text-right">{order.notes}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            {order.status === "pending" && (
              <Button variant="destructive" onClick={handleCancel} disabled={cancelling}>
                {cancelling ? "Cancelling..." : "Cancel Order"}
              </Button>
            )}
          </div>
        ) : (
          <div className="text-center">
            <p className="text-muted-foreground">Order not found</p>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
