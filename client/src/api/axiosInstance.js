import axios from "axios";
import useAuthStore from "../store/useAuthStore";
import { refreshToken as refreshTokenApi } from "./endpoints";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL + "/api",
  withCredentials: true,
});

// Add response interceptor for token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // If token_invalid and not already retried
    if (
      error.response &&
      error.response.data?.status === "TOKEN_EXPIRED" &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        const res = await refreshTokenApi();
        const newToken = res.data.data?.accessToken;
        if (newToken) {
          // Update token in auth store
          const { setToken } = useAuthStore.getState();
          setToken(newToken);
          // Update Authorization header and retry
          originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshErr) {
        // If refresh fails, logout
        const { logout } = useAuthStore.getState();
        logout();
        window.location.href = "/signin";
        return Promise.reject(refreshErr);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
