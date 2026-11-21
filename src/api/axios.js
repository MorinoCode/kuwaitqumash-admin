import axios from "axios";

function resolveApiBaseUrl() {
  if (typeof window !== "undefined" && window.location) {
    const hostname = window.location.hostname;
    const isLocal =
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "0.0.0.0" ||
      hostname.endsWith(".local");

    if (isLocal) {
      const envUrl = import.meta.env.VITE_API_URL;
      if (envUrl && (envUrl.includes("localhost") || envUrl.includes("127.0.0.1"))) {
        return envUrl;
      }
      return "http://localhost:5001";
    }

    const envUrl = import.meta.env.VITE_API_URL;
    if (envUrl && !envUrl.includes("localhost") && !envUrl.includes("127.0.0.1")) {
      return envUrl;
    }
    return "https://152.70.24.75.nip.io";
  }

  return (
    import.meta.env.VITE_API_URL ||
    (import.meta.env.PROD ? "https://152.70.24.75.nip.io" : "http://localhost:5001")
  );
}

const rawApiUrl = resolveApiBaseUrl();
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
