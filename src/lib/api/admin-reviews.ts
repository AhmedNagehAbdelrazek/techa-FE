import { adminRequest } from "./AdminRequest";
import type { Review, PaginationMeta } from "@/lib/types/review";

export interface AdminReviewListResponse {
  data: Review[];
  meta: PaginationMeta;
}

export function getAdminReviews(params: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<AdminReviewListResponse> {
  return adminRequest.get("/api/admin/reviews", { params });
}

export function approveAdminReview(id: string): Promise<void> {
  return adminRequest.put(`/api/admin/reviews/${id}/approve`);
}

export function rejectAdminReview(id: string): Promise<void> {
  return adminRequest.put(`/api/admin/reviews/${id}/reject`);
}

export function deleteAdminReview(id: string): Promise<void> {
  return adminRequest.delete(`/api/admin/reviews/${id}`);
}

export const adminReviewKeys = {
  all: ["admin", "reviews"] as const,
  lists: () => [...adminReviewKeys.all, "list"] as const,
  list: (params: { page?: number; limit?: number; status?: string }) =>
    [...adminReviewKeys.lists(), params] as const,
};
