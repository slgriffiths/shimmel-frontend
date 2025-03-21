"use client";
import "@ant-design/v5-patch-for-react-19";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Layout, Menu, Button, Dropdown, Avatar, Typography, Spin } from "antd";
import { UserProvider } from "@/contexts/UserContext";
import {
  HomeOutlined,
  FileOutlined,
  TeamOutlined,
  MessageOutlined,
  SettingOutlined,
  LogoutOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useState } from "react";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  
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

  const profileMenu = {
    items: [
      {
        key: "settings",
        icon: <SettingOutlined />,
        label: "Settings",
      },
      {
        key: "logout",
        icon: <LogoutOutlined />,
        label: "Logout",
        onClick: logout,
      },
    ],
  };

  const menuItems = [
    {
      key: "1",
      icon: <HomeOutlined />,
      label: "Home",
      onClick: () => router.push("/dashboard"),
    },
    {
      key: "2",
      icon: <FileOutlined />,
      label: "My Content",
      children: [
        { key: "21", label: "Groups" },
        { key: "22", label: "Campaigns" },
        { key: "23", label: "Chat" },
        { key: "24", label: "Knowledge Base" },
      ],
    },
    {
      key: "3",
      icon: <TeamOutlined />,
      label: "Brand IQ",
      children: [
        { key: "31", label: "Brand Voice" },
        { key: "32", label: "Style Guide" },
        { key: "33", label: "Visual Guidelines" },
      ],
    },
    {
      key: "4",
      icon: <MessageOutlined />,
      label: "Favorites",
    },
  ];

  return (
    <UserProvider>
      <Layout style={{ minHeight: "100vh" }}>
        {/* Sidebar */}
        <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)} width={250} theme="light">
          <div style={{ padding: "16px", textAlign: "center" }}>
            <Button type="primary" icon={<PlusOutlined />} block>
              Create Content
            </Button>
          </div>
          <Menu theme="light" mode="inline" defaultSelectedKeys={["1"]} items={menuItems} />

          {/* Profile + Settings Dropup */}
          <div style={{ position: "absolute", bottom: 30, width: "100%", textAlign: "center" }}>
            <Dropdown menu={profileMenu} placement="top">
              <div style={{ cursor: "pointer", padding: "10px" }}>
                <Avatar style={{ backgroundColor: "#1890ff" }}>{user?.first_name?.charAt(0)}</Avatar>
                {!collapsed && (
                  <Text style={{ marginLeft: 8 }}>{user?.first_name} {user?.last_name}</Text>
                )}
              </div>
            </Dropdown>
          </div>
        </Sider>

        {/* Main Content */}
        <Layout>
          {/* <Header style={{ background: "#fff", padding: "16px", display: "flex", justifyContent: "space-between" }}>
            
            
          </Header> */}
          <Content style={{ padding: "20px" }}>{children}</Content>
        </Layout>
      </Layout>
    </UserProvider>
  );
}