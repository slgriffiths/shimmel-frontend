'use client';

import { useState, useEffect } from 'react';
import { Drawer, Form, Input, Button, Space, message, Checkbox } from 'antd';
import { EditOutlined, SaveOutlined } from '@ant-design/icons';
import { UserService } from '@/services/userService';
import type { User, UpdateUserRequest } from '@/types/user';

interface UserEditDrawerProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: User | null;
  accountId: number;
}

export default function UserEditDrawer({ 
  open, 
  onClose, 
  onSuccess, 
  user,
  accountId 
}: UserEditDrawerProps) {
  const [form] = Form.useForm<UpdateUserRequest>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && user) {
      form.setFieldsValue({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role === 'admin' ? 'admin' : 'user',
      });
    }
  }, [open, user, form]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      // Convert checkbox to role string - always pass either "admin" or "user"
      const updateData: UpdateUserRequest = {
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        role: values.role === 'admin' ? 'admin' : 'user',
      };

      await UserService.updateUser(accountId, user!.id, updateData);
      message.success('User updated successfully');
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Failed to update user:', error);
      message.error('Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    form.resetFields();
    onClose();
  };

  if (!user) return null;

  return (
    <Drawer
      title={
        <Space>
          <EditOutlined />
          <span>Edit User: {`${user.first_name} ${user.last_name}`}</span>
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
          Save Changes
        </Button>
      }
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
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
          <Checkbox>Account Administrator</Checkbox>
        </Form.Item>

        <div style={{ marginTop: 24 }}>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              Save Changes
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