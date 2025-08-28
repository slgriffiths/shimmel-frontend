import { useState } from 'react';
import { Drawer, Form, Input, Button, message, Select, InputNumber } from 'antd';
import { api } from '@/lib/api';
import { useConfiguration } from '@/contexts/ConfigurationContext';

const { TextArea } = Input;

interface CreateAgentDrawerProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface CreateAgentForm {
  name: string;
  description?: string;
  system_message: string;
  underlying_model: string;
  temperature: number;
}

export default function CreateAgentDrawer({ open, onClose, onSuccess }: CreateAgentDrawerProps) {
  const [form] = Form.useForm<CreateAgentForm>();
  const [loading, setLoading] = useState(false);
  const { configuration, refreshAgents } = useConfiguration();

  const handleSubmit = async (values: CreateAgentForm) => {
    setLoading(true);
    try {
      await api.post('/agents', values);
      message.success('Agent created successfully');
      form.resetFields();
      await refreshAgents();
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to create agent:', error);
      message.error('Failed to create agent');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  // Filter out agent models from available models to show only LLM models
  const llmModels = configuration?.available_llm_models?.filter(
    model => model.provider !== 'agent'
  ) || [];

  return (
    <Drawer
      title="Create New Agent"
      open={open}
      onClose={handleCancel}
      width={600}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        style={{ marginTop: 16 }}
        initialValues={{
          temperature: 0.7,
        }}
      >
        <Form.Item
          name="name"
          label="Agent Name"
          rules={[
            { required: true, message: 'Please enter an agent name' },
            { min: 2, message: 'Agent name must be at least 2 characters' },
          ]}
        >
          <Input placeholder="Enter agent name (e.g., Marketing Assistant)" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
        >
          <Input placeholder="Brief description of what this agent does" />
        </Form.Item>

        <Form.Item
          name="underlying_model"
          label="LLM Model"
          rules={[
            { required: true, message: 'Please select an LLM model' },
          ]}
        >
          <Select placeholder="Select the underlying LLM model">
            {llmModels.map((model) => (
              <Select.Option key={model.id} value={model.id}>
                <div>
                  <div>{model.name}</div>
                  <div style={{ fontSize: 12, color: '#666' }}>{model.provider}</div>
                </div>
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="temperature"
          label="Temperature"
          rules={[
            { required: true, message: 'Please set a temperature' },
            { type: 'number', min: 0, max: 2, message: 'Temperature must be between 0 and 2' },
          ]}
        >
          <InputNumber 
            min={0} 
            max={2} 
            step={0.1} 
            style={{ width: '100%' }}
            placeholder="0.7"
          />
        </Form.Item>

        <Form.Item
          name="system_message"
          label="System Instructions"
          rules={[
            { required: true, message: 'Please enter system instructions' },
            { min: 10, message: 'System instructions must be at least 10 characters' },
          ]}
        >
          <TextArea
            rows={12}
            placeholder="Enter detailed system instructions for this agent. These will be used as the system message for all conversations with this agent."
            style={{ fontFamily: 'monospace', fontSize: 13 }}
          />
        </Form.Item>

        <div style={{ textAlign: 'right', marginTop: 24 }}>
          <Button onClick={handleCancel} style={{ marginRight: 8 }}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Create Agent
          </Button>
        </div>
      </Form>
    </Drawer>
  );
}