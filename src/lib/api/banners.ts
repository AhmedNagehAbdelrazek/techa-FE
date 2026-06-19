import { request } from "./Request";
import type { Banner } from "@/lib/types/banner";

interface ApiBanner {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  link_url: string | null;
  position: "hero" | "mid_page" | "sidebar" | "popup";
  sort_order: number;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
}

function mapBanner(api: ApiBanner): Banner {
  return {
    id: api.id,
    title: api.title,
    description: api.description,
    image_url: api.image_url,
    link_url: api.link_url,
    position: api.position,
    sort_order: api.sort_order,
    starts_at: api.starts_at,
    ends_at: api.ends_at,
    is_active: api.is_active,
  };
}

export async function getBanners(position?: string): Promise<Banner[]> {
  const params = position ? `?position=${position}` : "";
  const data = await request.get<ApiBanner[]>(`/api/banners${params}`);
  return data.map(mapBanner);
}
