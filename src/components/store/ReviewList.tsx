"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { Review, UpdateReviewRequest } from "@/lib/types/review";
import { getProductReviews, checkReviewEligibility, createReview, updateReview, deleteReview } from "@/lib/api/reviews";
import type { ReviewListResponse } from "@/lib/types/review";
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
import { useAuthStore } from "@/lib/stores/auth.store";

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

function StarRatingSelector({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((star) => {
        const active = hovered || value;
        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star} star${star > 1 ? "s" : ""}`}
            className="cursor-pointer p-0.5 transition-transform hover:scale-110"
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(star === value ? 0 : star)}
          >
            <Star
              className={cn(
                "h-6 w-6",
                star <= active ? "fill-yellow-400 text-yellow-400" : "fill-none text-muted-foreground/30",
              )}
            />
          </button>
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

function ReviewCard({
  review,
  currentUserId,
  onSaveEdit,
  onDelete,
}: {
  review: Review;
  currentUserId: string | null;
  onSaveEdit: (reviewId: string, data: UpdateReviewRequest) => Promise<void>;
  onDelete: (reviewId: string) => Promise<void>;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editRating, setEditRating] = useState(review.rating);
  const [editComment, setEditComment] = useState(review.comment);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwn = currentUserId !== null && currentUserId === review?.user?.id;

  const handleSave = async () => {
    if (editRating < 1 || !editComment.trim() || isSaving) return;
    setIsSaving(true);
    try {
      await onSaveEdit(review.id, { rating: editRating, comment: editComment.trim() });
      setIsEditing(false);
      toast.success("Review updated successfully");
    } catch {
      toast.error("Failed to update review. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditRating(review.rating);
    setEditComment(review.comment);
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      await onDelete(review.id);
      toast.success("Review deleted successfully");
    } catch {
      toast.error("Failed to delete review. Please try again.");
    } finally {
      setIsDeleting(false);
      setDeleteOpen(false);
    }
  };

  if (isEditing) {
    return (
      <div className="rounded-lg border p-4">
        <div className="mb-3 flex items-center gap-2">
          <StarRatingSelector value={editRating} onChange={setEditRating} />
          {editRating > 0 && <span className="text-sm text-muted-foreground">{editRating}/5</span>}
        </div>
        <textarea
          value={editComment}
          onChange={(e) => setEditComment(e.target.value)}
          className="mb-3 min-h-[80px] w-full rounded-md border bg-background p-3 text-sm outline-none focus:border-primary"
          maxLength={2000}
          aria-label="Edit review comment"
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="button" size="sm" disabled={editRating < 1 || !editComment.trim() || isSaving} onClick={handleSave}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    );
  }

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
      <p className="mb-3 text-sm leading-relaxed">{review.comment}</p>
      {isOwn && (
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="xs" onClick={() => setIsEditing(true)}>
            Edit
          </Button>
          <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="outline" size="xs">
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Review</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this review? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction disabled={isDeleting} onClick={handleDelete}>
                  {isDeleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
}

export function ReviewList({ productId, initialReviews }: ReviewListProps) {
  const { user, isAuthenticated } = useAuthStore();
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialReviews.length > 0);

  const [canReview, setCanReview] = useState(false);
  const [eligibilityReason, setEligibilityReason] = useState<string | null>(null);
  const [isCheckingEligibility, setIsCheckingEligibility] = useState(false);

  const [formRating, setFormRating] = useState(0);
  const [formComment, setFormComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const distribution = computeDistribution(reviews);

  useEffect(() => {
    if (!isAuthenticated) return;
    setIsCheckingEligibility(true);
    checkReviewEligibility(productId)
      .then((res) => {
        setCanReview(res.can_review);
        setEligibilityReason(res.reason ?? null);
      })
      .catch(() => {
        setCanReview(false);
      })
      .finally(() => setIsCheckingEligibility(false));
  }, [productId, isAuthenticated]);

  const handleSubmitReview = async () => {
    if (formRating < 1 || !formComment.trim() || isSubmitting) return;
    setIsSubmitting(true);

    const submittedRating = formRating;
    const submittedComment = formComment.trim();

    const temp: Review = {
      id: `temp-${crypto.randomUUID()}`,
      rating: submittedRating,
      comment: submittedComment,
      reviewer_name: user?.name ?? "You",
      relative_date: "Just now",
      is_verified: false,
      user: { id: user?.id ?? "", name: user?.name ?? "You", avatar_url: null },
    };

    setReviews((prev) => [temp, ...prev]);
    setCanReview(false);
    setEligibilityReason("You have already reviewed this product.");
    setFormRating(0);
    setFormComment("");

    try {
      const created = await createReview(productId, { rating: submittedRating, comment: submittedComment });
      setReviews((prev) => prev.map((r) => (r.id === temp.id ? { ...created, user: temp.user } : r)));
      toast.success("Review submitted successfully");
    } catch {
      setReviews((prev) => prev.filter((r) => r.id !== temp.id));
      setCanReview(true);
      setEligibilityReason(null);
      setFormRating(submittedRating);
      setFormComment(submittedComment);
      toast.error("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateReview = async (reviewId: string, data: UpdateReviewRequest) => {
    let prev: Review | undefined;
    setReviews((existing) => {
      prev = existing.find((r) => r.id === reviewId);
      return existing.map((r) => (r.id === reviewId ? { ...r, ...data } : r));
    });
    try {
      const updated = await updateReview(reviewId, data);
      setReviews((existing) => existing.map((r) => (r.id === reviewId ? { ...updated, user: r.user } : r)));
    } catch {
      if (prev) setReviews((existing) => existing.map((r) => (r.id === reviewId ? prev! : r)));
      throw new Error("Update failed");
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    let prev: Review | undefined;
    let prevIdx = -1;
    setReviews((existing) => {
      prevIdx = existing.findIndex((r) => r.id === reviewId);
      prev = existing[prevIdx];
      return existing.filter((r) => r.id !== reviewId);
    });
    try {
      await deleteReview(reviewId);
    } catch {
      if (prev) {
        setReviews((existing) => {
          const copy = [...existing];
          copy.splice(prevIdx, 0, prev!);
          return copy;
        });
      }
      throw new Error("Delete failed");
    }
  };

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
      toast.error("Failed to load reviews. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {!isCheckingEligibility && isAuthenticated && canReview && (
        <div className="rounded-lg border p-4">
          <h4 className="mb-3 text-sm font-semibold">Write a Review</h4>
          <div className="mb-3 flex items-center gap-2">
            <StarRatingSelector value={formRating} onChange={setFormRating} />
            {formRating > 0 && <span className="text-sm text-muted-foreground">{formRating}/5</span>}
          </div>
          <textarea
            value={formComment}
            onChange={(e) => setFormComment(e.target.value)}
            placeholder="Share your thoughts about this product..."
            className="mb-3 min-h-[80px] w-full rounded-md border bg-background p-3 text-sm outline-none focus:border-primary"
            maxLength={2000}
            aria-label="Review comment"
          />
          <div className="flex justify-end">
            <Button
              type="button"
              disabled={formRating < 1 || !formComment.trim() || isSubmitting}
              onClick={handleSubmitReview}
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        </div>
      )}
      {!isCheckingEligibility && isAuthenticated && !canReview && eligibilityReason && (
        <p className="text-sm text-muted-foreground">{eligibilityReason}</p>
      )}

      {reviews.length > 0 && (
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
      )}

      {reviews.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground">No reviews yet</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} currentUserId={user?.id ?? null} onSaveEdit={handleUpdateReview} onDelete={handleDeleteReview} />
          ))}
        </div>
      )}

      {hasMore && reviews.length > 0 && (
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
