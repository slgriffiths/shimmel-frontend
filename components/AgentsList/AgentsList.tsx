'use client';

import { useState } from 'react';
import { Typography, Button, Table, Empty, message, Modal } from 'antd';
import { PlusOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useConfiguration } from '@/contexts/ConfigurationContext';
import { api } from '@/lib/api';
import CreateAgentDrawer from './CreateAgentDrawer/CreateAgentDrawer';
import CloneAgentModal from './CloneAgentModal';
import { getAgentColumns } from './columns';
import type { Agent } from '@/contexts/ConfigurationContext';

const { Title } = Typography;
const { confirm } = Modal;

export default function AgentsList() {
  const router = useRouter();
  const { configuration, loading, refreshAgents } = useConfiguration();
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [cloneModalOpen, setCloneModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  const agents = configuration?.available_agents || [];

  const handleCreateAgent = () => {
    setCreateDrawerOpen(true);
  };

  const handleCreateSuccess = () => {
    refreshAgents();
  };

  const handleEditAgent = (agentId: number) => {
    router.push(`/agents/${agentId}`);
  };

  const handleCloneAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    setCloneModalOpen(true);
  };

  const handleCloneSuccess = () => {
    refreshAgents();
  };

  const handleDeleteAgent = (agent: Agent) => {
    if (!agent.can_be_deleted) {
      message.warning('This agent cannot be deleted');
      return;
    }

    confirm({
      title: `Delete Agent "${agent.name}"?`,
      icon: <ExclamationCircleOutlined />,
      content: 'This action cannot be undone. Are you sure you want to delete this agent?',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      async onOk() {
        try {
          await api.delete(`/agents/${agent.id}`);
          message.success('Agent deleted successfully');
          refreshAgents();
        } catch (error) {
          console.error('Failed to delete agent:', error);
          message.error('Failed to delete agent');
        }
      },
    });
  };

  const handleRowClick = (record: Agent) => {
    handleEditAgent(record.id);
  };

  const columns = getAgentColumns(handleEditAgent, handleCloneAgent, handleDeleteAgent);

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <Title level={2}>Agents</Title>
        <div style={{ textAlign: 'center', marginTop: 100 }}>
          Loading agents...
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Agents</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateAgent}>
          Create Agent
        </Button>
      </div>

      {agents.length === 0 ? (
        <Empty 
          description="No agents created yet"
          style={{ marginTop: 100 }}
        >
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateAgent}>
            Create Your First Agent
          </Button>
        </Empty>
      ) : (
        <Table
          columns={columns}
          dataSource={agents}
          rowKey="id"
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
            style: { cursor: 'pointer' }
          })}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} agents`,
          }}
        />
      )}

      <CreateAgentDrawer
        open={createDrawerOpen}
        onClose={() => setCreateDrawerOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      <CloneAgentModal
        open={cloneModalOpen}
        onClose={() => setCloneModalOpen(false)}
        onSuccess={handleCloneSuccess}
        agent={selectedAgent}
      />
    </div>
  );
}