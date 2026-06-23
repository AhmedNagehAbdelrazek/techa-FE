"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { getOrder, cancelOrder } from "@/lib/api/orders";
import { submitProof, uploadFile } from "@/lib/api/payments";
import { OrderStatusTimeline } from "@/components/store/OrderStatusTimeline";
import { formatPrice, formatDateTime } from "@/lib/utils";
import type { Order } from "@/lib/types/order";

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  useEffect(() => { document.title = `طلب #${params.id} — TechA`; }, []);
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const [proofReference, setProofReference] = useState("");
  const [proofScreenshotUrl, setProofScreenshotUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const lastFetchRef = useRef<number>(0);

  const fetchOrder = useCallback(async (id: string) => {
    const now = Date.now();
    const prevStatus = order?.status;
    try {
      const data = await getOrder(id);
      setOrder(data);
      lastFetchRef.current = now;
      if (prevStatus && prevStatus !== data.status) {
        toast.info(
          `Order status updated to "${data.status}".`,
        );
      }
    } catch {
      if (!order) toast.error("Failed to load order");
    }
  }, [order]);

  useEffect(() => {
    if (params.id) {
      setLoading(true);
      getOrder(params.id)
        .then((data) => {
          setOrder(data);
          lastFetchRef.current = Date.now();
        })
        .catch(() => toast.error("Failed to load order"))
        .finally(() => setLoading(false));
    } else {
      toast.error("Invalid order ID");
      router.push("/orders");
    }
  }, [params.id, router]);

  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === "visible" && params.id) {
        const elapsed = Date.now() - lastFetchRef.current;
        if (elapsed > 30000) {
          fetchOrder(params.id);
        }
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [params.id, fetchOrder]);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG and PNG files are allowed");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      const result = await uploadFile(file);
      setProofScreenshotUrl(result.url);
    } catch {
      toast.error("Failed to upload file");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmitProof() {
    if (!proofReference.trim()) {
      toast.error("Please enter a transaction reference");
      return;
    }
    if (!proofScreenshotUrl) {
      toast.error("Please upload a payment screenshot");
      return;
    }

    setSubmitting(true);
    try {
      await submitProof({
        order_id: params.id,
        proof_reference: proofReference.trim(),
        proof_screenshot_url: proofScreenshotUrl,
      });
      const updated = await getOrder(params.id);
      setOrder(updated);
      setProofReference("");
      setProofScreenshotUrl(null);
      toast.success("Payment proof submitted — pending verification");
    } catch {
      toast.error("Failed to submit payment proof. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancel() {
    setCancelling(true);
    try {
      const updated = await cancelOrder(params.id);
      setOrder(updated);
      toast.success("Order cancelled");
    } catch {
      toast.error("Failed to cancel order. It may no longer be cancellable.");
    } finally {
      setCancelling(false);
    }
  }

  const needsProof =
    order &&
    order.status === "pending" &&
    order.payment_method !== "cash_on_delivery" &&
    order.payment_status !== "submitted" &&
    order.payment_status !== "verified";

  const hasProof =
    order &&
    order.payment_method !== "cash_on_delivery" &&
    (order.payment_status === "submitted" || order.payment_status === "verified");

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Button
          variant="ghost"
          className="mb-4 -ml-2"
          onClick={() => router.push("/orders")}
        >
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
              <p className="mt-1 text-sm text-muted-foreground">
                Placed on {formatDateTime(order.createdat)}
              </p>
            </div>

            {/* Status Timeline */}
            <div className="rounded-lg border p-4">
              <h3 className="mb-3 text-sm font-medium">Status</h3>
              <OrderStatusTimeline
                statusHistory={order.status_history}
                currentStatus={order.status}
              />
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
                        <p className="text-xs text-muted-foreground">
                          {item.variant_label}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Qty: {item.qty} × {formatPrice(item.unit_price)}
                      </p>
                      {order.status === "delivered" && item.product_id && item.id && (
                        <Link
                          href={`/product/${item.product_slug}?review=1&order_item_id=${item.id}`}
                          className="mt-1 inline-block text-xs font-medium text-primary hover:underline"
                        >
                          Write a Review
                        </Link>
                      )}
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
                    {order.shipping_charge > 0
                      ? formatPrice(order.shipping_charge)
                      : "Free"}
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
                  <span className="capitalize">
                    {order.payment_method.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Status</span>
                  <Badge variant="secondary">{order.payment_status}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Deliver to</span>
                  <span className="max-w-48 text-right">
                    {order.shipping_address.full_name},{" "}
                    {order.shipping_address.street}, {order.shipping_address.city} ·{" "}
                    {order.shipping_address.phone}
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

            {/* Payment Proof Section */}
            {needsProof && (
              <div className="rounded-lg border p-4 space-y-4">
                <div>
                  <h3 className="text-sm font-medium">Submit Payment Proof</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Complete your payment using the receiving info shown during
                    checkout, then submit the transaction details below.
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Transaction Reference *
                  </label>
                  <Input
                    value={proofReference}
                    onChange={(e) => setProofReference(e.target.value)}
                    placeholder="e.g., TXN123456"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Payment Screenshot *
                  </label>
                  <p className="mt-1 text-xs text-muted-foreground">
                    JPG or PNG, max 5MB
                  </p>
                  <Input
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={handleFileSelect}
                    disabled={uploading}
                    className="mt-2"
                  />
                  {uploading && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Uploading...
                    </p>
                  )}
                  {proofScreenshotUrl && (
                    <div className="mt-2">
                      <Image
                        src={proofScreenshotUrl}
                        alt="Payment screenshot preview"
                        width={400}
                        height={300}
                        className="max-h-48 rounded-md border object-contain"
                      />
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleSubmitProof}
                  disabled={submitting || uploading || !proofScreenshotUrl}
                >
                  {submitting ? "Submitting..." : "Submit Proof"}
                </Button>
              </div>
            )}

            {/* Proof Already Submitted */}
            {hasProof && order.proof_screenshot_url && (
              <div className="rounded-lg border p-4 space-y-3">
                <h3 className="text-sm font-medium">Payment Proof</h3>
                {order.proof_reference && (
                  <p className="text-xs text-muted-foreground">
                    Reference: {order.proof_reference}
                  </p>
                )}
                <Image
                  src={order.proof_screenshot_url}
                  alt="Payment proof screenshot"
                  width={400}
                  height={300}
                  className="max-h-64 rounded-md border object-contain"
                />
              </div>
            )}

            {/* Actions */}
            {(order.status === "pending" || order.status === "confirmed") && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={cancelling}>
                    {cancelling ? "Cancelling..." : "Cancel Order"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Order</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to cancel this order? This action
                      cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep Order</AlertDialogCancel>
                    <AlertDialogAction onClick={handleCancel} disabled={cancelling}>
                      {cancelling ? "Cancelling..." : "Yes, Cancel"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
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
