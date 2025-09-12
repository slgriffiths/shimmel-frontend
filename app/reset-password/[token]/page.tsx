'use client';

import { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Typography, Space, message, Spin, Alert } from 'antd';
import { LockOutlined, CheckCircleOutlined, MailOutlined } from '@ant-design/icons';
import { useParams, useRouter } from 'next/navigation';
import { AuthService } from '@/services/authService';
import type { ResetTokenValidation } from '@/types/auth';

const { Title, Paragraph } = Typography;

export default function ResetPasswordPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [tokenValidation, setTokenValidation] = useState<ResetTokenValidation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    if (token) {
      validateToken();
    }
  }, [token]);

  const validateToken = async () => {
    try {
      setInitialLoading(true);
      const validation = await AuthService.validateResetToken(token);
      
      if (!validation.token_valid) {
        setError('This password reset link is invalid or has expired.');
      } else {
        setTokenValidation(validation);
      }
      setError(null);
    } catch (error: any) {
      console.error('Failed to validate reset token:', error);
      if (error.response?.status === 404) {
        setError('This password reset link is invalid or has expired.');
      } else {
        setError('Failed to validate reset link. Please try again.');
      }
    } finally {
      setInitialLoading(false);
    }
  };

  const handleResetPassword = async (values: { password: string; confirmPassword: string }) => {
    try {
      setLoading(true);
      
      await AuthService.resetPassword(token, {
        password: values.password
      });
      
      setResetSuccess(true);
      message.success('Password reset successfully!');
      
    } catch (error: any) {
      console.error('Failed to reset password:', error);
      if (error.response?.status === 422) {
        message.error('Invalid password. Please check the requirements.');
      } else if (error.response?.status === 410 || error.response?.status === 404) {
        setError('This password reset link has expired or been used.');
      } else {
        message.error('Failed to reset password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoToLogin = () => {
    router.push('/auth/login');
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
            Validating reset link...
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
        <Card style={{ minWidth: 500 }}>
          <Alert
            message="Invalid Reset Link"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: 24 }}
          />
          
          <Space direction="vertical" style={{ width: '100%' }}>
            <Paragraph>
              Your password reset link may have expired or been used already. 
              You can request a new one below.
            </Paragraph>
            
            <Space style={{ width: '100%', justifyContent: 'center' }}>
              <Button onClick={() => router.push('/forgot-password')}>
                Request New Reset Link
              </Button>
              <Button type="primary" onClick={handleGoToLogin}>
                Go to Sign In
              </Button>
            </Space>
          </Space>
        </Card>
      </div>
    );
  }

  if (resetSuccess) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        background: '#f0f2f5'
      }}>
        <Card style={{ minWidth: 500, textAlign: 'center' }}>
          <CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a', marginBottom: 16 }} />
          <Title level={2}>Password Reset Complete</Title>
          <Paragraph>
            Your password has been successfully reset. You can now sign in with your new password.
          </Paragraph>
          
          <Button 
            type="primary" 
            size="large"
            onClick={handleGoToLogin}
            style={{ marginTop: 16 }}
          >
            Sign In Now
          </Button>
        </Card>
      </div>
    );
  }

  if (!tokenValidation?.token_valid) {
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
          <Title level={2}>Reset Your Password</Title>
          <Paragraph type="secondary">
            Enter your new password below.
          </Paragraph>
        </div>

        <div style={{ marginBottom: 24, padding: 16, background: '#f6ffed', borderRadius: 6 }}>
          <Space>
            <MailOutlined />
            <strong>Account:</strong> {tokenValidation.email}
          </Space>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleResetPassword}
        >
          <Form.Item
            label="New Password"
            name="password"
            rules={[
              { required: true, message: 'Please enter a new password' },
              { min: 8, message: 'Password must be at least 8 characters' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Enter your new password"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Confirm New Password"
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your new password' },
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
              placeholder="Confirm your new password"
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
              Reset Password
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Paragraph type="secondary">
            Remember your password?{' '}
            <a onClick={handleGoToLogin}>
              Sign in here
            </a>
          </Paragraph>
        </div>

        <Alert
          message="Password Requirements"
          description="Your password must be at least 8 characters long and should include a mix of letters, numbers, and special characters for security."
          type="info"
          showIcon
          style={{ marginTop: 24 }}
        />
      </Card>
    </div>
  );
}