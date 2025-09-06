import { Form, Input, Select, InputNumber, Typography, Space, Popover, Button } from 'antd';
import { QuestionCircleOutlined, RobotOutlined } from '@ant-design/icons';
import { useEffect } from 'react';
import { useConfiguration } from '@/contexts/ConfigurationContext';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface GenerateTextWithAgentConfig {
  prompt?: string;
  agent_id?: number;
  max_tokens?: number;
}

interface GenerateTextWithAgentActionConfigProps {
  config: GenerateTextWithAgentConfig;
  onConfigChange: (config: GenerateTextWithAgentConfig) => void;
}

export default function GenerateTextWithAgentActionConfig({ config, onConfigChange }: GenerateTextWithAgentActionConfigProps) {
  const [form] = Form.useForm();
  const { configuration } = useConfiguration();

  const variableInstructions = (
    <div style={{ maxWidth: 400 }}>
      <Title level={5} style={{ marginBottom: 12, fontSize: 14 }}>
        Template Variables Guide
      </Title>
      
      <div style={{ marginBottom: 16 }}>
        <Text strong style={{ fontSize: 13, color: '#1890ff' }}>
          Form Data Variables:
        </Text>
        <div style={{ marginTop: 6, fontSize: 12, fontFamily: 'monospace', backgroundColor: '#f6f8fa', padding: 8, borderRadius: 4 }}>
          <div>{'{{form.fieldName}}'} → User input value</div>
          <div>{'{{trigger.data.fieldName}}'} → Alternative format</div>
        </div>
        <Text style={{ fontSize: 11, color: '#666', marginTop: 4, display: 'block' }}>
          Example: {'{{form.name}}'} → "John", {'{{form.email}}'} → "john@example.com"
        </Text>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Text strong style={{ fontSize: 13, color: '#52c41a' }}>
          Previous Step Variables:
        </Text>
        <div style={{ marginTop: 6, fontSize: 12, fontFamily: 'monospace', backgroundColor: '#f6f8fa', padding: 8, borderRadius: 4 }}>
          <div>{'{{previousStep.result}}'} → Main output</div>
          <div>{'{{previousStep.type}}'} → Action type</div>
          <div>{'{{previousStep.metadata.execution_time_ms}}'} → Execution time</div>
          <div>{'{{previousStep.metadata.step_number}}'} → Step number</div>
        </div>
      </div>

      <div style={{ fontSize: 11, color: '#666', fontStyle: 'italic' }}>
        💡 Tip: Variables are case-sensitive and must match your form field names exactly.
      </div>
    </div>
  );

  // Get available agents from configuration context
  const agents = configuration?.available_agents || [];

  useEffect(() => {
    form.setFieldsValue(config);
  }, [config, form]);

  const handleValuesChange = (changedValues: any, allValues: GenerateTextWithAgentConfig) => {
    onConfigChange(allValues);
  };

  return (
    <div>
      <Title level={4}>Generate Text with Agent Configuration</Title>
      <Paragraph type="secondary">
        Configure this action to generate text using a pre-configured AI agent. The agent's 
        model, temperature, and system instructions are already set up.
      </Paragraph>

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          agent_id: agents.length > 0 ? agents[0].id : undefined,
          max_tokens: 1000,
          ...config
        }}
        onValuesChange={handleValuesChange}
      >
        <Form.Item
          name="prompt"
          label={
            <Space>
              Text Prompt
              <Popover 
                content={variableInstructions} 
                title="Template Variables" 
                trigger="click"
                placement="topLeft"
              >
                <Button 
                  type="text" 
                  size="small" 
                  icon={<QuestionCircleOutlined />}
                  style={{ color: '#1890ff' }}
                />
              </Popover>
            </Space>
          }
          rules={[{ required: true, message: 'Please enter a prompt' }]}
          extra="The prompt to send to the AI agent. Click the ? icon for template variable examples."
        >
          <TextArea
            rows={4}
            placeholder="Enter your text prompt..."
            showCount
          />
        </Form.Item>

        <Form.Item
          name="agent_id"
          label="AI Agent"
          rules={[{ required: true, message: 'Please select an agent' }]}
          extra="Select the AI agent to use for text generation"
        >
          <Select 
            placeholder="Select an AI agent"
            optionLabelProp="label"
          >
            {agents.map(agent => (
              <Option 
                key={agent.id} 
                value={agent.id}
                label={agent.name}
              >
                <div style={{ padding: '4px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <RobotOutlined style={{ color: '#1890ff' }} />
                    <span style={{ fontWeight: 'bold' }}>{agent.name}</span>
                  </div>
                  {agent.description && (
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#666', 
                      lineHeight: '1.3',
                      whiteSpace: 'normal'
                    }}>
                      {agent.description}
                    </div>
                  )}
                  <div style={{ fontSize: '11px', color: '#999', marginTop: 2 }}>
                    Uses: {agent.underlying_model} • Temp: {agent.temperature}
                  </div>
                </div>
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="max_tokens"
          label="Maximum Tokens (Optional)"
          extra="Override the agent's default token limit (1-8000). Leave empty to use agent's default."
        >
          <InputNumber
            min={1}
            max={8000}
            placeholder="1000"
            style={{ width: '100%' }}
          />
        </Form.Item>
      </Form>

      <div style={{ marginTop: 24, padding: 12, background: '#f0f9ff', border: '1px solid #bae7ff', borderRadius: 6 }}>
        <Text strong style={{ color: '#1890ff' }}>Agent-Based Configuration:</Text>
        <ul style={{ margin: '8px 0 0 0', color: '#1890ff', fontSize: 12 }}>
          <li>Model and temperature are pre-configured in the selected agent</li>
          <li>System instructions are built into the agent</li>
          <li>Only prompt and optional token limit need to be specified</li>
        </ul>
      </div>

      <div style={{ marginTop: 16, padding: 12, background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 6 }}>
        <Text strong style={{ color: '#389e0d' }}>Output Variables:</Text>
        <ul style={{ margin: '8px 0 0 0', color: '#389e0d' }}>
          <li><Text code>generated_text</Text> - The text generated by the AI agent</li>
          <li><Text code>token_count</Text> - Number of tokens used in generation</li>
          <li><Text code>agent_used</Text> - The name of the agent that was used</li>
          <li><Text code>model_used</Text> - The underlying model used by the agent</li>
          <li><Text code>finish_reason</Text> - Reason why generation stopped</li>
        </ul>
      </div>
    </div>
  );
}