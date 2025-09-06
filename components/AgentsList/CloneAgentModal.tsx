'use client';

import { useState, useEffect } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { api } from '@/lib/api';
import type { Agent } from '@/contexts/ConfigurationContext';

const { TextArea } = Input;

interface CloneAgentModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  agent: Agent | null;
}

interface CloneFormData {
  name: string;
  description: string;
}

export default function CloneAgentModal({ open, onClose, onSuccess, agent }: CloneAgentModalProps) {
  const [form] = Form.useForm<CloneFormData>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && agent) {
      form.setFieldsValue({
        name: `${agent.name} (Copy)`,
        description: agent.description || '',
      });
    }
  }, [open, agent, form]);

  const handleClone = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      await api.post('/agents', {
        name: values.name,
        description: values.description,
        system_message: agent?.system_message,
        underlying_model: agent?.underlying_model,
        temperature: agent?.temperature,
        parent_agent_id: agent?.id,
      });
      
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
          label="Name"
          name="name"
          rules={[{ required: true, message: 'Please enter agent name' }]}
        >
          <Input placeholder="Enter agent name" />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
        >
          <TextArea 
            placeholder="Enter agent description" 
            rows={3}
          />
        </Form.Item>
      </Form>

      <div style={{ marginTop: 16, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
        <div style={{ fontSize: '12px', color: '#666', marginBottom: 8 }}>
          The following settings will be copied from the original agent:
        </div>
        <div style={{ fontSize: '12px', color: '#666' }}>
          • System Instructions<br/>
          • Base Model: {agent?.underlying_model}<br/>
          • Temperature: {agent?.temperature}
        </div>
      </div>
    </Modal>
  );
}