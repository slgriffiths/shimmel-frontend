'use client';

import { Card, Descriptions, Typography, Button, Space, Tag, Statistic, Row, Col } from 'antd';
import { EditOutlined, TeamOutlined, SettingOutlined, BarChartOutlined } from '@ant-design/icons';
import { useAuth } from '@/hooks/useAuth';
import { useConfiguration } from '@/contexts/ConfigurationContext';

const { Title } = Typography;

export default function AccountSettingsPage() {
  const { user } = useAuth();
  const { configuration } = useConfiguration();

  const account = user?.account || configuration?.account;

  if (!account) {
    return (
      <div style={{ padding: 24 }}>
        <Title level={2}>Account Settings</Title>
        <Card>
          <div>Loading account information...</div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Account Settings</Title>
        <Button type="primary" icon={<EditOutlined />}>
          Manage Account
        </Button>
      </div>

      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Card title="Account Overview" bordered={false}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="Users"
                value={account.user_count || 0}
                prefix={<TeamOutlined />}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="Workflows"
                value={account.workflow_count || 0}
                prefix={<SettingOutlined />}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="Agents"
                value={account.agent_count || 0}
                prefix={<BarChartOutlined />}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="Account ID"
                value={account.id}
              />
            </Col>
          </Row>
        </Card>

        <Card title="Account Information" bordered={false}>
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Account Name">
              {account.name}
            </Descriptions.Item>
            <Descriptions.Item label="Account Type">
              <Tag color="blue">Standard Account</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Created">
              {account.created_at ? new Date(account.created_at).toLocaleDateString() : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Last Updated">
              {account.updated_at ? new Date(account.updated_at).toLocaleDateString() : 'N/A'}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card title="Account Status" bordered={false}>
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Status">
              <Tag color="green">Active</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Plan">
              {account.plan || 'Standard'}
            </Descriptions.Item>
            <Descriptions.Item label="Billing Status">
              <Tag color="green">{account.billing_status || 'Current'}</Tag>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card title="Usage Summary" bordered={false}>
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Active Users">
              {account.user_count || 0} users
            </Descriptions.Item>
            <Descriptions.Item label="Total Workflows">
              {account.workflow_count || 0} workflows created
            </Descriptions.Item>
            <Descriptions.Item label="AI Agents">
              {account.agent_count || 0} custom agents configured
            </Descriptions.Item>
            <Descriptions.Item label="Monthly Workflow Runs">
              {account.monthly_runs || 'N/A'}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </Space>
    </div>
  );
}