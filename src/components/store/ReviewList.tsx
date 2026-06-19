"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Review } from "@/lib/types/review";
import { getProductReviews } from "@/lib/api/reviews";
import type { ReviewListResponse } from "@/lib/types/review";

interface ReviewListProps {
  productId: string;
  initialReviews: Review[];
}

function RatingStars({ rating, size = "sm" }: { rating: number; size?: "sm" | "xs" }) {
  const cls = size === "sm" ? "h-4 w-4" : "h-3 w-3";
  return (
    <div className="flex" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= Math.round(rating);
        return (
          <Star
            key={star}
            className={cn(
              cls,
              filled ? "fill-yellow-400 text-yellow-400" : "fill-none text-muted-foreground/30",
            )}
          />
        );
      })}
    </div>
  );
}

function RatingDistributionBar({ label, count, max }: { label: string; count: number; max: number }) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-8 text-right">{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-yellow-400 transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-6 text-right text-muted-foreground">{count}</span>
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="rounded-lg border p-4">
      <div className="mb-2 flex items-center gap-2">
        <RatingStars rating={review.rating} size="xs" />
        {review.is_verified && (
          <Badge variant="secondary" className="text-[10px]">
            Verified Purchase
          </Badge>
        )}
      </div>
      <p className="mb-1 text-sm font-medium">{review.reviewer_name}</p>
      <p className="mb-2 text-xs text-muted-foreground">{review.relative_date}</p>
      <p className="text-sm leading-relaxed">{review.comment}</p>
    </div>
  );
}

export function ReviewList({ productId, initialReviews }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialReviews.length > 0);

  const distribution = computeDistribution(reviews);

  const handleLoadMore = async () => {
    if (isLoading) return;
    const nextPage = page + 1;
    setIsLoading(true);
    try {
      const result: ReviewListResponse = await getProductReviews(productId, nextPage);
      setReviews((prev) => [...prev, ...result.data]);
      setPage(result.meta.page);
      setHasMore(result.meta.page < result.meta.totalPages);
    } catch {
      // silently fail
    } finally {
      setIsLoading(false);
    }
  };

  if (reviews.length === 0) {
    return (
      <div className="text-center text-sm text-muted-foreground">
        No reviews yet
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border p-4">
        <h3 className="mb-3 text-sm font-semibold">Rating Distribution</h3>
        {distribution.map(({ star, count }) => (
          <RatingDistributionBar
            key={star}
            label={`${star}★`}
            count={count}
            max={Math.max(...distribution.map((d) => d.count), 1)}
          />
        ))}
      </div>
      <div className="space-y-4">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
      {hasMore && (
        <div className="flex justify-center">
          <Button type="button" variant="outline" disabled={isLoading} onClick={handleLoadMore}>
            {isLoading ? "Loading..." : "Load more reviews"}
          </Button>
        </div>
      )}
    </div>
  );
}

function computeDistribution(reviews: Review[]) {
  const dist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => Math.round(r.rating) === star).length,
  }));
  return dist;
}
