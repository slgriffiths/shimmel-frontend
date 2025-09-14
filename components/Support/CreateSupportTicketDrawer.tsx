'use client';

import { useState } from 'react';
import { Drawer, Form, Input, Button, message, Space } from 'antd';
import { SupportTicketService } from '@/services/supportTicketService';
import type { CreateSupportTicketRequest } from '@/types/supportTicket';

const { TextArea } = Input;

interface CreateSupportTicketDrawerProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateSupportTicketDrawer({
  open,
  onClose,
  onSuccess,
}: CreateSupportTicketDrawerProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: CreateSupportTicketRequest) => {
    try {
      setLoading(true);
      await SupportTicketService.createSupportTicket(values);
      message.success('Support ticket created successfully');
      form.resetFields();
      onSuccess();
    } catch (error) {
      console.error('Failed to create support ticket:', error);
      message.error('Failed to create support ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Drawer
      title="Create Support Ticket"
      open={open}
      onClose={handleClose}
      width={600}
      footer={
        <div style={{ textAlign: 'right' }}>
          <Space>
            <Button onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="primary" 
              loading={loading}
              onClick={() => form.submit()}
            >
              Create Ticket
            </Button>
          </Space>
        </div>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
      >
        <Form.Item
          label="Title"
          name="title"
          rules={[
            { required: true, message: 'Please enter a title' },
            { max: 200, message: 'Title must be less than 200 characters' }
          ]}
        >
          <Input 
            placeholder="Brief summary of your issue"
            size="large"
          />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[
            { required: true, message: 'Please describe your issue' },
            { min: 10, message: 'Description must be at least 10 characters' }
          ]}
        >
          <TextArea
            placeholder="Please provide detailed information about your issue, including any steps to reproduce it, error messages, or relevant context."
            rows={8}
            maxLength={2000}
            showCount
          />
        </Form.Item>
      </Form>

      <div style={{ 
        marginTop: 24, 
        padding: 16, 
        background: '#f6ffed', 
        borderRadius: 8,
        border: '1px solid #b7eb8f'
      }}>
        <h4 style={{ margin: '0 0 8px 0', color: '#52c41a' }}>💡 Tips for Better Support</h4>
        <ul style={{ margin: 0, paddingLeft: 16, color: '#666' }}>
          <li>Be as specific as possible about the issue</li>
          <li>Include any error messages you're seeing</li>
          <li>Describe what you were trying to accomplish</li>
          <li>Mention your browser and operating system if relevant</li>
        </ul>
      </div>
    </Drawer>
  );
}