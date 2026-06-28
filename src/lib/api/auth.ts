import { request } from "./Request";
import type {
  RegisterPayload,
  LoginPayload,
  VerifyEmailPayload,
  ResendVerificationPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  UpdateProfilePayload,
  User,
} from "@/lib/types/auth";

// Raw API response types (snake_case from backend)
interface ApiUser {
  id: string;
  email: string;
  name: string;
  role: string;
  phone: string;
  avatar_url: string | null;
  is_verified?: boolean;
  createdat?: string;
}

interface ApiAuthResponse {
  token: string;
  refreshToken?: string;
  user: ApiUser;
}

interface ApiMessageResponse {
  message: string;
}

interface ApiRegisterResponse {
  message: string;
  user: { id: string; name: string; email: string };
}

interface ApiUpdateResponse {
  message: string;
  user: ApiUser;
}

function mapUser(api: ApiUser): User {
  return {
    id: api.id,
    email: api.email,
    name: api.name,
    role: api.role,
    phone: api.phone,
    avatarUrl: api.avatar_url,
    isVerified: api.is_verified,
    createdAt: api.createdat,
  };
}

export async function register(payload: RegisterPayload) {
  return request.post<ApiRegisterResponse>("/api/auth/register", payload);
}

export async function verifyEmail(payload: VerifyEmailPayload) {
  return request.post<ApiMessageResponse>("/api/auth/verify-email", payload);
}

export async function resendVerification(payload: ResendVerificationPayload) {
  return request.post<ApiMessageResponse>(
    "/api/auth/resend-verification",
    payload,
  );
}

export async function login(payload: LoginPayload) {
  const data = await request.post<ApiAuthResponse>("/api/auth/login", payload);
  return { token: data.token, refreshToken: data.refreshToken, user: mapUser(data.user) };
}

export async function getMe() {
  const data = await request.get<ApiUser>("/api/auth/me");
  return mapUser(data);
}

export async function updateMe(payload: UpdateProfilePayload) {
  const data = await request.patch<ApiUpdateResponse>("/api/auth/me", payload);
  return { message: data.message, user: mapUser(data.user) };
}

export async function logout() {
  return request.post<ApiMessageResponse>("/api/auth/logout");
}

export async function forgotPassword(payload: ForgotPasswordPayload) {
  return request.post<ApiMessageResponse>(
    "/api/auth/forgot-password",
    payload,
  );
}

export async function resetPassword(payload: ResetPasswordPayload) {
  return request.post<ApiMessageResponse>("/api/auth/reset-password", payload);
}
