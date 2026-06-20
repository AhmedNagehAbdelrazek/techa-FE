export interface Address {
  id: string;
  full_name: string;
  phone: string;
  street: string;
  city: string;
  zone_id: string;
  label?: string;
  building?: string;
  apartment?: string;
  landmark?: string;
  notes?: string;
  is_default: boolean;
}

export interface DeliveryZone {
  id: string;
  name: string;
  regions: string[];
}

export interface ShippingRateResponse {
  zone_id: string;
  zone_name: string;
  rate_id: string;
  charge: number;
  estimated_days_min: number;
  estimated_days_max: number;
  is_free: boolean;
}

export type PaymentMethod = "cash_on_delivery" | "instapay" | "vodafone_cash";

export interface PaymentMethodInfo {
  instapay: { handle: string } | null;
  vodafone_cash: { number: string } | null;
}

export interface PaymentMethodsResponse {
  cash_on_delivery: { enabled: boolean };
  instapay: { enabled: boolean; handle: string };
  vodafone_cash: { enabled: boolean; number: string };
}

export interface OrderItem {
  product_name: string;
  variant_label: string | null;
  qty: number;
  unit_price: number;
  line_total: number;
}

export interface OrderStatusHistory {
  status: string;
  changed_at: string;
  from_status: string | null;
  to_status: string | null;
}

export interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_method: PaymentMethod;
  payment_status: string;
  subtotal: number;
  discount: number;
  shipping_charge: number;
  total: number;
  coupon: CartCoupon | null;
  shipping_address: {
    full_name: string;
    phone: string;
    street: string;
    city: string;
  };
  notes: string | null;
  items: OrderItem[];
  status_history: OrderStatusHistory[];
  created_at: string;
  updated_at: string;
  proof_reference?: string;
  proof_screenshot_url?: string;
}

export interface CartCoupon {
  id: string;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
}

export interface CreateAddressRequest {
  full_name: string;
  phone: string;
  street: string;
  city: string;
  zone_id: string;
  label?: string;
  building?: string;
  apartment?: string;
  landmark?: string;
  notes?: string;
}

export interface UpdateAddressRequest {
  full_name?: string;
  phone?: string;
  street?: string;
  city?: string;
  zone_id?: string;
  label?: string;
  building?: string;
  apartment?: string;
  landmark?: string;
  notes?: string;
  is_default?: boolean;
}

export interface PlaceOrderRequest {
  address_id: string;
  payment_method: PaymentMethod;
  notes?: string;
}

export interface SubmitProofRequest {
  order_id: string;
  proof_reference: string;
  proof_screenshot_url: string;
}

export interface UploadResponse {
  url: string;
}

export interface SubmitProofResponse {
  status: string;
  message: string;
}
