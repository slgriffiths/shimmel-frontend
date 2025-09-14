import { Button, Space, Tag, Tooltip } from 'antd';
import { EyeOutlined, CopyOutlined } from '@ant-design/icons';
import Link from 'next/link';
import type { TableColumnsType } from 'antd';
import type { Workflow } from '@/types/workflow';

export const getWorkflowColumns = (
  isSuperAdmin: boolean = false,
  onCloneWorkflow?: (workflow: Workflow) => void
): TableColumnsType<Workflow> => {
  const columns: TableColumnsType<Workflow> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Workflow) => (
        <Link href={`/workflows/${record.id}`}>
          <Button type='link' style={{ padding: 0, fontWeight: 'bold' }}>
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
      render: (text: string) => text || <span style={{ color: '#999' }}>No description</span>,
    },
  ];

  // Add Account column for super admins
  if (isSuperAdmin) {
    columns.push({
      title: 'Account',
      key: 'account',
      width: 150,
      render: (_: any, record: Workflow) => (
        <Tag color={record.account_id ? 'blue' : 'green'}>
          {record.account_name || record.account?.name || 'Global'}
        </Tag>
      ),
    });
  }

  // Add remaining columns
  columns.push(
    {
      title: 'Action Count',
      dataIndex: 'actions',
      key: 'actions_count',
      width: 100,
      align: 'center' as const,
      render: (_: any, record: Workflow) => record.actions?.length || 0,
    },
    {
      title: 'Status',
      key: 'status',
      width: 100,
      render: (_: any, record: Workflow) => {
        if (record.archived_at) return <Tag color='default'>Archived</Tag>;
        if (record.actions?.length === 0) return <Tag color='warning'>Draft</Tag>;
        return <Tag color='success'>Active</Tag>;
      },
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
      key: 'table_actions',
      width: isSuperAdmin ? 120 : 80,
      align: 'center' as const,
      render: (_: any, record: Workflow) => (
        <Space>
          <Tooltip title='View Workflow'>
            <Link href={`/workflows/${record.id}`}>
              <Button type='text' icon={<EyeOutlined />} size='small' />
            </Link>
          </Tooltip>
          {isSuperAdmin && onCloneWorkflow && (
            <Tooltip title='Clone Workflow'>
              <Button
                type='text'
                icon={<CopyOutlined />}
                size='small'
                onClick={(e) => {
                  e.stopPropagation();
                  onCloneWorkflow(record);
                }}
                style={{ color: '#1890ff' }}
              />
            </Tooltip>
          )}
        </Space>
      ),
    }
  );

  return columns;
};
