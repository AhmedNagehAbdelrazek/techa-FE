import { request } from "./Request";
import type { Review, ReviewEligibilityResponse, ReviewListResponse, CreateReviewRequest, UpdateReviewRequest } from "@/lib/types/review";

export async function getProductReviews(productId: string, page = 1, limit = 10): Promise<ReviewListResponse> {
  return request.get<ReviewListResponse>(`/api/products/${productId}/reviews?page=${page}&limit=${limit}`);
}

export async function checkReviewEligibility(productId: string): Promise<ReviewEligibilityResponse> {
  return request.get<ReviewEligibilityResponse>(`/api/products/${productId}/reviews/eligibility`);
}

export async function createReview(productId: string, data: CreateReviewRequest): Promise<Review> {
  return request.post<Review>(`/api/products/${productId}/reviews`, data);
}

export async function updateReview(reviewId: string, data: UpdateReviewRequest): Promise<Review> {
  return request.put<Review>(`/api/reviews/${reviewId}`, data);
}

export async function deleteReview(reviewId: string): Promise<{ message: string }> {
  return request.delete<{ message: string }>(`/api/reviews/${reviewId}`);
}
