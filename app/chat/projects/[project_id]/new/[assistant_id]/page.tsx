'use client';
// import SearchChat from "@/components/SearchChat/SearchChat";
import AssistantChat from '@/components/AssistantChat/AssistantChat';
import { useParams } from 'next/navigation';

export default function ProjectChatPage() {
  const params = useParams();
  const projectId = typeof params?.project_id === 'string' ? parseInt(params.project_id, 10) : undefined;
  const assistantId = typeof params?.assistant_id === 'string' ? parseInt(params.assistant_id, 10) : 1;

  console.log('Building conversation in project:', params?.project_id);
  return (
    <>
      <AssistantChat assistantId={assistantId} projectId={projectId} />
    </>
  );
}
