import axios from "axios";
import { toast } from "sonner";

// Create Axios instance - uses Next.js rewrite proxy to avoid CORS
const client = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Dynamic token getter - avoids circular dependency with auth store
let tokenGetter: (() => string | null) | null = null;

export const setTokenGetter = (getter: () => string | null) => {
  tokenGetter = getter;
};

// CSRF token management
let csrfToken: string | null = null;

export const setCsrfToken = (token: string) => {
  csrfToken = token;
};

export const getCsrfToken = () => csrfToken;

// Function to set unauthorized callback
let onUnauthorizedCallback: (() => void) | null = null;

export const setOnUnauthorized = (callback: (() => void) | null) => {
  onUnauthorizedCallback = callback;
};

// Request interceptor - attach CSRF token and auth token
client.interceptors.request.use(
  (config) => {
    // Attach auth token
    if (tokenGetter) {
      const token = tokenGetter();
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    // Attach CSRF token for state-changing methods
    if (config.method && ['post', 'put', 'patch', 'delete'].includes(config.method)) {
      if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
client.interceptors.response.use(
  (response) => {
    // Extract CSRF token from response if present
    const newCsrfToken = response.headers["x-csrf-token"];
    if (newCsrfToken) {
      setCsrfToken(newCsrfToken);
    }
    return response;
  },
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      // Call unauthorized callback if set
      if (onUnauthorizedCallback) {
        onUnauthorizedCallback();
      }
    }

    // Show toast for auth-related errors
    if (status === 401 || status === 403 || status === 429) {
      const message =
        error.response?.data?.message || "An unexpected error occurred";
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

export default client;
