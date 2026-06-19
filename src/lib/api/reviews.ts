import { request } from "./Request";
import type { ReviewListResponse } from "@/lib/types/review";

export async function getProductReviews(productId: string, page = 1, limit = 10): Promise<ReviewListResponse> {
  return request.get<ReviewListResponse>(`/api/products/${productId}/reviews?page=${page}&limit=${limit}`);
}
