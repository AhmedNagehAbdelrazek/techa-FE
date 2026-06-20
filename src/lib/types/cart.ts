export interface Cart {
  id: string;
  subtotal: number;
  discount: number;
  total: number;
  coupon: CartCoupon | null;
  items: CartItem[];
  version: number;
}

export interface CartItem {
  id: string;
  product_id: string;
  product_name: string;
  product_slug: string;
  product_image: string | null;
  variant_id: string | null;
  variant_label: string | null;
  qty: number;
  unit_price: number;
  total_price: number;
  current_price: number;
  price_changed: boolean;
}

export interface CartCoupon {
  id: string;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
}

export interface AddItemRequest {
  product_id: string;
  variant_id: string | null;
  qty: number;
}

export interface UpdateItemRequest {
  qty: number;
}

export interface ApplyCouponRequest {
  code: string;
}
