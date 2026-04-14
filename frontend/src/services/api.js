import axios from "axios";

// ── API Base URL ──────────────────────────────────────────────────────────────
// Set VITE_API_URL in your .env.local (dev) or Vercel Environment Variables (prod)
// Example: https://<your-hf-username>-skilldelta-backend.hf.space
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:7860";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
});

// Attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle expired tokens
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Only redirect if it's a 401 and NOT from the login endpoint
    if (err.response?.status === 401 && !err.config.url.includes("/auth/login")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user_id");
      window.location.href = "/";
    }
    return Promise.reject(err);
  }
);

/**
 * Fire-and-forget backend wake call.
 * Call this once on app mount so the HF Space is warm
 * before the user interacts with the login form.
 */
export const wakeBackend = async () => {
  try {
    await fetch(`${BASE_URL}/health/ping`);
  } catch (_) {
    // Silently ignore — server may still be starting
  }
};

export default api;
