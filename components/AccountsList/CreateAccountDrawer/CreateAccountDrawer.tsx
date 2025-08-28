import { useState } from 'react';
import { Drawer, Form, Input, Button, message } from 'antd';
import { api } from '@/lib/api';

interface CreateAccountDrawerProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface CreateAccountForm {
  name: string;
}

export default function CreateAccountDrawer({ open, onClose, onSuccess }: CreateAccountDrawerProps) {
  const [form] = Form.useForm<CreateAccountForm>();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: CreateAccountForm) => {
    setLoading(true);
    try {
      await api.post('/accounts', values);
      message.success('Account created successfully');
      form.resetFields();
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to create account:', error);
      message.error('Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Drawer
      title="Create New Account"
      open={open}
      onClose={handleCancel}
      width={400}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        style={{ marginTop: 16 }}
      >
        <Form.Item
          name="name"
          label="Account Name"
          rules={[
            { required: true, message: 'Please enter an account name' },
            { min: 2, message: 'Account name must be at least 2 characters' },
          ]}
        >
          <Input placeholder="Enter account name" />
        </Form.Item>

        <div style={{ textAlign: 'right', marginTop: 24 }}>
          <Button onClick={handleCancel} style={{ marginRight: 8 }}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Create Account
          </Button>
        </div>
      </Form>
    </Drawer>
  );
}