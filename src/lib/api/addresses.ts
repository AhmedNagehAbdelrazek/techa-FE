import { request } from "./Request";
import type { Address, DeliveryZone, CreateAddressRequest, UpdateAddressRequest } from "@/lib/types/order";

interface AddressListResponse {
  data: Address[];
}

interface ZoneListResponse {
  zones: DeliveryZone[];
}

export async function listAddresses(): Promise<Address[]> {
  const res = await request.get<AddressListResponse>("/api/addresses");
  return res.data;
}

export async function createAddress(data: CreateAddressRequest): Promise<Address> {
  return request.post<Address>("/api/addresses", data);
}

export async function updateAddress(id: string, data: UpdateAddressRequest): Promise<Address> {
  return request.put<Address>(`/api/addresses/${id}`, data);
}

export async function setDefaultAddress(id: string): Promise<Address> {
  return request.patch<Address>(`/api/addresses/${id}/set-default`);
}

export async function deleteAddress(id: string): Promise<void> {
  await request.delete<void>(`/api/addresses/${id}`);
}

export async function getDeliveryZones(): Promise<DeliveryZone[]> {
  const res = await request.get<ZoneListResponse>("/api/public/delivery-zones");
  return res.zones;
}
