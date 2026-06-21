export interface Review {
  id: string;
  product_id?: string;
  rating: number;
  comment: string;
  reviewer_name: string;
  relative_date: string;
  is_verified: boolean;
  is_active?: boolean;
  createdat?: string;
  user: UserBrief;
}

export interface RatingDistribution {
  star: number;
  count: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface UserBrief {
  id: string;
  name: string;
  avatar_url: string | null;
}

export interface ReviewEligibilityResponse {
  can_review: boolean;
  reason?: string | null;
}

export interface CreateReviewRequest {
  rating: number;
  comment: string;
  order_item_id?: string;
}

export interface UpdateReviewRequest {
  rating?: number;
  comment?: string;
}

export interface ReviewListResponse {
  data: Review[];
  meta: PaginationMeta;
}
