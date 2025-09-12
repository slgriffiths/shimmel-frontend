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
    router.push('/login');
  };

  if (initialLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <Card
          style={{
            width: '100%',
            maxWidth: 400,
            borderRadius: 16,
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            border: 'none'
          }}
          styles={{ body: { padding: '40px 32px', textAlign: 'center' } }}
        >
          <Spin size="large" />
          <div style={{ marginTop: 16, color: '#1f2937' }}>
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
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <Card
          style={{
            width: '100%',
            maxWidth: 500,
            borderRadius: 16,
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            border: 'none'
          }}
          styles={{ body: { padding: '40px 32px' } }}
        >
          <Alert
            message="Invalid Reset Link"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: 24, borderRadius: 8 }}
          />
          
          <Space direction="vertical" style={{ width: '100%' }}>
            <Paragraph style={{ fontSize: 16 }}>
              Your password reset link may have expired or been used already. 
              You can request a new one below.
            </Paragraph>
            
            <Space style={{ width: '100%', justifyContent: 'center' }}>
              <Button 
                onClick={() => router.push('/forgot-password')}
                style={{ borderRadius: 8 }}
              >
                Request New Reset Link
              </Button>
              <Button 
                type="primary" 
                onClick={handleGoToLogin}
                style={{
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none'
                }}
              >
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
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <Card
          style={{
            width: '100%',
            maxWidth: 500,
            borderRadius: 16,
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            border: 'none'
          }}
          styles={{ body: { padding: '40px 32px', textAlign: 'center' } }}
        >
          <CheckCircleOutlined style={{ fontSize: 48, color: '#667eea', marginBottom: 16 }} />
          <Title level={2} style={{ marginBottom: 8, color: '#1f2937' }}>
            Password Reset Complete
          </Title>
          <Paragraph style={{ fontSize: 16, marginBottom: 24 }}>
            Your password has been successfully reset. You can now sign in with your new password.
          </Paragraph>
          
          <Button 
            type="primary" 
            size="large"
            onClick={handleGoToLogin}
            style={{
              height: 48,
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 500,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none'
            }}
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
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <Card
        style={{
          width: '100%',
          maxWidth: 500,
          borderRadius: 16,
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          border: 'none'
        }}
        styles={{ body: { padding: '40px 32px' } }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title level={2} style={{ marginBottom: 8, color: '#1f2937' }}>
            Reset Your Password
          </Title>
          <Paragraph type="secondary" style={{ fontSize: 16 }}>
            Enter your new password below.
          </Paragraph>
        </div>

        <div style={{ marginBottom: 24, padding: 16, background: '#f6ffed', borderRadius: 8 }}>
          <Space>
            <MailOutlined style={{ color: '#667eea' }} />
            <strong>Account:</strong> {tokenValidation.email}
          </Space>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleResetPassword}
          size="large"
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
              prefix={<LockOutlined style={{ color: '#9ca3af' }} />}
              placeholder="Enter your new password"
              style={{ borderRadius: 8 }}
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
              prefix={<LockOutlined style={{ color: '#9ca3af' }} />}
              placeholder="Confirm your new password"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              block
              style={{
                height: 48,
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 500,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none'
              }}
            >
              Reset Password
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Paragraph type="secondary" style={{ fontSize: 14 }}>
            Remember your password?{' '}
            <a onClick={handleGoToLogin} style={{ color: '#667eea', fontWeight: 500, cursor: 'pointer' }}>
              Sign in here
            </a>
          </Paragraph>
        </div>

        <Alert
          message="Password Requirements"
          description="Your password must be at least 8 characters long and should include a mix of letters, numbers, and special characters for security."
          type="info"
          showIcon
          style={{ marginTop: 24, borderRadius: 8 }}
        />
      </Card>
    </div>
  );
}