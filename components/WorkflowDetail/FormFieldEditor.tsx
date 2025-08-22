import { useState } from 'react';
import { Form, Input, Select, Switch, Button, InputNumber, Space, Typography, Divider } from 'antd';
import { ArrowLeftOutlined, DeleteOutlined, PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { FormField, FormFieldType, FORM_FIELD_TYPES, getFieldTypeDefinition } from './formFieldTypes';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface FormFieldEditorProps {
  field: FormField;
  onSave: (field: FormField) => void;
  onCancel: () => void;
  onDelete: (fieldId: string) => void;
}

export default function FormFieldEditor({ field, onSave, onCancel, onDelete }: FormFieldEditorProps) {
  const [form] = Form.useForm();
  const [selectedType, setSelectedType] = useState<FormFieldType>(field.type);

  const handleTypeChange = (type: FormFieldType) => {
    setSelectedType(type);
    const definition = getFieldTypeDefinition(type);
    if (definition) {
      // Update form with default config for new type
      form.setFieldsValue({
        ...definition.defaultConfig,
        type
      });
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const updatedField: FormField = {
        ...field,
        ...values,
        type: selectedType,
        // Ensure options is properly formatted
        options: values.options?.map((opt: any) => ({
          label: opt.label || opt.value,
          value: opt.value
        })) || field.options
      };
      onSave(updatedField);
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  const typeDefinition = getFieldTypeDefinition(selectedType);
  const showOptions = typeDefinition?.hasOptions;

  return (
    <div>
      <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />} 
          onClick={onCancel}
        >
          Back to Fields
        </Button>
        <Button 
          type="text" 
          danger 
          icon={<DeleteOutlined />}
          onClick={() => onDelete(field.id)}
        >
          Delete Field
        </Button>
      </Space>

      <Title level={4}>Edit Form Field</Title>

      <Form
        form={form}
        layout="vertical"
        initialValues={field}
        onFinish={handleSave}
      >
        <Form.Item 
          name="type" 
          label="Field Type"
          rules={[{ required: true, message: 'Please select a field type' }]}
        >
          <Select 
            value={selectedType}
            onChange={handleTypeChange}
            placeholder="Select field type"
          >
            {FORM_FIELD_TYPES.map(type => (
              <Option key={type.type} value={type.type}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{type.name}</span>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {type.description}
                  </Text>
                </div>
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item 
          name="name" 
          label="Field Name"
          rules={[
            { required: true, message: 'Please enter a field name' },
            { pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/, message: 'Field name must start with a letter and contain only letters, numbers, and underscores' }
          ]}
        >
          <Input placeholder="e.g. user_email, full_name" />
        </Form.Item>

        <Form.Item 
          name="label" 
          label="Field Label"
          rules={[{ required: true, message: 'Please enter a field label' }]}
        >
          <Input placeholder="Label shown to users" />
        </Form.Item>

        <Form.Item 
          name="description" 
          label="Help Text"
        >
          <TextArea 
            rows={2} 
            placeholder="Optional help text to guide users" 
          />
        </Form.Item>

        <Form.Item 
          name="placeholder" 
          label="Placeholder Text"
        >
          <Input placeholder="Placeholder text shown in empty field" />
        </Form.Item>

        <Form.Item 
          name="required" 
          label="Required Field"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        {selectedType === 'number' && (
          <>
            <Divider>Number Validation</Divider>
            <Space.Compact style={{ width: '100%' }}>
              <Form.Item 
                name={['validation_rules', 'min']} 
                label="Minimum Value"
                style={{ width: '50%' }}
              >
                <InputNumber placeholder="Min" style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item 
                name={['validation_rules', 'max']} 
                label="Maximum Value"
                style={{ width: '50%' }}
              >
                <InputNumber placeholder="Max" style={{ width: '100%' }} />
              </Form.Item>
            </Space.Compact>
            <Form.Item 
              name={['validation_rules', 'step']} 
              label="Step"
            >
              <InputNumber 
                placeholder="Step increment (e.g., 0.1 for decimals)" 
                step={0.1}
                min={0.01}
              />
            </Form.Item>
          </>
        )}

        {(selectedType === 'text' || selectedType === 'textarea') && (
          <>
            <Divider>Text Validation</Divider>
            <Space.Compact style={{ width: '100%' }}>
              <Form.Item 
                name={['validation_rules', 'minLength']} 
                label="Minimum Length"
                style={{ width: '50%' }}
              >
                <InputNumber placeholder="Min length" style={{ width: '100%' }} min={0} />
              </Form.Item>
              <Form.Item 
                name={['validation_rules', 'maxLength']} 
                label="Maximum Length"
                style={{ width: '50%' }}
              >
                <InputNumber placeholder="Max length" style={{ width: '100%' }} min={1} />
              </Form.Item>
            </Space.Compact>
          </>
        )}

        {showOptions && (
          <>
            <Divider>Options</Divider>
            <Form.List name="options">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                      <Form.Item
                        {...restField}
                        name={[name, 'label']}
                        rules={[{ required: true, message: 'Option label required' }]}
                        style={{ flex: 1 }}
                      >
                        <Input placeholder="Option label" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'value']}
                        rules={[{ required: true, message: 'Option value required' }]}
                        style={{ flex: 1 }}
                      >
                        <Input placeholder="Option value" />
                      </Form.Item>
                      <MinusCircleOutlined onClick={() => remove(name)} />
                    </Space>
                  ))}
                  <Form.Item>
                    <Button 
                      type="dashed" 
                      onClick={() => add()} 
                      block 
                      icon={<PlusOutlined />}
                    >
                      Add Option
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </>
        )}

        <Form.Item style={{ marginTop: 24 }}>
          <Space>
            <Button onClick={onCancel}>Cancel</Button>
            <Button type="primary" onClick={handleSave}>
              Save Field
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
}