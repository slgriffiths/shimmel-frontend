"use client";
import SearchChat from "@/components/SearchChat/SearchChat";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function DashboardPage() {  
  const searchParams = useSearchParams();
  const initialPrompt = searchParams.get("p") || "";
  const [prompt] = useState(initialPrompt);

  return (    
    <>
      <SearchChat prompt={prompt} />      
    </>
  );
}