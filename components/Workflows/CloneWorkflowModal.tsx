'use client';

import { useState, useEffect } from 'react';
import { Modal, Form, Select, message } from 'antd';
import { api } from '@/lib/api';
import { WorkflowService } from '@/services/workflowService';
import { useConfiguration } from '@/contexts/ConfigurationContext';
import type { Workflow } from '@/types/workflow';

interface CloneWorkflowModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  workflow: Workflow | null;
}

interface CloneFormData {
  target_account_id?: number;
}

interface Account {
  id: number;
  name: string;
}

export default function CloneWorkflowModal({ open, onClose, onSuccess, workflow }: CloneWorkflowModalProps) {
  const [form] = Form.useForm<CloneFormData>();
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const { configuration } = useConfiguration();

  useEffect(() => {
    if (open && workflow) {
      form.setFieldsValue({
        target_account_id: undefined,
      });
    }
  }, [open, workflow, form]);

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
      
      await WorkflowService.cloneWorkflow(workflow!.id, payload);
      
      message.success('Workflow cloned successfully');
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Failed to clone workflow:', error);
      message.error('Failed to clone workflow');
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
      title={`Clone Workflow: ${workflow?.name}`}
      open={open}
      onOk={handleClone}
      onCancel={handleClose}
      confirmLoading={loading}
      okText="Clone Workflow"
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
          This will create a complete copy of the workflow:
        </div>
        <div style={{ fontSize: '12px', color: '#666' }}>
          • Name & Description<br/>
          • All Triggers ({workflow?.triggers.length || 0})<br/>
          • All Actions ({workflow?.actions.length || 0})<br/>
          • Configuration & Settings
        </div>
      </div>
      
      <div style={{ 
        marginTop: 16, 
        padding: 12, 
        backgroundColor: '#e6f7ff', 
        border: '1px solid #91d5ff', 
        borderRadius: 4 
      }}>
        <div style={{ fontSize: '12px', color: '#1890ff', fontWeight: '600', marginBottom: 4 }}>
          📋 Important Notice
        </div>
        <div style={{ fontSize: '12px', color: '#1890ff' }}>
          Any Agents used in the workflow will get automatically created in the target account.
        </div>
      </div>
    </Modal>
  );
}