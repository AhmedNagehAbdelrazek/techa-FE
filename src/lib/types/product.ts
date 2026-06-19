export interface ProductImage {
  url: string;
  alt_text: string | null;
}

export interface ProductBrand {
  id: string;
  name: string;
  slug: string;
}

export interface ProductRating {
  average: number;
  count: number;
}

export interface ProductListItem {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  discount_percent: number;
  primary_image: ProductImage | null;
  brand: ProductBrand | null;
  rating: ProductRating;
  is_featured: boolean;
  created_at: string;
}

export interface ProductListResponse {
  data: ProductListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
