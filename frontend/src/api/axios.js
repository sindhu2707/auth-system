import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api/auth";

// This instance is used for all authenticated requests
const api = axios.create({
  baseURL: "http://localhost:5000/api/auth",
  withCredentials: true, // ⚠️ critical: sends the httpOnly refresh cookie automatically
});

// We'll inject the in-memory access token into this variable from AuthContext
let accessToken = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

// We'll set this from AuthContext too — it points to a function that
// calls /refresh and updates state when the token changes
let onTokenRefreshed = null;
export const setOnTokenRefreshed = (callback) => {
  onTokenRefreshed = callback;
};

let onAuthFailure = null;
export const setOnAuthFailure = (callback) => {
  onAuthFailure = callback;
};

// REQUEST interceptor: attach the access token to every outgoing request
api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// RESPONSE interceptor: if a request fails with 401 (expired access token),
// try refreshing once, then retry the original request
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only handle 401s, and don't retry the refresh endpoint itself
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/refresh")
    ) {
      if (isRefreshing) {
        // If a refresh is already in progress, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post(
          "http://localhost:5000/api/auth/refresh",
          {},
          {
            withCredentials: true,
          }
        );

        const newToken = res.data.accessToken;

        setAccessToken(newToken);
        if (onTokenRefreshed) onTokenRefreshed(newToken);

        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        if (onAuthFailure) onAuthFailure(); // refresh token expired too → log out
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;