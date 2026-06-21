import type { ProductImage, ProductBrand } from "./product";

export interface WishlistItemWithProduct {
  id: string;
  product_id: string;
  variant_id: string | null;
  Product: {
    name: string;
    slug: string;
    base_price: number;
    discount_percent: number;
    primary_image: ProductImage | null;
    brand: ProductBrand | null;
    is_in_stock: boolean;
  };
  createdat: string;
}
