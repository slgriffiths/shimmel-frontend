'use client';

import { Drawer, Descriptions, Tag, Space, Typography, Button } from 'antd';
import { RobotOutlined, CalendarOutlined, CopyOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import type { Agent } from '@/contexts/ConfigurationContext';

const { Title, Paragraph } = Typography;

interface AgentViewDrawerProps {
  open: boolean;
  onClose: () => void;
  agent: Agent | null;
}

export default function AgentViewDrawer({ open, onClose, agent }: AgentViewDrawerProps) {
  const router = useRouter();

  if (!agent) return null;

  const handleEditAgent = () => {
    router.push(`/agents/${agent.id}`);
  };

  const handleCloneAgent = () => {
    // This would trigger the clone modal from the existing agents page
    router.push(`/agents?clone=${agent.id}`);
  };

  return (
    <Drawer
      title={
        <Space>
          <RobotOutlined />
          <span>{agent.name}</span>
        </Space>
      }
      placement="right"
      onClose={onClose}
      open={open}
      width={600}
      extra={
        <Space>
          <Button 
            icon={<CopyOutlined />}
            onClick={handleCloneAgent}
          >
            Clone
          </Button>
          <Button
            type="primary"
            onClick={handleEditAgent}
          >
            Edit
          </Button>
        </Space>
      }
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Title level={4}>Agent Information</Title>
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Name">
              {agent.name}
            </Descriptions.Item>
            
            <Descriptions.Item label="Description">
              {agent.description || <span style={{ color: '#999' }}>No description provided</span>}
            </Descriptions.Item>
            
            <Descriptions.Item label="Account">
              <Tag color={agent.account_id ? 'blue' : 'green'}>
                {agent.account_name || (agent.account_id ? `Account ${agent.account_id}` : 'Global')}
              </Tag>
            </Descriptions.Item>
            
            <Descriptions.Item label="Parent Agent">
              {agent.parent_agent_name ? (
                <Tag color="cyan">{agent.parent_agent_name}</Tag>
              ) : (
                <span>Original Agent</span>
              )}
            </Descriptions.Item>
            
            <Descriptions.Item label="Can Be Deleted">
              <Tag color={agent.can_be_deleted ? 'green' : 'red'}>
                {agent.can_be_deleted ? 'Yes' : 'No'}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        </div>

        <div>
          <Title level={4}>Model Configuration</Title>
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Base Model">
              <Tag color="purple">{agent.underlying_model}</Tag>
            </Descriptions.Item>
            
            <Descriptions.Item label="Temperature">
              <Tag>{agent.temperature}</Tag>
            </Descriptions.Item>
          </Descriptions>
        </div>

        <div>
          <Title level={4}>System Instructions</Title>
          <div style={{ 
            padding: 16, 
            background: '#f5f5f5', 
            borderRadius: 6,
            border: '1px solid #d9d9d9'
          }}>
            <Paragraph style={{ 
              margin: 0, 
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}>
              {agent.system_message || 'No system instructions provided'}
            </Paragraph>
          </div>
        </div>

        <div>
          <Title level={4}>Usage Statistics</Title>
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Child Agents">
              {agent.child_agents_count !== undefined 
                ? `${agent.child_agents_count} workflows using this agent`
                : 'Usage data not available'
              }
            </Descriptions.Item>
          </Descriptions>
        </div>

        <div>
          <Title level={4}>Timeline</Title>
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Created">
              <Space>
                <CalendarOutlined />
                {new Date(agent.created_at).toLocaleString()}
              </Space>
            </Descriptions.Item>
            
            <Descriptions.Item label="Last Updated">
              <Space>
                <CalendarOutlined />
                {new Date(agent.updated_at).toLocaleString()}
              </Space>
            </Descriptions.Item>
            
            {agent.archived_at && (
              <Descriptions.Item label="Archived">
                <Space>
                  <CalendarOutlined />
                  {new Date(agent.archived_at).toLocaleString()}
                </Space>
              </Descriptions.Item>
            )}
          </Descriptions>
        </div>
      </Space>
    </Drawer>
  );
}