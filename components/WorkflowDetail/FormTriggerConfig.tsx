import { useState } from 'react';
import { Button, List, Typography, Empty, Tag, Modal, Space, Card } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { FormField, FormFieldType, FORM_FIELD_TYPES, createNewField, getFieldTypeDefinition } from './formFieldTypes';
import FormFieldEditor from './FormFieldEditor';

const { Title, Text, Paragraph } = Typography;

interface FormTriggerConfigProps {
  fields: FormField[];
  onFieldsChange: (fields: FormField[]) => void;
}

export default function FormTriggerConfig({ fields, onFieldsChange }: FormTriggerConfigProps) {
  const [editingField, setEditingField] = useState<FormField | null>(null);
  const [showTypeSelector, setShowTypeSelector] = useState(false);

  const handleAddField = (type: FormFieldType) => {
    const newField = createNewField(type, fields.length);
    setEditingField(newField);
    setShowTypeSelector(false);
  };

  const handleEditField = (field: FormField) => {
    setEditingField(field);
  };

  const handleSaveField = (field: FormField) => {
    const updatedFields = fields.some(f => f.id === field.id)
      ? fields.map(f => f.id === field.id ? field : f)
      : [...fields, field];
    
    // Re-sort by position
    updatedFields.sort((a, b) => a.position - b.position);
    
    onFieldsChange(updatedFields);
    setEditingField(null);
  };

  const handleDeleteField = (fieldId: string) => {
    Modal.confirm({
      title: 'Delete Field',
      content: 'Are you sure you want to delete this form field?',
      okText: 'Delete',
      okType: 'danger',
      onOk: () => {
        const updatedFields = fields.filter(f => f.id !== fieldId);
        // Re-index positions
        updatedFields.forEach((field, index) => {
          field.position = index;
        });
        onFieldsChange(updatedFields);
        setEditingField(null);
      }
    });
  };

  const handleCancelEdit = () => {
    setEditingField(null);
  };

  // If editing a field, show the editor
  if (editingField) {
    return (
      <FormFieldEditor
        field={editingField}
        onSave={handleSaveField}
        onCancel={handleCancelEdit}
        onDelete={handleDeleteField}
      />
    );
  }

  return (
    <div>
      <Title level={4}>Form Fields Configuration</Title>
      <Paragraph type="secondary" style={{ marginBottom: 24 }}>
        Add input fields to collect data from users when they trigger this workflow. 
        Click on a field to edit its settings, or use the + button to add new fields.
      </Paragraph>

      {fields.length === 0 ? (
        <Empty
          description="No form fields yet"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setShowTypeSelector(true)}
          >
            Add First Field
          </Button>
        </Empty>
      ) : (
        <>
          <List
            dataSource={fields}
            renderItem={(field) => (
              <List.Item
                actions={[
                  <Button 
                    key="edit"
                    type="text" 
                    icon={<EditOutlined />} 
                    onClick={() => handleEditField(field)}
                  >
                    Edit
                  </Button>
                ]}
              >
                <List.Item.Meta
                  title={
                    <Space>
                      <Text strong>{field.label}</Text>
                      {field.required && <Tag color="red" size="small">Required</Tag>}
                      <Tag color="blue">{getFieldTypeDefinition(field.type)?.name}</Tag>
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size={4}>
                      <Text code style={{ fontSize: '12px' }}>
                        {field.name}
                      </Text>
                      {field.description && (
                        <Text type="secondary">{field.description}</Text>
                      )}
                      {field.placeholder && (
                        <Text type="secondary" style={{ fontSize: '12px', fontStyle: 'italic' }}>
                          Placeholder: "{field.placeholder}"
                        </Text>
                      )}
                      {field.options && field.options.length > 0 && (
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          Options: {field.options.map(opt => opt.label).join(', ')}
                        </Text>
                      )}
                    </Space>
                  }
                />
              </List.Item>
            )}
            style={{ marginBottom: 16 }}
          />
          
          <Button 
            type="dashed" 
            icon={<PlusOutlined />}
            onClick={() => setShowTypeSelector(true)}
            block
            size="large"
          >
            Add Field
          </Button>
        </>
      )}

      <Modal
        title="Select Field Type"
        open={showTypeSelector}
        onCancel={() => setShowTypeSelector(false)}
        footer={null}
        width={600}
      >
        <Paragraph type="secondary" style={{ marginBottom: 16 }}>
          Choose the type of input field you want to add to your form.
        </Paragraph>
        
        <List
          grid={{ gutter: 16, xs: 1, sm: 2 }}
          dataSource={FORM_FIELD_TYPES}
          renderItem={(type) => (
            <List.Item>
              <Card
                hoverable
                onClick={() => handleAddField(type.type)}
                size="small"
              >
                <Card.Meta
                  title={type.name}
                  description={type.description}
                />
              </Card>
            </List.Item>
          )}
        />
      </Modal>
    </div>
  );
}