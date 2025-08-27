import { Form, Input, Select, InputNumber, Typography, Space, Popover, Button } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { useEffect } from 'react';
import { useWorkflow } from '@/contexts/WorkflowContext';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface GenerateTextConfig {
  prompt?: string;
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

  // Get available models from the serialized workflow object
  const availableModels = workflow?.available_llm_models || [];

  useEffect(() => {
    form.setFieldsValue(config);
  }, [config, form]);

  const handleValuesChange = (changedValues: any, allValues: GenerateTextConfig) => {
    onConfigChange(allValues);
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
          model: availableModels.length > 0 ? availableModels[0].value : '',
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
                key={model.value || model.id} 
                value={model.value || model.id}
                label={model.label || model.name}
              >
                <div style={{ padding: '4px 0' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>
                    {model.label || model.name}
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
                </div>
              </Option>
            ))}
          </Select>
        </Form.Item>

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
      </Form>

      <div style={{ marginTop: 24, padding: 12, background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 6 }}>
        <Text strong style={{ color: '#389e0d' }}>Output Variables:</Text>
        <ul style={{ margin: '8px 0 0 0', color: '#389e0d' }}>
          <li><Text code>generated_text</Text> - The text generated by the AI model</li>
          <li><Text code>token_count</Text> - Number of tokens used in generation</li>
          <li><Text code>model_used</Text> - The actual model that processed the request</li>
          <li><Text code>finish_reason</Text> - Reason why generation stopped</li>
        </ul>
      </div>
    </div>
  );
}