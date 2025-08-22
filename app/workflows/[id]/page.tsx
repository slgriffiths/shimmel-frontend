'use client';

import { useParams } from 'next/navigation';
import WorkflowDetail from '@/components/WorkflowDetail/WorkflowDetail';
import { WorkflowProvider } from '@/contexts/WorkflowContext';

export default function WorkflowDetailPage() {
  const params = useParams();
  const workflowId = params?.id as string;

  return (
    <WorkflowProvider>
      <WorkflowDetail workflowId={workflowId} />
    </WorkflowProvider>
  );
}