import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api/v1";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: false,
});

// ── Request interceptor: attach access token ───────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response interceptor: refresh on 401 ──────────────────────────────────
let isRefreshing = false;
let pendingQueue: Array<{ resolve: (t: string) => void; reject: (e: unknown) => void }> = [];

function processQueue(token: string | null, error: unknown = null) {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (token) resolve(token);
    else reject(error);
  });
  pendingQueue = [];
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({ resolve, reject });
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) throw new Error("No refresh token");

      const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
      const newAccess: string = data.data.accessToken;
      const newRefresh: string = data.data.refreshToken;

      localStorage.setItem("accessToken", newAccess);
      localStorage.setItem("refreshToken", newRefresh);

      api.defaults.headers.common.Authorization = `Bearer ${newAccess}`;
      processQueue(newAccess);

      original.headers.Authorization = `Bearer ${newAccess}`;
      return api(original);
    } catch (err) {
      processQueue(null, err);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/login";
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);
