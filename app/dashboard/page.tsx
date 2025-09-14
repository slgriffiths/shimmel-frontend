'use client';

import { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Typography, Button, List, Tag, Space, message } from 'antd';
import { 
  PlayCircleOutlined, 
  ClockCircleOutlined, 
  BranchesOutlined,
  BookOutlined,
  CustomerServiceOutlined,
  BulbOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined
} from '@ant-design/icons';
import { WorkflowService } from '@/services/workflowService';
import { formatTimeAgo } from '@/utils/dateUtils';
import { useRouter } from 'next/navigation';
import type { Workflow } from '@/types/workflow';

const { Title, Text } = Typography;

export default function DashboardPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalWorkflows: 0,
    activeWorkflows: 0,
    recentRuns: 0
  });
  const router = useRouter();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await WorkflowService.getRecentWorkflows(1, 5);
      setWorkflows(response.workflows);
      
      // Calculate stats
      const totalWorkflows = response.pagy?.count || 0;
      const activeWorkflows = response.workflows.filter(w => !w.archived_at).length;
      const recentRuns = response.workflows.filter(w => w.last_ran_at).length;
      
      setStats({
        totalWorkflows,
        activeWorkflows,
        recentRuns
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      message.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (workflow: Workflow) => {
    if (workflow.archived_at) return 'default';
    if (workflow.actions.length === 0) return 'warning';
    return 'success';
  };

  const getStatusText = (workflow: Workflow) => {
    if (workflow.archived_at) return 'Archived';
    if (workflow.actions.length === 0) return 'Draft';
    return 'Active';
  };

  const resources = [
    {
      title: 'Read Documentation',
      description: 'Learn how to build and optimize your workflows',
      icon: <BookOutlined />,
      action: () => window.open('https://docs.shimmel.ai', '_blank')
    },
    {
      title: 'Contact Support',
      description: 'Get help from our support team',
      icon: <CustomerServiceOutlined />,
      action: () => router.push('/support')
    },
    {
      title: 'Best Practices',
      description: 'Tips and tricks for workflow automation',
      icon: <BulbOutlined />,
      action: () => window.open('https://docs.shimmel.ai/best-practices', '_blank')
    }
  ];

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          Welcome back! 👋
        </Title>
        <Text type="secondary" style={{ fontSize: 16 }}>
          Here's what's happening with your workflows today
        </Text>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total Workflows"
              value={stats.totalWorkflows}
              prefix={<BranchesOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Active Workflows"
              value={stats.activeWorkflows}
              prefix={<PlayCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
              suffix={
                <span style={{ fontSize: 12, color: '#666' }}>
                  / {stats.totalWorkflows}
                </span>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Recent Activity"
              value={stats.recentRuns}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#722ed1' }}
              suffix="workflows run recently"
            />
          </Card>
        </Col>
      </Row>

      {/* Recent Workflows */}
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        <Col span={24}>
          <Card 
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Recent Workflows</span>
                <Button type="primary" onClick={() => router.push('/workflows')}>
                  View All Workflows
                </Button>
              </div>
            }
            loading={loading}
          >
            <List
              dataSource={workflows}
              locale={{
                emptyText: 'No workflows found. Create your first workflow to get started!'
              }}
              renderItem={(workflow) => (
                <List.Item
                  style={{
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    borderRadius: 8,
                    padding: 16,
                    marginBottom: 8,
                  }}
                  className="workflow-item"
                  onClick={() => router.push(`/workflows/${workflow.id}`)}
                >
                  <List.Item.Meta
                    avatar={<BranchesOutlined style={{ fontSize: 20, color: '#1890ff' }} />}
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontWeight: 600 }}>{workflow.name}</span>
                        <Tag color={getStatusColor(workflow)}>
                          {getStatusText(workflow)}
                        </Tag>
                      </div>
                    }
                    description={
                      <Space direction="vertical" size={4}>
                        {workflow.description && (
                          <Text type="secondary">{workflow.description}</Text>
                        )}
                        <Space size={16}>
                          <Text type="secondary">
                            <PlayCircleOutlined /> {workflow.actions.length} actions
                          </Text>
                          <Text type="secondary">
                            <ClockCircleOutlined /> Last run: {
                              workflow.last_ran_at ? formatTimeAgo(workflow.last_ran_at) : 'Never'
                            }
                          </Text>
                        </Space>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Resources Section */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Title level={4} style={{ marginBottom: 16, color: '#666' }}>
            Resources & Support
          </Title>
        </Col>
        {resources.map((resource, index) => (
          <Col xs={24} sm={8} key={index}>
            <Card
              hoverable
              style={{ height: '100%' }}
              onClick={resource.action}
            >
              <Card.Meta
                avatar={
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    background: '#f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 20,
                    color: '#1890ff'
                  }}>
                    {resource.icon}
                  </div>
                }
                title={<span style={{ fontWeight: 600 }}>{resource.title}</span>}
                description={<Text type="secondary">{resource.description}</Text>}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <style jsx>{`
        .workflow-item:hover {
          background: #fafafa;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
}
