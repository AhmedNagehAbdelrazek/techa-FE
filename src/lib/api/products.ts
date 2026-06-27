import { request } from "./Request";
import type { ProductDetail, ProductListItem, ProductListResponse } from "@/lib/types/product";

interface ApiProductImage {
  url: string;
  alt_text: string | null;
}

interface ApiProductBrand {
  id: string;
  name: string;
  slug: string;
}

interface ApiProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  discount_percent: number;
  primary_image: ApiProductImage | null;
  brand: ApiProductBrand | null;
  rating_avg: number;
  rating_count: number;
  is_featured: boolean;
  stock_qty: number;
  createdat: string;
}

interface ApiMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ApiProductListResponse {
  data: ApiProduct[];
  meta: ApiMeta;
}

function mapProduct(api: ApiProduct): ProductListItem {
  return {
    id: api.id,
    name: api.name,
    slug: api.slug,
    price: api.price,
    discount_percent: api.discount_percent,
    primary_image: api.primary_image ?? null,
    brand: api.brand ?? null,
    rating_avg: api.rating_avg,
    rating_count: api.rating_count,
    is_featured: api.is_featured,
    stock_qty: api.stock_qty,
    createdat: api.createdat,
  };
}

export async function getProducts(params?: Record<string, string | number | boolean>): Promise<ProductListResponse> {
  const searchParams = new URLSearchParams();
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.set(key, String(value));
      }
    }
  }
  const query = searchParams.toString();
  const url = `/api/products${query ? `?${query}` : ""}`;
  const data = await request.get<ApiProductListResponse>(url);
  return {
    data: data.data.map(mapProduct),
    pagination: {
      page: data.meta.page,
      limit: data.meta.limit,
      total: data.meta.total,
      totalPages: data.meta.totalPages,
    },
  };
}

// 🐴 ponytail: same shape as getProducts, different endpoint
export async function getOnSaleProducts(params?: Record<string, string | number | boolean>): Promise<ProductListResponse> {
  const searchParams = new URLSearchParams();
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.set(key, String(value));
      }
    }
  }
  const query = searchParams.toString();
  const url = `/api/products/on-sale${query ? `?${query}` : ""}`;
  const data = await request.get<ApiProductListResponse>(url);
  return {
    data: data.data.map(mapProduct),
    pagination: {
      page: data.meta.page,
      limit: data.meta.limit,
      total: data.meta.total,
      totalPages: data.meta.totalPages,
    },
  };
}

export async function searchProducts(q: string) {
  // 🐴 ponytail: inline response type, matches only what the dropdown needs
  const res = await request.get<{
    data: { id: string; name: string; slug: string; image: string; available: boolean }[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }>(`/api/products/search?q=${encodeURIComponent(q)}&page=1&limit=5`);
  return res.data;
}

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  try {
    return await request.get<ProductDetail>(`/api/products/${slug}`);
  } catch {
    return null;
  }
}
