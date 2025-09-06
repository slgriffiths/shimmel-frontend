'use client';

import { Card, Descriptions, Typography, Button, Space } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { useAuth } from '@/hooks/useAuth';

const { Title } = Typography;

export default function UserSettingsPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div style={{ padding: 24 }}>
        <Title level={2}>User Settings</Title>
        <Card>
          <div>Loading user information...</div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>User Settings</Title>
        <Button type="primary" icon={<EditOutlined />}>
          Edit Profile
        </Button>
      </div>

      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Card title="Personal Information" bordered={false}>
          <Descriptions column={1} bordered>
            <Descriptions.Item label="First Name">
              {user.first_name}
            </Descriptions.Item>
            <Descriptions.Item label="Last Name">
              {user.last_name}
            </Descriptions.Item>
            <Descriptions.Item label="Email Address">
              {user.email}
            </Descriptions.Item>
            <Descriptions.Item label="Role">
              {user.role || 'User'}
            </Descriptions.Item>
            <Descriptions.Item label="Member Since">
              {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Last Updated">
              {user.updated_at ? new Date(user.updated_at).toLocaleDateString() : 'N/A'}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card title="Account Status" bordered={false}>
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Account Status">
              Active
            </Descriptions.Item>
            <Descriptions.Item label="Email Verified">
              {user.email_verified ? 'Yes' : 'Pending verification'}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card title="Preferences" bordered={false}>
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Timezone">
              {user.timezone || 'Not set'}
            </Descriptions.Item>
            <Descriptions.Item label="Language">
              {user.language || 'English (Default)'}
            </Descriptions.Item>
            <Descriptions.Item label="Notifications">
              {user.notifications_enabled ? 'Enabled' : 'Disabled'}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </Space>
    </div>
  );
}