"use client";
import { Spin } from "antd";
import { useRouter } from "next/router";
import { useEffect } from "react";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // const { isAuthenticated, user } = useAuth();
  // const router = useRouter();

  // useEffect(() => {
  //   if (!isAuthenticated) {
  //     router.push("/");
  //   }
  // }, [isAuthenticated, router]);

  // if (!isAuthenticated) return <Spin />;

  return <>{children}</>;
};