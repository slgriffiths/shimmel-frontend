import { Button, Space, Tag, Tooltip } from 'antd';
import { EyeOutlined, PlayCircleOutlined } from '@ant-design/icons';
import type { Workflow } from '@/types/workflow';

export const getWorkflowColumns = (handleViewWorkflow: (workflow: Workflow) => void) => [
  {
    title: 'Name',
    key: 'name',
    render: (_: any, record: Workflow) => (
      <Button type='link' onClick={() => handleViewWorkflow(record)} style={{ padding: 0, fontWeight: 'bold' }}>
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
    title: 'Status',
    key: 'status',
    render: (_: any, record: Workflow) => {
      const statusColors: Record<'active' | 'inactive' | 'draft', string> = {
        active: 'green',
        inactive: 'red',
        draft: 'orange',
      };
      return (
        <Tag color={statusColors[record.status as 'active' | 'inactive' | 'draft']}>
          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
        </Tag>
      );
    },
  },
  {
    title: 'Total Runs',
    dataIndex: 'total_runs',
    key: 'total_runs',
    width: 120,
    render: (count: number) => count.toLocaleString(),
  },
  {
    title: 'Last Run',
    dataIndex: 'last_ran_at',
    key: 'last_ran_at',
    width: 140,
    render: (date: string) => (date ? new Date(date).toLocaleDateString() : 'Never'),
  },
  {
    title: 'Created By',
    dataIndex: 'created_by_user_name',
    key: 'created_by_user_name',
    width: 120,
    render: (name: string) => name || 'Unknown',
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
    render: (_: any, record: Workflow) => (
      <Space>
        <Tooltip title='View Workflow'>
          <Button
            type='text'
            icon={<EyeOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleViewWorkflow(record);
            }}
          />
        </Tooltip>

        <Tooltip title='Run Workflow'>
          <Button
            type='text'
            icon={<PlayCircleOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              // Navigate to workflow run page
              window.open(`/workflows/${record.id}/run`, '_blank');
            }}
            style={{ color: '#52c41a' }}
          />
        </Tooltip>
      </Space>
    ),
  },
];
