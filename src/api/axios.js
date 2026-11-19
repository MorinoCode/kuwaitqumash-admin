import axios from "axios";

const rawApiUrl = import.meta.env.VITE_API_URL || "http://localhost:5001";
const cleanApiUrl = rawApiUrl
  .replace(/\/+$/, "")
  .replace(/\/api(?:\/admin)?$/, "");
const baseURL = `${cleanApiUrl}/api/admin`;

export const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("admin_token");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);
