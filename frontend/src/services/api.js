import axios from "axios";

const api = axios.create({
  baseURL: "https://skilldelta-version-2.onrender.com",
  timeout: 20000, // prevent infinite waiting if Render spins up
});

// Attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Optional: Handle expired tokens
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

export default api;
