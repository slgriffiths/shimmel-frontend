'use client';

import { useState } from 'react';
import { Typography, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import AccountAgentsTable from './AccountAgentsTable/AccountAgentsTable';
import AgentViewDrawer from './AgentViewDrawer';
import type { Agent } from '@/contexts/ConfigurationContext';

const { Title } = Typography;

interface AccountAgentsProps {
  accountId: number;
}

export default function AccountAgents({ accountId }: AccountAgentsProps) {
  const router = useRouter();
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleNewAgent = () => {
    router.push('/agents/new');
  };

  const handleViewAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    setViewDrawerOpen(true);
  };

  const handleCloseViewDrawer = () => {
    setViewDrawerOpen(false);
    setSelectedAgent(null);
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Agents</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleNewAgent}
        >
          New Agent
        </Button>
      </div>

      <AccountAgentsTable
        accountId={accountId}
        onViewAgent={handleViewAgent}
        refreshTrigger={refreshTrigger}
      />

      <AgentViewDrawer
        open={viewDrawerOpen}
        onClose={handleCloseViewDrawer}
        agent={selectedAgent}
      />
    </div>
  );
}