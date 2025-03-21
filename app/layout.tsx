"use client";
import '@ant-design/v5-patch-for-react-19';
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Layout, Spin } from "antd";
import { usePathname } from "next/navigation";

const { Content } = Layout;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // TODO: Remove this when ready to work on auth
    return
    if (!isLoading && !user && pathname !== "/login") {
      router.push("/login");
    }
  }, [user, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <html lang="en">
        <body>
          <Layout style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Spin size="large" />
          </Layout>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body>
        <Layout style={{ minHeight: "100vh" }}>
          <Content>{children}</Content>
        </Layout>
      </body>
    </html>
  );
}