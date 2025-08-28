'use client';
import { useState, useEffect } from 'react';
import { api, resetRefreshState } from '@/lib/api';
import { useRouter } from 'next/navigation';

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password'];

// Helper function to check if current route is public
const isPublicRoute = () => {
  if (typeof window === 'undefined') return false;
  const currentPath = window.location.pathname;
  return PUBLIC_ROUTES.some((route) => currentPath.startsWith(route));
};

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Only fetch user if not on a public route
    if (!isPublicRoute()) {
      fetchUser();
    } else {
      // If on public route, set loading to false immediately
      setIsLoading(false);
    }
    const cleanup = startHealthCheck();

    // Listen for token refresh events from API interceptor
    const handleTokenRefresh = (event: CustomEvent) => {
      updateAccessToken(event.detail);
    };

    window.addEventListener('tokenRefresh', handleTokenRefresh as EventListener);

    return () => {
      cleanup && cleanup();
      window.removeEventListener('tokenRefresh', handleTokenRefresh as EventListener);
    };
  }, []);

  const fetchUser = async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
    } catch (error) {
      setUser(null);
      setAccessToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const updateAccessToken = (newToken: string) => {
    setAccessToken(newToken);
    api.defaults.headers.Authorization = `Bearer ${newToken}`;
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const { user, access_token } = await response.json();

      // Reset refresh state on successful login
      resetRefreshState();

      updateAccessToken(access_token);
      setUser(user);
      router.push('/dashboard');
      return { success: true };
    } catch (error) {
      console.error('Login failed', error);
      return { success: false, error: error instanceof Error ? error.message : 'Login failed' };
    }
  };

  const logout = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
        method: 'DELETE',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout failed', error);
    } finally {
      setUser(null);
      setAccessToken(null);
      api.defaults.headers.Authorization = '';
      if (!isPublicRoute()) {
        router.push('/login');
      }
    }
  };

  const startHealthCheck = () => {
    const interval = setInterval(async () => {
      // Don't run health checks on public routes
      if (!accessToken || isPublicRoute()) return;

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/health`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          credentials: 'include',
        });

        if (response.ok) {
          // Check for refreshed token
          const newToken = response.headers.get('X-New-Access-Token');
          if (newToken) updateAccessToken(newToken);
        } else {
          // Health check failed, logout
          logout();
        }
      } catch (error) {
        console.error('Health check failed:', error);
      }
    }, 5 * 60 * 1000); // 5 minutes

    // Cleanup on unmount
    return () => clearInterval(interval);
  };

  return {
    user,
    isLoading,
    accessToken,
    login,
    logout,
    updateAccessToken,
  };
};
