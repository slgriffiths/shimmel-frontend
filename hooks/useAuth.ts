"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const { data } = await api.get("/me");
      setUser(data);
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { data } = await api.post("/users/sign_in", { email, password });
      api.defaults.headers.Authorization = `Bearer ${data.access_token}`;
      setUser(data.user);
      router.push("/dashboard");
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const logout = async () => {
    try {
      await api.delete("/users/sign_out");
      setUser(null);
      api.defaults.headers.Authorization = "";
      router.push("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return { user, isLoading, login, logout };
};