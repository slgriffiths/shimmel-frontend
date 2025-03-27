"use client";
// import SearchChat from "@/components/SearchChat/SearchChat";
import AssistantChat from "@/components/AssistantChat/AssistantChat";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function DashboardPage() {  
  const searchParams = useSearchParams();
  const initialPrompt = searchParams.get("p") || "";
  const [prompt] = useState(initialPrompt);

  return (    
    <>
      <AssistantChat prompt={prompt} />      
    </>
  );
}