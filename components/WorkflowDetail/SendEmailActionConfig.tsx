import { Form, Input, Typography, Space } from 'antd';
import { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

interface SendEmailConfig {
  to?: string;
  subject?: string;
  body?: string;
  body_type?: string;
}

interface SendEmailActionConfigProps {
  config: SendEmailConfig;
  onConfigChange: (config: SendEmailConfig) => void;
}

export default function SendEmailActionConfig({ config, onConfigChange }: SendEmailActionConfigProps) {
  const [form] = Form.useForm();

  const editor = useEditor({
    extensions: [
      StarterKit,
    ],
    content: config.body || '',
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const currentValues = form.getFieldsValue();
      const updatedConfig = {
        ...currentValues,
        body: html,
        body_type: 'html',
      };
      onConfigChange(updatedConfig);
    },
  });

  useEffect(() => {
    form.setFieldsValue(config);
    if (editor && config.body !== undefined) {
      editor.commands.setContent(config.body);
    }
  }, [config, form, editor]);

  const handleValuesChange = (changedValues: any, allValues: SendEmailConfig) => {
    const updatedConfig = {
      ...allValues,
      body: config.body, // Keep the current HTML from the editor
      body_type: 'html',
    };
    onConfigChange(updatedConfig);
  };

  return (
    <div>
      <Title level={4}>Send Email Configuration</Title>
      <Paragraph type="secondary">
        Configure this action to send emails when this workflow step is executed. 
        The email content will be sanitized on the backend for security.
      </Paragraph>

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          to: '',
          subject: '',
          body_type: 'html',
          ...config
        }}
        onValuesChange={handleValuesChange}
      >
        <Form.Item
          name="to"
          label={<Text strong>Send To</Text>}
          rules={[{ required: true, message: 'Please enter recipient email address' }]}
          extra="Email address of the recipient. You can use template variables like {{form.email}} or {{previousStep.userEmail}}"
        >
          <Input
            placeholder="user@example.com or {{form.email}}"
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="subject"
          label={<Text strong>Subject Line</Text>}
          rules={[{ required: true, message: 'Please enter email subject' }]}
          extra="Subject line for the email. Template variables are supported"
        >
          <Input
            placeholder="Welcome to our service, {{form.firstName}}!"
            size="large"
          />
        </Form.Item>

        <Form.Item
          label={<Text strong>Email Body</Text>}
          extra="Rich text content for your email. HTML will be sanitized on the backend for security."
        >
          <div style={{ 
            border: '1px solid #d9d9d9', 
            borderRadius: '6px',
            minHeight: '200px',
            padding: '12px',
            background: '#fff'
          }}>
            <div style={{
              borderBottom: '1px solid #f0f0f0',
              paddingBottom: '8px',
              marginBottom: '12px',
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap'
            }}>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleBold().run()}
                style={{
                  padding: '4px 8px',
                  border: '1px solid #d9d9d9',
                  borderRadius: '4px',
                  background: editor?.isActive('bold') ? '#1890ff' : '#fff',
                  color: editor?.isActive('bold') ? '#fff' : '#000',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
              >
                B
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                style={{
                  padding: '4px 8px',
                  border: '1px solid #d9d9d9',
                  borderRadius: '4px',
                  background: editor?.isActive('italic') ? '#1890ff' : '#fff',
                  color: editor?.isActive('italic') ? '#fff' : '#000',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontStyle: 'italic'
                }}
              >
                I
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                style={{
                  padding: '4px 8px',
                  border: '1px solid #d9d9d9',
                  borderRadius: '4px',
                  background: editor?.isActive('heading', { level: 1 }) ? '#1890ff' : '#fff',
                  color: editor?.isActive('heading', { level: 1 }) ? '#fff' : '#000',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
              >
                H1
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                style={{
                  padding: '4px 8px',
                  border: '1px solid #d9d9d9',
                  borderRadius: '4px',
                  background: editor?.isActive('heading', { level: 2 }) ? '#1890ff' : '#fff',
                  color: editor?.isActive('heading', { level: 2 }) ? '#fff' : '#000',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}
              >
                H2
              </button>
              <button
                type="button"
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                style={{
                  padding: '4px 8px',
                  border: '1px solid #d9d9d9',
                  borderRadius: '4px',
                  background: editor?.isActive('bulletList') ? '#1890ff' : '#fff',
                  color: editor?.isActive('bulletList') ? '#fff' : '#000',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                •
              </button>
            </div>
            
            <EditorContent 
              editor={editor} 
              style={{
                minHeight: '150px',
                outline: 'none',
                fontSize: '14px',
                lineHeight: '1.5'
              }}
            />
          </div>
        </Form.Item>
      </Form>

      <div style={{ marginTop: 24, padding: 12, background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 6 }}>
        <Text strong style={{ color: '#389e0d' }}>Output Variables:</Text>
        <ul style={{ margin: '8px 0 0 0', color: '#389e0d' }}>
          <li><Text code>email_sent</Text> - Boolean indicating if email was sent successfully</li>
          <li><Text code>recipient_email</Text> - The actual email address the message was sent to</li>
          <li><Text code>message_id</Text> - Unique identifier for the sent email</li>
          <li><Text code>delivery_status</Text> - Status of email delivery (sent, queued, failed)</li>
        </ul>
      </div>
    </div>
  );
}