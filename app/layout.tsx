"use client";
import "@ant-design/v5-patch-for-react-19";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Layout, Menu, Button, Dropdown, Avatar, Typography, Spin } from "antd";
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

  const profileMenu = (
    <Menu>
      <Menu.Item key="settings" icon={<SettingOutlined />}>
        Settings
      </Menu.Item>
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={logout}>
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)} width={250} theme="light">
        <div style={{ padding: "16px", textAlign: "center" }}>
          <Button type="primary" icon={<PlusOutlined />} block>
            Create Content
          </Button>
        </div>
        <Menu theme="light" mode="inline" defaultSelectedKeys={["1"]}>
          <Menu.Item key="1" icon={<HomeOutlined />}>
            Home
          </Menu.Item>
          <Menu.SubMenu key="2" icon={<FileOutlined />} title="My Content">
            <Menu.Item key="21">Groups</Menu.Item>
            <Menu.Item key="22">Campaigns</Menu.Item>
            <Menu.Item key="23">Chat</Menu.Item>
            <Menu.Item key="24">Knowledge Base</Menu.Item>
          </Menu.SubMenu>
          <Menu.SubMenu key="3" icon={<TeamOutlined />} title="Brand IQ">
            <Menu.Item key="31">Brand Voice</Menu.Item>
            <Menu.Item key="32">Style Guide</Menu.Item>
            <Menu.Item key="33">Visual Guidelines</Menu.Item>
          </Menu.SubMenu>
          <Menu.Item key="4" icon={<MessageOutlined />}>
            Favorites
          </Menu.Item>
        </Menu>

        {/* Profile + Settings Dropup */}
        <div style={{ position: "absolute", bottom: 16, width: "100%", textAlign: "center" }}>
          <Dropdown overlay={profileMenu} placement="topCenter">
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
        <Header style={{ background: "#fff", padding: "16px", display: "flex", justifyContent: "space-between" }}>
          <Text strong style={{ fontSize: "18px" }}>
            Hey {user?.first_name}, What do you want to create?
          </Text>
          <Button type="primary">Create</Button>
        </Header>
        <Content style={{ padding: "20px" }}>{children}</Content>
      </Layout>
    </Layout>
  );
}