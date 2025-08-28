'use client';

import { useState } from 'react';
import { Typography, Button, Tabs, Card, Empty, Descriptions, Tag, Space } from 'antd';
import { PlusOutlined, RobotOutlined } from '@ant-design/icons';
import { useConfiguration } from '@/contexts/ConfigurationContext';
import CreateAgentDrawer from './CreateAgentDrawer/CreateAgentDrawer';
import type { Agent } from '@/contexts/ConfigurationContext';

const { Title, Text } = Typography;

export default function AgentsList() {
  const { configuration, loading } = useConfiguration();
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  const agents = configuration?.available_agents || [];

  const handleCreateAgent = () => {
    setCreateDrawerOpen(true);
  };

  const handleCreateSuccess = () => {
    // Refresh will be handled by the drawer
  };

  const tabItems = agents.map((agent) => ({
    key: agent.id.toString(),
    label: (
      <Space>
        <RobotOutlined />
        {agent.name}
      </Space>
    ),
    children: (
      <Card style={{ height: 'calc(100vh - 200px)', overflow: 'auto' }}>
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="Name">
            <Text strong>{agent.name}</Text>
          </Descriptions.Item>
          
          <Descriptions.Item label="Description">
            {agent.description || <Text type="secondary">No description provided</Text>}
          </Descriptions.Item>
          
          <Descriptions.Item label="LLM Model">
            <Tag color="blue">{agent.underlying_model}</Tag>
          </Descriptions.Item>
          
          <Descriptions.Item label="Temperature">
            <Tag>{agent.temperature}</Tag>
          </Descriptions.Item>
          
          <Descriptions.Item label="System Instructions">
            <div 
              style={{ 
                backgroundColor: '#f6f8fa', 
                padding: 12, 
                borderRadius: 6, 
                border: '1px solid #e1e4e8',
                maxHeight: 300,
                overflow: 'auto'
              }}
            >
              <Text style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: 12 }}>
                {agent.system_message}
              </Text>
            </div>
          </Descriptions.Item>
          
          <Descriptions.Item label="Created">
            {new Date(agent.created_at).toLocaleString()}
          </Descriptions.Item>
          
          <Descriptions.Item label="Last Modified">
            {new Date(agent.updated_at).toLocaleString()}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    ),
  }));

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
    <div style={{ padding: 24, height: '100vh', display: 'flex', flexDirection: 'column' }}>
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
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <Tabs
            type="line"
            tabPosition="left"
            items={tabItems}
            style={{ height: '100%' }}
            size="small"
          />
        </div>
      )}

      <CreateAgentDrawer
        open={createDrawerOpen}
        onClose={() => setCreateDrawerOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}