import { request } from "./Request";

export interface CouponValidationResponse {
  valid: boolean;
  discount_amount: number;
  discount_type: "percentage" | "fixed" | null;
  message: string | null;
}

export async function validateCoupon(code: string, productId: string): Promise<CouponValidationResponse> {
  return request.post<CouponValidationResponse>("/api/coupons/validate", {
    code,
    product_id: productId,
  });
}
