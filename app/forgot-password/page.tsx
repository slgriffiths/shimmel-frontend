'use client';

import { useState } from 'react';
import { Card, Form, Input, Button, Typography, message, Alert } from 'antd';
import { MailOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/services/authService';

const { Title, Paragraph } = Typography;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const handleSubmit = async (values: { email: string }) => {
    try {
      setLoading(true);
      
      await AuthService.requestPasswordReset({
        email: values.email
      });
      
      setSubmittedEmail(values.email);
      setEmailSent(true);
      
    } catch (error: any) {
      console.error('Failed to request password reset:', error);
      // Note: Backend provides generic message to prevent email enumeration
      message.error('Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.push('/login');
  };

  if (emailSent) {
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
            <MailOutlined style={{ fontSize: 48, color: '#667eea', marginBottom: 16 }} />
            <Title level={2} style={{ marginBottom: 8, color: '#1f2937' }}>
              Check Your Email
            </Title>
            <Paragraph style={{ fontSize: 16 }}>
              If an account exists for <strong>{submittedEmail}</strong>, we've sent you a password reset link.
            </Paragraph>
            <Paragraph type="secondary" style={{ fontSize: 14 }}>
              The link will expire in 24 hours. Check your spam folder if you don't see the email.
            </Paragraph>
          </div>

          <Alert
            message="Didn't receive the email?"
            description="You can try submitting the form again, or contact support if you continue having issues."
            type="info"
            showIcon
            style={{ marginBottom: 24, borderRadius: 8 }}
          />

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Button 
              onClick={() => setEmailSent(false)}
              style={{ borderRadius: 8 }}
            >
              Try Another Email
            </Button>
            <Button 
              type="primary" 
              onClick={handleBackToLogin}
              style={{
                borderRadius: 8,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none'
              }}
            >
              Back to Sign In
            </Button>
          </div>
        </Card>
      </div>
    );
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
          maxWidth: 400,
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
            Enter your email address and we'll send you a link to reset your password.
          </Paragraph>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          size="large"
        >
          <Form.Item
            label="Email Address"
            name="email"
            rules={[
              { required: true, message: 'Please enter your email address' },
              { type: 'email', message: 'Please enter a valid email address' },
            ]}
          >
            <Input
              prefix={<MailOutlined style={{ color: '#9ca3af' }} />}
              placeholder="Enter your email address"
              style={{ borderRadius: 8 }}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 24 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
              style={{
                height: 48,
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 500,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none'
              }}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Button 
            type="link" 
            icon={<ArrowLeftOutlined />}
            onClick={handleBackToLogin}
            style={{ color: '#667eea', fontWeight: 500 }}
          >
            Back to Sign In
          </Button>
        </div>
      </Card>
    </div>
  );
}