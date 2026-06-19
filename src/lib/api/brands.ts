import { request } from "./Request";
import type { Brand } from "@/lib/types/brand";

interface ApiBrand {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
}

function mapBrand(api: ApiBrand): Brand {
  return {
    id: api.id,
    name: api.name,
    slug: api.slug,
    logo_url: api.logo_url,
  };
}

export async function getBrands(): Promise<Brand[]> {
  const data = await request.get<ApiBrand[]>("/api/brands");
  return data.map(mapBrand);
}
