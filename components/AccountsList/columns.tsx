import { Button, Space } from 'antd';
import { EyeOutlined } from '@ant-design/icons';

interface Account {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  users_count?: number;
  workflows_count?: number;
}

export const getAccountColumns = (handleViewAccount: (accountId: number) => void) => [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 80,
  },
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    render: (text: string, record: Account) => (
      <Button type="link" onClick={() => handleViewAccount(record.id)} style={{ padding: 0 }}>
        {text}
      </Button>
    ),
  },
  {
    title: 'Users',
    dataIndex: 'users_count',
    key: 'users_count',
    width: 100,
    render: (count: number) => count || 0,
  },
  {
    title: 'Workflows',
    dataIndex: 'workflows_count',
    key: 'workflows_count',
    width: 120,
    render: (count: number) => count || 0,
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
    width: 120,
    render: (_: any, record: Account) => (
      <Space>
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => handleViewAccount(record.id)}
        >
          View
        </Button>
      </Space>
    ),
  },
];