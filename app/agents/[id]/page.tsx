'use client';

import { useState, useEffect } from 'react';
import { Typography, Button, Form, Input, Select, InputNumber, Card, Divider, message, Spin, Tag } from 'antd';
import { SaveOutlined, CloseOutlined, CopyOutlined } from '@ant-design/icons';
import { useRouter, useParams } from 'next/navigation';
import { useConfiguration } from '@/contexts/ConfigurationContext';
import { api } from '@/lib/api';
import CloneAgentModal from '@/components/AgentsList/CloneAgentModal';
import type { Agent, AvailableModel } from '@/contexts/ConfigurationContext';

const { Title } = Typography;
const { TextArea } = Input;

interface AgentFormData {
  name: string;
  description: string;
  system_message: string;
  underlying_model: string;
  temperature: number;
}

export default function AgentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { configuration, refreshAgents } = useConfiguration();
  const [form] = Form.useForm<AgentFormData>();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cloneModalOpen, setCloneModalOpen] = useState(false);

  const agentId = params.id as string;
  const availableModels = configuration?.available_llm_models || [];

  useEffect(() => {
    const fetchAgent = async () => {
      try {
        const { data } = await api.get(`/agents/${agentId}`);
        setAgent(data);
        form.setFieldsValue({
          name: data.name,
          description: data.description || '',
          system_message: data.system_message,
          underlying_model: data.underlying_model,
          temperature: data.temperature,
        });
      } catch (error) {
        console.error('Failed to fetch agent:', error);
        message.error('Failed to load agent details');
        router.push('/agents');
      } finally {
        setLoading(false);
      }
    };

    if (agentId) {
      fetchAgent();
    }
  }, [agentId, form, router]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const values = await form.validateFields();
      await api.put(`/agents/${agentId}`, values);
      message.success('Agent updated successfully');
      refreshAgents();
      router.push('/agents');
    } catch (error) {
      console.error('Failed to update agent:', error);
      message.error('Failed to update agent');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/agents');
  };

  const handleClone = () => {
    setCloneModalOpen(true);
  };

  const handleCloneSuccess = () => {
    message.success('Agent cloned successfully');
    refreshAgents();
  };

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Loading agent details...</div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div style={{ padding: 24 }}>
        <Title level={2}>Agent not found</Title>
        <Button onClick={handleCancel}>Back to Agents</Button>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>{agent.name}</Title>
          <div style={{ marginTop: 8 }}>
            <Tag color={agent.account_id ? 'blue' : 'green'}>
              {agent.account_name || (agent.account_id ? `Account ${agent.account_id}` : 'Global')}
            </Tag>
          </div>
        </div>
        <div>
          <Button 
            icon={<CopyOutlined />} 
            onClick={handleClone}
            style={{ marginRight: 8 }}
          >
            Clone
          </Button>
          <Button 
            icon={<CloseOutlined />} 
            onClick={handleCancel}
            style={{ marginRight: 8 }}
          >
            Cancel
          </Button>
          <Button 
            type="primary" 
            icon={<SaveOutlined />} 
            onClick={handleSave}
            loading={saving}
          >
            Save
          </Button>
        </div>
      </div>

      <Card>
        <Form
          form={form}
          layout="horizontal"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 20 }}
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

          <Divider />

          <Form.Item
            label="System Instructions"
            name="system_message"
            rules={[{ required: true, message: 'Please enter system instructions' }]}
          >
            <TextArea 
              placeholder="Enter system instructions for the agent"
              rows={8}
            />
          </Form.Item>

          <Form.Item
            label="Base Model"
            name="underlying_model"
            rules={[{ required: true, message: 'Please select a base model' }]}
          >
            <Select placeholder="Select a base model">
              {availableModels.map((model: AvailableModel) => (
                <Select.Option key={model.id} value={model.id}>
                  {model.name} ({model.provider})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Temperature"
            name="temperature"
            rules={[
              { required: true, message: 'Please enter temperature' },
              { type: 'number', min: 0, max: 2, message: 'Temperature must be between 0 and 2' }
            ]}
          >
            <InputNumber 
              min={0} 
              max={2} 
              step={0.1} 
              style={{ width: 120 }}
              placeholder="0.7"
            />
          </Form.Item>
        </Form>
      </Card>

      <CloneAgentModal
        open={cloneModalOpen}
        onClose={() => setCloneModalOpen(false)}
        onSuccess={handleCloneSuccess}
        agent={agent}
      />
    </div>
  );
}