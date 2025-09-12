'use client';

import { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Typography, Space, message, Spin, Alert } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, TeamOutlined } from '@ant-design/icons';
import { useParams, useRouter } from 'next/navigation';
import { AuthService } from '@/services/authService';
import type { InvitationDetails } from '@/types/auth';

const { Title, Paragraph } = Typography;

export default function AcceptInvitationPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      loadInvitationDetails();
    }
  }, [token]);

  const loadInvitationDetails = async () => {
    try {
      setInitialLoading(true);
      const details = await AuthService.getInvitationDetails(token);
      setInvitation(details);
      setError(null);
    } catch (error: any) {
      console.error('Failed to load invitation details:', error);
      if (error.response?.status === 404) {
        setError('This invitation link is invalid or has expired.');
      } else if (error.response?.status === 410) {
        setError('This invitation has already been used.');
      } else {
        setError('Failed to load invitation details. Please try again.');
      }
    } finally {
      setInitialLoading(false);
    }
  };

  const handleAcceptInvitation = async (values: { password: string; confirmPassword: string }) => {
    try {
      setLoading(true);
      
      await AuthService.acceptInvitation(token, {
        password: values.password
      });
      
      message.success('Account created successfully! You can now sign in.');
      
      // Redirect to login page after brief delay
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
      
    } catch (error: any) {
      console.error('Failed to accept invitation:', error);
      if (error.response?.status === 422) {
        message.error('Invalid password. Please check the requirements.');
      } else if (error.response?.status === 410) {
        message.error('This invitation has expired or been used.');
      } else {
        message.error('Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        background: '#f0f2f5'
      }}>
        <Card style={{ minWidth: 400, textAlign: 'center' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>
            Loading invitation details...
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        background: '#f0f2f5'
      }}>
        <Card style={{ minWidth: 400 }}>
          <Alert
            message="Invitation Error"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: 24 }}
          />
          <Button 
            type="primary" 
            block 
            onClick={() => router.push('/auth/login')}
          >
            Go to Sign In
          </Button>
        </Card>
      </div>
    );
  }

  if (!invitation) {
    return null;
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      background: '#f0f2f5'
    }}>
      <Card style={{ minWidth: 500 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={2}>Welcome to Shimmel AI</Title>
          <Paragraph type="secondary">
            You've been invited to join the team. Please set up your account below.
          </Paragraph>
        </div>

        <div style={{ marginBottom: 24, padding: 16, background: '#f6ffed', borderRadius: 6 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Space>
              <UserOutlined />
              <strong>Name:</strong> {invitation.first_name} {invitation.last_name}
            </Space>
            <Space>
              <MailOutlined />
              <strong>Email:</strong> {invitation.email}
            </Space>
            <Space>
              <TeamOutlined />
              <strong>Account:</strong> {invitation.account_name}
            </Space>
          </Space>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleAcceptInvitation}
        >
          <Form.Item
            label="Create Password"
            name="password"
            rules={[
              { required: true, message: 'Please enter a password' },
              { min: 8, message: 'Password must be at least 8 characters' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Enter your password"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Confirm Password"
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Confirm your password"
              size="large"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              block
            >
              Create Account
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Paragraph type="secondary">
            Already have an account?{' '}
            <a onClick={() => router.push('/auth/login')}>
              Sign in here
            </a>
          </Paragraph>
        </div>
      </Card>
    </div>
  );
}