import { Form, Input, Select, InputNumber, Typography, Space, Popover, Button, Tag, Divider } from 'antd';
import { QuestionCircleOutlined, RobotOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { useWorkflow } from '@/contexts/WorkflowContext';
import { useConfiguration } from '@/contexts/ConfigurationContext';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface GenerateTextConfig {
  prompt?: string;
  agent_id?: number;
  model?: string;
  max_tokens?: number;
  temperature?: number;
  system_message?: string;
}

interface GenerateTextActionConfigProps {
  config: GenerateTextConfig;
  onConfigChange: (config: GenerateTextConfig) => void;
}

export default function GenerateTextActionConfig({ config, onConfigChange }: GenerateTextActionConfigProps) {
  const [form] = Form.useForm();
  const { state } = useWorkflow();
  const { workflow } = state;
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

  // Get available models and agents from configuration context
  const availableModels = configuration?.available_llm_models || [];
  const agents = configuration?.available_agents || [];
  
  // We'll check agent selection inside Form.Item with shouldUpdate to avoid circular refs

  useEffect(() => {
    // When loading config, if there's an agent_id, set the agent field
    const formValues = { ...config };
    if (config.agent_id) {
      formValues.agent = config.agent_id.toString();
    }
    form.setFieldsValue(formValues);
  }, [config, form]);

  const handleValuesChange = (changedValues: any, allValues: any) => {
    // Always exclude the 'agent' field from the final config as it's UI-only
    const { agent, ...configValues } = allValues;
    
    // If agent is selected/changed, set agent_id and remove model
    if (changedValues.agent) {
      const { model, ...restValues } = configValues;
      const updatedValues = {
        ...restValues,
        agent_id: parseInt(changedValues.agent),
      };
      onConfigChange(updatedValues);
    } else if (changedValues.agent === null || changedValues.agent === undefined) {
      // Agent was cleared, remove agent_id
      const { agent_id, ...restValues } = configValues;
      onConfigChange(restValues);
    } else {
      onConfigChange(configValues);
    }
  };

  return (
    <div>
      <Title level={4}>Generate Text Configuration</Title>
      <Paragraph type="secondary">
        Configure this action to generate text using AI models. The generated text will be available 
        as output for use in subsequent workflow steps.
      </Paragraph>

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          model: availableModels.length > 0 ? availableModels[0].id : '',
          max_tokens: 1000,
          temperature: 0.7,
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
          extra="The prompt to send to the AI model. Click the ? icon for template variable examples."
        >
          <TextArea
            rows={4}
            placeholder="Enter your text prompt..."
            showCount
          />
        </Form.Item>

        {agents.length > 0 && (
          <Form.Item
            name="agent"
            label="AI Agent (Optional)"
            extra="Select a pre-configured agent with custom instructions"
          >
            <Select 
              placeholder="Select an agent (optional)"
              allowClear
              optionLabelProp="label"
            >
              {agents.map(agent => (
                <Option 
                  key={agent.id} 
                  value={agent.id.toString()}
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
        )}

        <Form.Item shouldUpdate={(prevValues, currentValues) => prevValues.agent !== currentValues.agent} noStyle>
          {({ getFieldValue }) => {
            const selectedAgent = getFieldValue('agent');
            const isAgentSelected = !!selectedAgent;
            const currentAgent = agents.find(a => a.id.toString() === selectedAgent);

            return (
              <>
                {isAgentSelected && currentAgent && (
                  <div style={{ marginBottom: 16, padding: 12, background: '#f0f9ff', border: '1px solid #bae7ff', borderRadius: 6 }}>
                    <Text strong style={{ color: '#1890ff' }}>Agent Configuration:</Text>
                    <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                      <div><strong>Uses Model:</strong> {currentAgent.underlying_model}</div>
                      <div><strong>Temperature:</strong> {currentAgent.temperature}</div>
                      <div><strong>System Instructions:</strong> Pre-configured</div>
                    </div>
                  </div>
                )}

                {!isAgentSelected && (
          <Form.Item
            name="model"
            label="AI Model"
            rules={[{ required: true, message: 'Please select a model' }]}
            extra="Choose which AI model to use for text generation"
          >
            <Select 
              placeholder="Select AI model"
              optionLabelProp="label"
            >
              {availableModels.map(model => (
                <Option 
                  key={model.id} 
                  value={model.id}
                  label={model.name}
                >
                  <div style={{ padding: '4px 0' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>
                      {model.name}
                    </div>
                    {model.description && (
                      <div style={{ 
                        fontSize: '12px', 
                        color: '#666', 
                        lineHeight: '1.3',
                        whiteSpace: 'normal'
                      }}>
                        {model.description}
                      </div>
                    )}
                    <div style={{ fontSize: '11px', color: '#999', marginTop: 2 }}>
                      Provider: {model.provider}
                    </div>
                  </div>
                </Option>
              ))}
            </Select>
          </Form.Item>
                )}

                {!isAgentSelected && (
                  <>
                    <Space.Compact style={{ width: '100%' }}>
                      <Form.Item
                        name="max_tokens"
                        label="Maximum Tokens"
                        style={{ width: '50%' }}
                        extra="Maximum number of tokens to generate (1-8000)"
                      >
                        <InputNumber
                          min={1}
                          max={8000}
                          placeholder="1000"
                          style={{ width: '100%' }}
                        />
                      </Form.Item>

                      <Form.Item
                        name="temperature"
                        label="Temperature"
                        style={{ width: '50%' }}
                        extra="Controls randomness (0.0 = deterministic, 2.0 = very random)"
                      >
                        <InputNumber
                          min={0}
                          max={2}
                          step={0.1}
                          placeholder="0.7"
                          style={{ width: '100%' }}
                        />
                      </Form.Item>
                    </Space.Compact>

                    <Form.Item
                      name="system_message"
                      label={
                        <Space>
                          System Message
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
                      extra="Optional system message to guide the AI's behavior and tone. Template variables are supported."
                    >
                      <TextArea
                        rows={2}
                        placeholder="You are a helpful assistant that..."
                      />
                    </Form.Item>
                  </>
                )}
              </>
            );
          }}
        </Form.Item>

        <Form.Item shouldUpdate={(prevValues, currentValues) => prevValues.agent !== currentValues.agent} noStyle>
          {({ getFieldValue }) => {
            const selectedAgent = getFieldValue('agent');
            const isAgentSelected = !!selectedAgent;

            return (
              <div style={{ marginTop: 24, padding: 12, background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 6 }}>
                <Text strong style={{ color: '#389e0d' }}>Output Variables:</Text>
                <ul style={{ margin: '8px 0 0 0', color: '#389e0d' }}>
                  <li><Text code>generated_text</Text> - The text generated by the AI model</li>
                  <li><Text code>token_count</Text> - Number of tokens used in generation</li>
                  <li><Text code>model_used</Text> - The actual underlying model that processed the request</li>
                  <li><Text code>provider_used</Text> - The provider of the model used</li>
                  {isAgentSelected && (
                    <li><Text code>agent_used</Text> - The name of the agent that was used</li>
                  )}
                  <li><Text code>success</Text> - Whether the generation was successful</li>
                </ul>
              </div>
            );
          }}
        </Form.Item>
      </Form>
    </div>
  );
}