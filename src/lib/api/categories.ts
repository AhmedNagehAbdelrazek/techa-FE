import { request } from "./Request";
import type { Category } from "@/lib/types/category";

interface ApiCategory {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  children: ApiCategory[];
}

function mapCategory(api: ApiCategory): Category {
  return {
    id: api.id,
    name: api.name,
    slug: api.slug,
    image_url: api.image_url,
    sort_order: api.sort_order,
    is_active: api.is_active,
    children: (api.children ?? []).map(mapCategory),
  };
}

export async function getCategoryTree(): Promise<Category[]> {
  const data = await request.get<ApiCategory[]>("/api/categories/tree");
  return data.map(mapCategory);
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    const data = await request.get<ApiCategory>(`/api/categories/${slug}`);
    return mapCategory(data);
  } catch {
    return null;
  }
}
