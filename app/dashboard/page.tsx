"use client";
import ResearchCategories from "@/components/ResearchCategories/ResearchCategories";
import SearchChat from "@/components/SearchChat/SearchChat";

export default function DashboardPage() {
  return (    
    <>
      <SearchChat />
      <ResearchCategories />
    </>
  );
}