'use client';

import { useState } from 'react';
import { Typography, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import AccountWorkflowsTable from './AccountWorkflowsTable/AccountWorkflowsTable';
import WorkflowViewDrawer from './WorkflowViewDrawer';
import type { Workflow } from '@/types/workflow';

const { Title } = Typography;

interface AccountWorkflowsProps {
  accountId: number;
}

export default function AccountWorkflows({ accountId }: AccountWorkflowsProps) {
  const router = useRouter();
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleNewWorkflow = () => {
    router.push('/workflows/new');
  };

  const handleViewWorkflow = (workflow: Workflow) => {
    setSelectedWorkflow(workflow);
    setViewDrawerOpen(true);
  };

  const handleCloseViewDrawer = () => {
    setViewDrawerOpen(false);
    setSelectedWorkflow(null);
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Workflows</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleNewWorkflow}
        >
          New Workflow
        </Button>
      </div>

      <AccountWorkflowsTable
        accountId={accountId}
        onViewWorkflow={handleViewWorkflow}
        refreshTrigger={refreshTrigger}
      />

      <WorkflowViewDrawer
        open={viewDrawerOpen}
        onClose={handleCloseViewDrawer}
        workflow={selectedWorkflow}
      />
    </div>
  );
}