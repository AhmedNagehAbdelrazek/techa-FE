import type { Review } from "./review";

export interface ProductImage {
  id?: string;
  url: string;
  alt_text: string | null;
  is_primary?: boolean;
  sort_order?: number;
}

export interface ProductBrand {
  id: string;
  name: string;
  slug: string;
}

export interface BrandBrief {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
}

export interface CategoryBrief {
  id: string;
  name: string;
  slug: string;
}

export interface VariantOption {
  option_name: string;
  option_value: string;
}

export interface ProductVariant {
  id: string;
  sku: string;
  price: number | null;
  discount_percent: number | null;
  stock_qty: number;
  is_active: boolean;
  options: VariantOption[];
  images: ProductImage[];
}

export interface AttributePair {
  label: string;
  value: string;
}

export interface ProductAttributes {
  details: AttributePair[];
  specs: AttributePair[];
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface ProductDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  about_points: string[];
  base_price: number;
  discount_percent: number;
  rating_avg: number;
  rating_count: number;
  is_featured: boolean;
  category: CategoryBrief | null;
  brand: BrandBrief | null;
  attributes: ProductAttributes;
  images: ProductImage[];
  variants: ProductVariant[];
  reviews: Review[];
  tags: Tag[];
}

export interface ProductListItem {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  discount_percent: number;
  primary_image: ProductImage | null;
  brand: ProductBrand | null;
  rating_avg: number;
  rating_count: number;
  is_featured: boolean;
  created_at: string;
}

export interface ProductListResponse {
  data: ProductListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
