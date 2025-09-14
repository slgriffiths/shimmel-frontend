import { Button, Space, Tag, Tooltip } from 'antd';
import { EyeOutlined, RobotOutlined } from '@ant-design/icons';
import type { Agent } from '@/contexts/ConfigurationContext';

export const getAgentColumns = (
  handleViewAgent: (agent: Agent) => void
) => [
  {
    title: 'Name',
    key: 'name',
    render: (_: any, record: Agent) => (
      <Button 
        type="link" 
        onClick={() => handleViewAgent(record)} 
        style={{ padding: 0, fontWeight: 'bold' }}
      >
        {record.name}
      </Button>
    ),
  },
  {
    title: 'Description',
    dataIndex: 'description',
    key: 'description',
    render: (text: string) => text || <span style={{ color: '#999' }}>No description</span>,
  },
  {
    title: 'Account',
    key: 'account',
    render: (_: any, record: Agent) => (
      <Tag color={record.account_id ? 'blue' : 'green'}>
        {record.account_name || (record.account_id ? `Account ${record.account_id}` : 'Global')}
      </Tag>
    ),
  },
  {
    title: 'Model',
    dataIndex: 'underlying_model',
    key: 'underlying_model',
    render: (text: string) => (
      <Tag color="purple">{text}</Tag>
    ),
  },
  {
    title: 'Temperature',
    dataIndex: 'temperature',
    key: 'temperature',
    width: 100,
    render: (value: number) => (
      <Tag>{value}</Tag>
    ),
  },
  {
    title: 'Parent Agent',
    key: 'parent_agent',
    render: (_: any, record: Agent) => 
      record.parent_agent_name ? (
        <Tag color="cyan">{record.parent_agent_name}</Tag>
      ) : (
        <span style={{ color: '#999' }}>Original</span>
      ),
  },
  {
    title: 'Created',
    dataIndex: 'created_at',
    key: 'created_at',
    width: 120,
    render: (date: string) => new Date(date).toLocaleDateString(),
  },
  {
    title: 'Actions',
    key: 'actions',
    width: 80,
    render: (_: any, record: Agent) => (
      <Space>
        <Tooltip title="View Agent">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleViewAgent(record);
            }}
          />
        </Tooltip>
        
        <Tooltip title="Edit Agent">
          <Button
            type="text"
            icon={<RobotOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              // Navigate to agent edit page
              window.open(`/agents/${record.id}`, '_blank');
            }}
            style={{ color: '#1890ff' }}
          />
        </Tooltip>
      </Space>
    ),
  },
];