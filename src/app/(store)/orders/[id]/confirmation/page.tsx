"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { toast } from "sonner";
import { getOrder } from "@/lib/api/orders";
import { submitProof, uploadFile } from "@/lib/api/payments";
import { formatPrice, formatDateTime } from "@/lib/utils";
import type { Order } from "@/lib/types/order";

export default function ConfirmationPage() {
  const params = useParams<{ id: string }>();
  useEffect(() => { document.title = "تأكيد الطلب — TechA"; }, []);
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [proofReference, setProofReference] = useState("");
  const [proofScreenshotUrl, setProofScreenshotUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (params.id) {
      getOrder(params.id)
        .then(setOrder)
        .catch(() => toast.error("Failed to load order details"))
        .finally(() => setLoading(false));
    }
  }, [params.id]);

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
      setSubmitted(true);
      toast.success("Payment proof submitted — pending verification");
    } catch {
      toast.error("Failed to submit payment proof. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-2xl px-4 py-8">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
        ) : order ? (
          <div className="space-y-6">
            {/* Success Header */}
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <svg
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold">Order Placed!</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Thank you for your order
              </p>
            </div>

            {/* Receipt */}
            <div className="rounded-lg border p-6">
              <div className="text-center border-b pb-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Receipt</p>
                <p className="mt-1 text-xl font-bold">#{order.order_number}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{formatDateTime(order.createdat)}</p>
              </div>

              {/* Items */}
              <div className="mt-4 space-y-3">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-start justify-between text-sm">
                    <div className="flex-1">
                      <p className="font-medium">{item.product_name}</p>
                      {item.variant_label && (
                        <p className="text-xs text-muted-foreground">{item.variant_label}</p>
                      )}
                      <p className="text-xs text-muted-foreground">Qty: {item.qty} × {formatPrice(item.unit_price)}</p>
                    </div>
                    <p className="font-medium">{formatPrice(item.line_total)}</p>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              {/* Totals */}
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount{order.coupon ? ` (${order.coupon.code})` : ""}</span>
                    <span>-{formatPrice(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{order.shipping_charge > 0 ? formatPrice(order.shipping_charge) : "Free"}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Details */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment</span>
                  <span className="capitalize">{order.payment_method.replace(/_/g, " ")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="secondary">{order.status}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Deliver to</span>
                  <span className="text-right max-w-48">
                    {order.shipping_address.full_name}, {order.shipping_address.street},{" "}
                    {order.shipping_address.city}
                    {" · "}{order.shipping_address.phone}
                  </span>
                </div>
                {order.notes && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Notes</span>
                    <span className="text-right max-w-48">{order.notes}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Proof Section (non-COD, not yet submitted) */}
            {order.payment_method !== "cash_on_delivery" && !submitted && (
              <div className="rounded-lg border p-4 space-y-4">
                <div>
                  <h3 className="text-sm font-medium">Submit Payment Proof</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Complete your payment using the receiving info shown during checkout,
                    then submit the transaction details below.
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium">Transaction Reference *</label>
                  <Input
                    value={proofReference}
                    onChange={(e) => setProofReference(e.target.value)}
                    placeholder="e.g., TXN123456"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Payment Screenshot *</label>
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
                    <p className="mt-1 text-xs text-muted-foreground">Uploading...</p>
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

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => router.push("/orders")}
                  >
                    Skip — View My Orders
                  </Button>
                  <Button
                    onClick={handleSubmitProof}
                    disabled={submitting || uploading || !proofScreenshotUrl}
                  >
                    {submitting ? "Submitting..." : "Submit Proof"}
                  </Button>
                </div>
              </div>
            )}

            {/* COD message */}
            {order.payment_method === "cash_on_delivery" && (
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                <p className="text-sm font-medium text-primary">Pay on Delivery</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  You will pay when you receive your order. No need to submit any payment proof.
                </p>
              </div>
            )}

            {/* Success message after proof submission */}
            {submitted && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                <p className="text-sm font-medium text-green-700">Payment Submitted</p>
                <p className="mt-1 text-xs text-green-600">
                  Your payment proof has been submitted and is pending verification. We will
                  notify you once it&apos;s confirmed.
                </p>
              </div>
            )}

            {/* Navigation */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button className="flex-1" asChild>
                <Link href="/orders">View My Orders</Link>
              </Button>
              <Button variant="outline" className="flex-1" asChild>
                <Link href="/">Continue Shopping</Link>
              </Button>
            </div>
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
