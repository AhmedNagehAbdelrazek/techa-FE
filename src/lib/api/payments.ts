import { request } from "./Request";
import type {
  PaymentMethodsResponse,
  SubmitProofRequest,
  SubmitProofResponse,
  UploadResponse,
} from "@/lib/types/order";

interface RequestPaymentMethodsResponse {
  data: PaymentMethodsResponse
}

export async function getPaymentMethods(): Promise<PaymentMethodsResponse> {
  const res = await request.get<RequestPaymentMethodsResponse>("/api/payments/methods");
  return res.data;
}

export async function submitProof(data: SubmitProofRequest): Promise<SubmitProofResponse> {
  return request.post<SubmitProofResponse>("/api/payments/submit-proof", data);
}

export async function uploadFile(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  return request.post<UploadResponse>("/api/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}
