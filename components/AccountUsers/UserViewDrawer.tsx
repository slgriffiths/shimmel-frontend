'use client';

import { Drawer, Descriptions, Tag, Space, Typography } from 'antd';
import { UserOutlined, MailOutlined, CalendarOutlined, ClockCircleOutlined } from '@ant-design/icons';
import type { User } from '@/types/user';

const { Title } = Typography;

interface UserViewDrawerProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
}

export default function UserViewDrawer({ open, onClose, user }: UserViewDrawerProps) {
  if (!user) return null;

  return (
    <Drawer
      title={
        <Space>
          <UserOutlined />
          <span>{`${user.first_name} ${user.last_name}`}</span>
        </Space>
      }
      placement="right"
      onClose={onClose}
      open={open}
      width={600}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Title level={4}>User Information</Title>
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Full Name">
              {`${user.first_name} ${user.last_name}`}
            </Descriptions.Item>
            
            <Descriptions.Item label="Email Address">
              <Space>
                <MailOutlined />
                {user.email}
              </Space>
            </Descriptions.Item>
            
            <Descriptions.Item label="Role">
              <Tag color={user.role === 'admin' ? 'gold' : 'blue'}>
                {user.role === 'admin' ? 'Account Administrator' : 'User'}
              </Tag>
            </Descriptions.Item>
            
            <Descriptions.Item label="Status">
              <Tag color={user.disabled_at ? 'red' : 'green'}>
                {user.disabled_at ? 'Disabled' : 'Active'}
              </Tag>
              {user.disabled_at && (
                <div style={{ marginTop: 4, fontSize: '12px', color: '#666' }}>
                  Disabled on: {new Date(user.disabled_at).toLocaleString()}
                </div>
              )}
            </Descriptions.Item>
            
            <Descriptions.Item label="Account">
              {user.account_name || `Account ${user.account_id}`}
            </Descriptions.Item>
          </Descriptions>
        </div>

        <div>
          <Title level={4}>Activity Information</Title>
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Last Sign In">
              <Space>
                <ClockCircleOutlined />
                {user.last_sign_in_at 
                  ? new Date(user.last_sign_in_at).toLocaleString()
                  : 'Never signed in'
                }
              </Space>
            </Descriptions.Item>
            
            <Descriptions.Item label="Account Created">
              <Space>
                <CalendarOutlined />
                {new Date(user.created_at).toLocaleString()}
              </Space>
            </Descriptions.Item>
            
            <Descriptions.Item label="Last Updated">
              <Space>
                <CalendarOutlined />
                {new Date(user.updated_at).toLocaleString()}
              </Space>
            </Descriptions.Item>
          </Descriptions>
        </div>

        {user.disabled_at && (
          <div>
            <Title level={4}>Account Status</Title>
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Disabled Date">
                {new Date(user.disabled_at).toLocaleString()}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Space>
    </Drawer>
  );
}