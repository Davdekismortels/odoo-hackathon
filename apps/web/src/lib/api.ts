import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL ?? "/api/v1";

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
// A single shared refresh promise that all concurrent 401s await,
// preventing duplicate refresh calls and token invalidation.
let refreshPromise: Promise<string> | null = null;

function getRefreshedToken(): Promise<string> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) throw new Error("No refresh token");

    const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
    const newAccess: string = data.data.accessToken;
    const newRefresh: string = data.data.refreshToken;

    localStorage.setItem("accessToken", newAccess);
    localStorage.setItem("refreshToken", newRefresh);
    api.defaults.headers.common.Authorization = `Bearer ${newAccess}`;

    return newAccess;
  })().finally(() => {
    // Always clear so the next expiry triggers a fresh refresh
    refreshPromise = null;
  });

  return refreshPromise;
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    original._retry = true;

    try {
      const newToken = await getRefreshedToken();
      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original);
    } catch (err) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/login";
      return Promise.reject(err);
    }
  }
);

