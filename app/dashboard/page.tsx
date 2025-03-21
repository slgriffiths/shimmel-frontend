"use client";
import ResearchCategories from "@/components/ResearchCategories/ResearchCategories";
import { useAuth } from "@/hooks/useAuth";
import { Layout, Typography, Button } from "antd";

const { Header, Content } = Layout;
const { Title } = Typography;

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (    
    <ResearchCategories />
  );
}