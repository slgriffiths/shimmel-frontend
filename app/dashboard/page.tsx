"use client";
import RecentConversations from "@/components/RecentConversations/RecentConversations";
import ResearchCategories from "@/components/ResearchCategories/ResearchCategories";
import SearchChat from "@/components/SearchChat/SearchChat";

export default function DashboardPage() {
  return (    
    <>
      <SearchChat directTo='chat' />
      <RecentConversations />
      <ResearchCategories />
    </>
  );
}