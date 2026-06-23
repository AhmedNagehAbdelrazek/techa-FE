"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";

import { getOrderDetail, updateOrderStatus, adminOrdersKeys } from "@/lib/api/admin-orders";
import { useAdminStore } from "@/lib/stores/admin.store";
import { formatPrice, formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ErrorState } from "@/components/ui/ErrorState";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { OrderStatusUpdateModal } from "./OrderStatusUpdateModal";
import { PaymentInfoCard } from "./PaymentInfoCard";

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline" | "ghost"> = {
  pending: "outline",
  confirmed: "default",
  processing: "secondary",
  shipped: "ghost",
  delivered: "default",
  cancelled: "destructive",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export function OrderDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-40 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-48 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

interface OrderDetailProps {
  orderId: string;
}

const EMPTY_PERMISSIONS: Record<string, string[]> = {};

export function OrderDetail({ orderId }: OrderDetailProps) {
  const permissions = useAdminStore((s) => s.admin?.permissions ?? EMPTY_PERMISSIONS);
  const canUpdate = permissions["orders"]?.includes("update") ?? false;
  const [cancelOpen, setCancelOpen] = useState(false);
  const queryClient = useQueryClient();

  const cancelMutation = useMutation({
    mutationFn: () => updateOrderStatus(orderId, "cancelled"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminOrdersKeys.detail(orderId) });
      queryClient.invalidateQueries({ queryKey: adminOrdersKeys.lists() });
      toast.success("Order cancelled");
      setCancelOpen(false);
      refetch();
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to cancel order");
    },
  });

  const { data: order, isLoading, isError, error, refetch } = useQuery({
    queryKey: adminOrdersKeys.detail(orderId),
    queryFn: () => getOrderDetail(orderId),
  });

  if (isLoading) return <OrderDetailSkeleton />;

  if (isError) {
    return (
      <ErrorState
        title="Failed to load order"
        message={(error as Error)?.message}
        onRetry={() => refetch()}
      />
    );
  }

  if (!order) {
    return <ErrorState title="Order not found" message="The requested order does not exist." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/orders">
              <ChevronLeft className="size-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{order.order_number}</h1>
            <p className="text-sm text-muted-foreground">
              Placed on {formatDateTime(order.created_at)}
            </p>
          </div>
        </div>
        {canUpdate && (
          <div className="flex items-center gap-2">
            <OrderStatusUpdateModal orderId={order.id} currentStatus={order.status} onUpdated={() => refetch()} />
            {order.status !== "cancelled" && order.status !== "delivered" && (
              <>
                <Button variant="destructive" onClick={() => setCancelOpen(true)}>
                  Cancel Order
                </Button>
                <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancel this order?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. The order will be marked as cancelled.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep order</AlertDialogCancel>
                      <AlertDialogAction onClick={() => cancelMutation.mutate()} disabled={cancelMutation.isPending}>
                        {cancelMutation.isPending ? "Cancelling..." : "Yes, cancel order"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Card */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-base font-semibold">Customer</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name</span>
                <span className="font-medium">{order.customer.full_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email</span>
                <span>{order.customer.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phone</span>
                <span dir="ltr">{order.customer.phone}</span>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-base font-semibold">Items</h2>
            <Table>
              <TableHeader>
                <TableRow className="text-right">
                  <TableHead className="text-right">Product</TableHead>
                  <TableHead className="text-right">Variant</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.product_name}</TableCell>
                    <TableCell className="text-muted-foreground">{item.variant_label ?? "—"}</TableCell>
                    <TableCell>{item.qty}</TableCell>
                    <TableCell>{formatPrice(item.unit_price)}</TableCell>
                    <TableCell className="font-medium">{formatPrice(item.total_price)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Separator className="my-3" />
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="text-green-600">-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{formatPrice(order.shipping_charge)}</span>
              </div>
              <Separator className="my-1" />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-base font-semibold">Status History</h2>
            <div className="space-y-3">
              {order.status_history.length === 0 ? (
                <p className="text-sm text-muted-foreground">No status changes recorded.</p>
              ) : (
                order.status_history.map((entry, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="flex flex-col items-center">
                      <div className="size-2.5 rounded-full bg-primary" />
                      {i < order.status_history.length - 1 && (
                        <div className="w-px flex-1 bg-border" />
                      )}
                    </div>
                    <div className="pb-3">
                      <div className="flex items-center gap-2">
                        {entry.from_status ? (
                          <>
                            <Badge variant={STATUS_VARIANTS[entry.from_status] ?? "outline"} className="text-xs">
                              {STATUS_LABELS[entry.from_status] ?? entry.from_status}
                            </Badge>
                            <span className="text-muted-foreground">→</span>
                          </>
                        ) : null}
                        <Badge variant={STATUS_VARIANTS[entry.to_status] ?? "outline"} className="text-xs">
                          {STATUS_LABELS[entry.to_status] ?? entry.to_status}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDateTime(entry.changed_at)}
                        {entry.changed_by ? ` by ${entry.changed_by}` : ""}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Payment Cards */}
          {order.payments.map((payment) => (
            <PaymentInfoCard
              key={payment.id}
              payment={payment}
              canUpdate={canUpdate}
              onApproved={() => refetch()}
              onRejected={() => refetch()}
            />
          ))}

          {/* Shipping Address */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-3 text-base font-semibold">Shipping Address</h2>
            <div className="space-y-1 text-sm">
              <p className="font-medium">{order.shipping_address.full_name}</p>
              <p dir="ltr">{order.shipping_address.phone}</p>
              <p>{order.shipping_address.street}</p>
              <p>
                {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip_code}
              </p>
              <p>{order.shipping_address.country}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
