'use client';

import { Form, Input, Button, Typography, Card } from 'antd';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { api } from '@/lib/api';

const { Title, Paragraph, Text } = Typography;

export default function NewProjectPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onFinish = async (values: {name: string; description?: string}) => {
    setLoading(true);
    try {
      const response = await api.post('/projects', values);
      const id = response.data.id || response.data.data?.id;
      router.push(`/projects/${id}`);
    } catch (err) {
      console.error('Error creating project:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card style={{ maxWidth: 720, margin: '40px auto' }}>
      <Title level={3}>Create New Project</Title>
      <Paragraph type='secondary'>
        Organize your research into projects. Each project can contain multiple conversations and be associated with a
        specific client or initiative.
      </Paragraph>

      <Form layout='vertical' onFinish={onFinish} style={{ marginTop: 32 }}>
        <Form.Item
          name='name'
          label={
            <span>
              Project Name{' '}
              <Text type='secondary' style={{ fontWeight: 400 }}>
                (This helps you identify the purpose of this project later)
              </Text>
            </span>
          }
          rules={[{ required: true, message: 'Please enter a project name' }]}
        >
          <Input size='large' placeholder='e.g., Acme Inc - Onboarding UX Study' />
        </Form.Item>

        <Form.Item
          name='description'
          label={
            <span>
              Project Description{' '}
              <Text type='secondary' style={{ fontWeight: 400 }}>
                (Include details like research goals, client name, or internal initiative)
              </Text>
            </span>
          }
        >
          <Input.TextArea
            rows={4}
            placeholder='e.g., This project explores onboarding behavior for Acme Inc’s mobile product...'
          />
        </Form.Item>

        <Form.Item>
          <Button type='primary' htmlType='submit' size='large' loading={loading}>
            Create Project
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
