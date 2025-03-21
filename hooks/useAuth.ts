"use client";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

export const useAuth = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data } = await api.post("/api/v1/users/sign_in", { email, password });
      api.defaults.headers.Authorization = `Bearer ${data.access_token}`;
      setUser(data.user);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const logout = async () => {
    try {
      await api.delete("/api/v1/users/sign_out");
      setUser(null);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const fetchUser = async () => {
    try {
      const { data } = await api.get("/api/v1/me");
      setUser(data);
    } catch (error) {
      console.error("Failed to fetch user", error);
    }
  };

  return { user, login, logout };
};