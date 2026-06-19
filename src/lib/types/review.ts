export interface Review {
  id: string;
  rating: number;
  comment: string;
  reviewer_name: string;
  relative_date: string;
  is_verified: boolean;
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

export interface ReviewListResponse {
  data: Review[];
  meta: PaginationMeta;
}
