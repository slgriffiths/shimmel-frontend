// "use client";
import { useAuth } from "@/hooks/useAuth";
import { Layout, Menu, Typography, Button } from "antd";

const { Header, Content } = Layout;
const { Title } = Typography;

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#001529", color: "white", padding: "0 20px" }}>
        <Title level={3} style={{ color: "white", margin: 0 }}>Dashboard</Title>
        <Button type="primary" onClick={logout}>Logout</Button>
      </Header>
      <Content style={{ padding: "20px" }}>
        <Title level={2}>Welcome, {user?.first_name} {user?.last_name}!</Title>
        <p>Email: {user?.email}</p>
      </Content>
    </Layout>
  );
}