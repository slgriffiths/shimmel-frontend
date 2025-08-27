import { Collapse, Typography } from 'antd';
import { FormOutlined } from '@ant-design/icons';
import { WorkflowRun } from './types';

const { Title, Text } = Typography;
const { Panel } = Collapse;

interface RunInputsSectionProps {
  run: WorkflowRun;
}

export default function RunInputsSection({ run }: RunInputsSectionProps) {
  const { input_data } = run;

  if (!input_data?.trigger) {
    return (
      <div>
        <Title level={5}>Trigger Inputs</Title>
        <Text type='secondary'>No input data available</Text>
      </div>
    );
  }

  const { trigger } = input_data;

  // Handle Form Trigger inputs
  if (trigger.type === 'form' && trigger.data) {
    const formFields = trigger.config?.fields || [];

    return (
      <div>
        <Title level={5} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FormOutlined />
          Form Trigger Inputs
        </Title>

        <Collapse ghost>
          {Object.entries(trigger.data).map(([fieldName, fieldValue]) => {
            const fieldConfig = formFields.find((field) => field.name === fieldName);
            const displayLabel = fieldConfig?.label || fieldName;

            return (
              <Panel
                header={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text strong>{displayLabel}</Text>
                    <Text code style={{ fontSize: 11 }}>
                      {fieldName}
                    </Text>
                  </div>
                }
                key={fieldName}
              >
                <div style={{ padding: '8px 16px' }}>
                  <Text strong>Value: </Text>
                  <div
                    style={{
                      marginTop: 4,
                      padding: 8,
                      backgroundColor: '#f6f8fa',
                      borderRadius: 4,
                      border: '1px solid #e1e4e8',
                    }}
                  >
                    <Text>{String(fieldValue)}</Text>
                  </div>
                  {fieldConfig && (
                    <div style={{ marginTop: 8 }}>
                      <Text type='secondary' style={{ fontSize: 12 }}>
                        Type: {fieldConfig.type} | Required: {fieldConfig.required ? 'Yes' : 'No'}
                      </Text>
                    </div>
                  )}
                </div>
              </Panel>
            );
          })}
        </Collapse>
      </div>
    );
  }

  // Handle other trigger types
  return (
    <div>
      <Title level={5}>Trigger Inputs</Title>
      <div
        style={{
          padding: 12,
          backgroundColor: '#f6f8fa',
          borderRadius: 4,
          border: '1px solid #e1e4e8',
        }}
      >
        <Text strong>Trigger Type: </Text>
        <Text code>{trigger.type}</Text>

        {trigger.data && (
          <div style={{ marginTop: 8 }}>
            <Text strong>Data: </Text>
            <pre
              style={{
                fontSize: 12,
                margin: '4px 0 0 0',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {JSON.stringify(trigger.data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
