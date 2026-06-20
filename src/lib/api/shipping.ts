import { request } from "./Request";
import type { ShippingRateResponse } from "@/lib/types/order";

export async function getShippingRate(addressId: string, orderTotal: number): Promise<ShippingRateResponse> {
  return request.get<ShippingRateResponse>("/api/shipping/rate", {
    params: { address_id: addressId, order_total: orderTotal },
  });
}
