'use client';

import { useState } from 'react';
import { Drawer, Form, Input, Button, Space, message, Checkbox } from 'antd';
import { UserAddOutlined, SaveOutlined } from '@ant-design/icons';
import { UserService } from '@/services/userService';
import type { CreateUserRequest } from '@/types/user';

interface NewUserDrawerProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  accountId: number;
}

export default function NewUserDrawer({ 
  open, 
  onClose, 
  onSuccess, 
  accountId 
}: NewUserDrawerProps) {
  const [form] = Form.useForm<CreateUserRequest>();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      // Convert checkbox to role string - always pass either "admin" or "user"
      const createData: CreateUserRequest = {
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        role: values.role === 'admin' ? 'admin' : 'user',
      };

      await UserService.createUser(accountId, createData);
      message.success('User created successfully');
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Failed to create user:', error);
      message.error('Failed to create user');
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
      title={
        <Space>
          <UserAddOutlined />
          <span>New User</span>
        </Space>
      }
      placement="right"
      onClose={handleClose}
      open={open}
      width={500}
      extra={
        <Button
          type="primary"
          icon={<SaveOutlined />}
          loading={loading}
          onClick={handleSubmit}
        >
          Create User
        </Button>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          role: 'admin' // Default to admin as requested
        }}
      >
        <Form.Item
          label="First Name"
          name="first_name"
          rules={[{ required: true, message: 'Please enter first name' }]}
        >
          <Input placeholder="Enter first name" />
        </Form.Item>

        <Form.Item
          label="Last Name"
          name="last_name"
          rules={[{ required: true, message: 'Please enter last name' }]}
        >
          <Input placeholder="Enter last name" />
        </Form.Item>

        <Form.Item
          label="Email Address"
          name="email"
          rules={[
            { required: true, message: 'Please enter email address' },
            { type: 'email', message: 'Please enter a valid email address' }
          ]}
        >
          <Input placeholder="Enter email address" />
        </Form.Item>

        <Form.Item
          name="role"
          valuePropName="checked"
          getValueFromEvent={(e) => e.target.checked ? 'admin' : 'user'}
          getValueProps={(value) => ({ checked: value === 'admin' })}
        >
          <Checkbox defaultChecked>Account Administrator</Checkbox>
        </Form.Item>

        <div style={{ marginTop: 24 }}>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              Create User
            </Button>
            <Button onClick={handleClose}>
              Cancel
            </Button>
          </Space>
        </div>
      </Form>
    </Drawer>
  );
}