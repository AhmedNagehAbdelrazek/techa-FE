export interface Banner {
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
