import { Button } from 'antd';
import { EyeOutlined } from '@ant-design/icons';
import Link from 'next/link';

interface Workflow {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  steps_count?: number;
  status?: string;
}

export const workflowColumns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    render: (text: string, record: Workflow) => (
      <Link href={`/workflows/${record.id}`}>
        <Button type="link" style={{ padding: 0, fontWeight: 'bold' }}>
          {text}
        </Button>
      </Link>
    ),
  },
  {
    title: 'Description',
    dataIndex: 'description',
    key: 'description',
    ellipsis: true,
    render: (text: string) => text || 'No description',
  },
  {
    title: 'Steps',
    dataIndex: 'steps_count',
    key: 'steps_count',
    width: 80,
    align: 'center' as const,
    render: (count: number) => count || 0,
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    width: 100,
    render: (status: string) => status || 'Draft',
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
    width: 100,
    align: 'center' as const,
    render: (record: Workflow) => (
      <Link href={`/workflows/${record.id}`}>
        <Button type="text" icon={<EyeOutlined />} size="small">
          View
        </Button>
      </Link>
    ),
  },
];