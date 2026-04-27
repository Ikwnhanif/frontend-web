import axios from "axios";

const api = axios.create({
  // Mengambil URL dari .env.local
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
});

// Interceptor: Tempelkan token JWT di setiap request secara otomatis
api.interceptors.request.use((config) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: Jika token expired (401), otomatis lempar ke login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.clear();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
