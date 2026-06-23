"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";

import { ReviewsTable } from "@/components/admin/ReviewsTable";

export default function AdminReviewsPage() {
  useEffect(() => { document.title = "إدارة التقييمات — TechA"; }, []);
  return (
    <Suspense fallback={<ReviewsPageSkeleton />}>
      <AdminReviewsPageContent />
    </Suspense>
  );
}

function ReviewsPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-8 w-24 bg-muted rounded animate-pulse" />
      </div>
    </div>
  );
}

function AdminReviewsPageContent() {
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") ?? "1");
  const status = searchParams.get("status") ?? "";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Reviews</h1>
      </div>
      <ReviewsTable page={page} status={status} />
    </div>
  );
}
