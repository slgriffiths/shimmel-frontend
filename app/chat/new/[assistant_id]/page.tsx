'use client';
// import SearchChat from "@/components/SearchChat/SearchChat";
import AssistantChat from '@/components/AssistantChat/AssistantChat';
import { useParams } from 'next/navigation';

export default function DashboardPage() {
  const params = useParams();
  const assistantId = typeof params?.assistant_id === 'string' ? parseInt(params.assistant_id, 10) : 1;

  return (
    <>
      <AssistantChat assistantId={assistantId} />
    </>
  );
}
