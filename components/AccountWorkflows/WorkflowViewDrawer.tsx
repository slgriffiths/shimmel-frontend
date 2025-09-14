'use client';

import { Drawer, Descriptions, Tag, Space, Typography, Button } from 'antd';
import { PartitionOutlined, CalendarOutlined, ClockCircleOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import type { Workflow } from '@/types/workflow';

const { Title } = Typography;

interface WorkflowViewDrawerProps {
  open: boolean;
  onClose: () => void;
  workflow: Workflow | null;
}

export default function WorkflowViewDrawer({ open, onClose, workflow }: WorkflowViewDrawerProps) {
  const router = useRouter();

  if (!workflow) return null;

  const handleRunWorkflow = () => {
    router.push(`/workflows/${workflow.id}/run`);
  };

  const handleEditWorkflow = () => {
    router.push(`/workflows/${workflow.id}`);
  };

  const statusColors = {
    active: 'green',
    inactive: 'red',
    draft: 'orange',
  };

  return (
    <Drawer
      title={
        <Space>
          <PartitionOutlined />
          <span>{workflow.name}</span>
        </Space>
      }
      placement='right'
      onClose={onClose}
      open={open}
      width={600}
      extra={
        <Space>
          <Button onClick={handleEditWorkflow}>Edit</Button>
          <Button type='primary' icon={<PlayCircleOutlined />} onClick={handleRunWorkflow}>
            Run
          </Button>
        </Space>
      }
    >
      <Space direction='vertical' size='large' style={{ width: '100%' }}>
        <div>
          <Title level={4}>Workflow Information</Title>
          <Descriptions column={1} bordered>
            <Descriptions.Item label='Name'>{workflow.name}</Descriptions.Item>

            <Descriptions.Item label='Description'>
              {workflow.description || <span style={{ color: '#999' }}>No description provided</span>}
            </Descriptions.Item>

            <Descriptions.Item label='Status'>
              <Tag color={statusColors[workflow.status as keyof typeof statusColors]}>
                {workflow.status.charAt(0).toUpperCase() + workflow.status.slice(1)}
              </Tag>
            </Descriptions.Item>

            <Descriptions.Item label='Account'>
              {workflow.account_name || `Account ${workflow.account_id}`}
            </Descriptions.Item>

            <Descriptions.Item label='Created By'>{workflow.owner.email || 'Unknown'}</Descriptions.Item>
          </Descriptions>
        </div>

        <div>
          <Title level={4}>Execution Statistics</Title>
          <Descriptions column={1} bordered>
            <Descriptions.Item label='Total Runs'>
              <Space>
                <PlayCircleOutlined />
                {workflow.total_runs.toLocaleString()} runs
              </Space>
            </Descriptions.Item>

            <Descriptions.Item label='Last Run'>
              <Space>
                <ClockCircleOutlined />
                {workflow.last_ran_at ? new Date(workflow.last_ran_at).toLocaleString() : 'Never executed'}
              </Space>
            </Descriptions.Item>
          </Descriptions>
        </div>

        <div>
          <Title level={4}>Timeline</Title>
          <Descriptions column={1} bordered>
            <Descriptions.Item label='Created'>
              <Space>
                <CalendarOutlined />
                {new Date(workflow.created_at).toLocaleString()}
              </Space>
            </Descriptions.Item>

            <Descriptions.Item label='Last Updated'>
              <Space>
                <CalendarOutlined />
                {new Date(workflow.updated_at).toLocaleString()}
              </Space>
            </Descriptions.Item>
          </Descriptions>
        </div>
      </Space>
    </Drawer>
  );
}
