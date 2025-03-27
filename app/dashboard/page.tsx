"use client";
import RecentConversations from "@/components/RecentConversations/RecentConversations";
import ResearchCategories from "@/components/ResearchCategories/ResearchCategories";
// import SearchChat from "@/components/SearchChat/SearchChat";
import AssistantChat from "@/components/AssistantChat/AssistantChat";

export default function DashboardPage() {
  return (    
    <>
      <AssistantChat directTo='chat' />
      <RecentConversations />
      <ResearchCategories />
    </>
  );
}