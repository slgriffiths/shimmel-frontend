import { Button, Space, Tag } from 'antd';
import { EditOutlined, CopyOutlined, DeleteOutlined } from '@ant-design/icons';
import type { Agent } from '@/contexts/ConfigurationContext';

export const getAgentColumns = (
  handleEditAgent: (agentId: number) => void,
  handleCloneAgent: (agent: Agent) => void,
  handleDeleteAgent: (agent: Agent) => void
) => [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    render: (text: string, record: Agent) => (
      <Button 
        type="link" 
        onClick={() => handleEditAgent(record.id)} 
        style={{ padding: 0, fontWeight: 'bold' }}
      >
        {text}
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
        {record.account_id ? `Account ${record.account_id}` : 'Global'}
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
    title: 'Created',
    dataIndex: 'created_at',
    key: 'created_at',
    width: 120,
    render: (date: string) => new Date(date).toLocaleDateString(),
  },
  {
    title: 'Actions',
    key: 'actions',
    width: 150,
    render: (_: any, record: Agent) => (
      <Space>
        <Button
          type="text"
          icon={<EditOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            handleEditAgent(record.id);
          }}
          title="Edit Agent"
        />
        <Button
          type="text"
          icon={<CopyOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            handleCloneAgent(record);
          }}
          title="Clone Agent"
        />
        <Button
          type="text"
          icon={<DeleteOutlined />}
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteAgent(record);
          }}
          title="Delete Agent"
          disabled={!record.can_be_deleted}
          danger
        />
      </Space>
    ),
  },
];