'use client';
import RecentConversations from '@/components/RecentConversations/RecentConversations';
import ResearchAssistants from '@/components/ResearchAssistants/ResearchAssistants';
// import SearchChat from "@/components/SearchChat/SearchChat";
import AssistantChat from '@/components/AssistantChat/AssistantChat';

export default function DashboardPage() {
  return (
    <div style={{ padding: 20 }}>
      <div style={{ padding: 20, marginTop: 120 }}>
        <AssistantChat directTo='chat' searchOnly />
      </div>
      <RecentConversations />
      <ResearchAssistants />
    </div>
  );
}
