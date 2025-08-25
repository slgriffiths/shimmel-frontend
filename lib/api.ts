import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,  // Ensures cookies (refresh token) are sent
  headers: { "Content-Type": "application/json" },
});

// Function to update access token (will be called from useAuth)
export const updateApiToken = (token: string) => {
  api.defaults.headers.Authorization = `Bearer ${token}`;
};

// Track if refresh has failed to prevent infinite refresh loops
let refreshFailed = false;

// Function to reset refresh state (call after successful login)
export const resetRefreshState = () => {
  refreshFailed = false;
};

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password'];

// Helper function to check if current route is public
const isPublicRoute = () => {
  if (typeof window === 'undefined') return false;
  const currentPath = window.location.pathname;
  return PUBLIC_ROUTES.some(route => currentPath.startsWith(route));
};

api.interceptors.response.use(
  (response) => {
    // Check for new access token in response headers
    const newToken = response.headers['x-new-access-token'];
    if (newToken) {
      // Dispatch event to update token in useAuth hook
      window.dispatchEvent(new CustomEvent('tokenRefresh', { detail: newToken }));
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Don't try to refresh if we already know refresh failed or if we're on a public route
    if (error.response?.status === 401 && !originalRequest._retry && !refreshFailed) {
      originalRequest._retry = true;

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Token refresh failed');
        }

        const data = await response.json();
        const newToken = data.access_token;
        
        // Reset refresh failed flag on successful refresh
        refreshFailed = false;
        
        api.defaults.headers.Authorization = `Bearer ${newToken}`;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        // Notify useAuth hook of token update
        window.dispatchEvent(new CustomEvent('tokenRefresh', { detail: newToken }));

        return api(originalRequest);
      } catch (refreshError) {
        console.error("Failed to refresh token", refreshError);
        
        // Mark refresh as failed to prevent further attempts
        refreshFailed = true;
        
        // Only redirect to login if not already on a public route
        if (!isPublicRoute()) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);