'use client';

import { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, message } from 'antd';
import { api } from '@/lib/api';
import { useConfiguration } from '@/contexts/ConfigurationContext';
import type { Agent } from '@/contexts/ConfigurationContext';

const { TextArea } = Input;

interface CloneAgentModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  agent: Agent | null;
}

interface CloneFormData {
  target_account_id?: number;
}

interface Account {
  id: number;
  name: string;
}

export default function CloneAgentModal({ open, onClose, onSuccess, agent }: CloneAgentModalProps) {
  const [form] = Form.useForm<CloneFormData>();
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const { configuration } = useConfiguration();

  useEffect(() => {
    if (open && agent) {
      form.setFieldsValue({
        target_account_id: undefined,
      });
    }
  }, [open, agent, form]);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const { data } = await api.get('/accounts');
        setAccounts(data.accounts || []);
      } catch (error) {
        console.error('Failed to fetch accounts:', error);
        setAccounts([]);
      }
    };

    if (open) {
      fetchAccounts();
    }
  }, [open]);

  const handleClone = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      const payload: { target_account_id?: number } = {};
      if (values.target_account_id) {
        payload.target_account_id = values.target_account_id;
      }
      
      await api.post(`/agents/${agent?.id}/clone`, payload);
      
      message.success('Agent cloned successfully');
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Failed to clone agent:', error);
      message.error('Failed to clone agent');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    form.resetFields();
    setAccounts([]);
    onClose();
  };

  return (
    <Modal
      title={`Clone Agent: ${agent?.name}`}
      open={open}
      onOk={handleClone}
      onCancel={handleClose}
      confirmLoading={loading}
      okText="Clone Agent"
      cancelText="Cancel"
    >
      <Form
        form={form}
        layout="vertical"
      >
        <Form.Item
          label="Target Account"
          name="target_account_id"
          help="Leave blank to clone to your current account"
        >
          <Select
            placeholder="Select target account (optional)"
            allowClear
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
          >
            {(accounts || []).map(account => (
              <Select.Option key={account.id} value={account.id} label={account.name}>
                {account.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>

      <div style={{ marginTop: 16, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
        <div style={{ fontSize: '12px', color: '#666', marginBottom: 8 }}>
          This will create a complete copy of the agent:
        </div>
        <div style={{ fontSize: '12px', color: '#666' }}>
          • Name & Description<br/>
          • System Instructions<br/>
          • Base Model: {agent?.underlying_model}<br/>
          • Temperature: {agent?.temperature}
        </div>
      </div>
    </Modal>
  );
}