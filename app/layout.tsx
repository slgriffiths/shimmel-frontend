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
  FolderOpenOutlined,
} from "@ant-design/icons";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Project {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  account_id?: number;
  account?: {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
  }
  user_id: number;
  user: {
    id: snumber;
    first_name: string;
    last_name: string;
    email: string;
    created_at: string;
    updated_at: string;
  };
}

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const [projects, setRecentProjects] = useState<Project[]>([]);

  let navProjects = [{ key: "no-projects", label: <Spin size="small" /> }];
  
  if (projects.length) {
    navProjects = projects.map((project) => ({
      key: `project-${project.id}`,
      label: <span>{project.name}</span>,
      onClick: () => router.push(`/projects/${project.id}`),
    }));
  }
  
    useEffect(() => {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects`)
        .then((res) => res.json())
        .then((data) => setRecentProjects(Array.isArray(data) ? data : []));
    }, []);
  
  useEffect(() => {
    // TODO: Remove this when ready to work on auth
    return
    if (!isLoading && !user && pathname !== "/login") {
      router.push("/login");
    }
  }, [user, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <html lang="en" style={{ margin: 0, padding: 0 }}>
        <body style={{ margin: 0, padding: 0 }}>
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
      key: "home-menu",
      icon: <HomeOutlined />,
      label: "Home",
      onClick: () => router.push("/dashboard"),
    },
    {
      key: "projects-menu",
      icon: <FolderOpenOutlined />,
      label: "Projects",
      children: navProjects,
    },
    // {
    //   key: "3",
    //   icon: <TeamOutlined />,
    //   label: "Brand IQ",
    //   children: [
    //     { key: "31", label: "Brand Voice" },
    //     { key: "32", label: "Style Guide" },
    //     { key: "33", label: "Visual Guidelines" },
    //   ],
    // },
    // {
    //   key: "4",
    //   icon: <MessageOutlined />,
    //   label: "Favorites",
    // },
  ];

  return (
    <html lang="en" style={{ margin: 0, padding: 0 }}>
      <body style={{ margin: 0, padding: 0 }}>
        <UserProvider>
          <Layout style={{ minHeight: "100vh" }}>
            {/* Sidebar */}
            <Sider style={{ borderRight: '1px solid #ccc' }} collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)} width={250} theme="light">
              <div style={{ padding: "16px", textAlign: "center" }}>
                <Button type="primary" icon={<PlusOutlined />} block>
                  Start New Chat
                </Button>
              </div>
              <Menu theme="light" mode="inline" items={menuItems} defaultOpenKeys={["projects-menu"]}/>

              {/* Profile + Settings Dropup */}
              <div style={{ position: "absolute", bottom: 60, width: "100%", textAlign: "center" }}>
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
              <Content style={{ padding: 0 }}>{children}</Content>
            </Layout>
          </Layout>
        </UserProvider>
      </body>
    </html>
  );
}