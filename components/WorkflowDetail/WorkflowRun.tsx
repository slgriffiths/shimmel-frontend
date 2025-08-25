import { useState, useEffect } from 'react';
import { Typography, Button, Form, Input, Select, InputNumber, DatePicker, Upload, Checkbox, Radio, Card, Steps, Collapse, Alert, Spin, Progress } from 'antd';
import { PlayCircleOutlined, CheckCircleOutlined, ExclamationCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import { useWorkflow } from '@/contexts/WorkflowContext';
import { api } from '@/lib/api';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface WorkflowRunProps {
  workflowId: string;
}

interface RunStep {
  step_number: number;
  action_name: string;
  action_type: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  started_at?: string;
  completed_at?: string;
  duration?: number;
  error_message?: string;
}

interface WorkflowRunData {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  workflow_id: number;
  workflow_name: string;
  steps_count: number;
  current_step?: number;
  total_steps: number;
  progress_percentage: number;
  input_data: Record<string, any>;
  steps: RunStep[];
}

export default function WorkflowRun({ workflowId }: WorkflowRunProps) {
  const { state } = useWorkflow();
  const { workflow } = state;
  const [form] = Form.useForm();
  const [runData, setRunData] = useState<WorkflowRunData | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  // Get the first trigger (assuming one trigger per workflow for now)
  const trigger = workflow?.triggers?.[0];

  useEffect(() => {
    // Cleanup polling on unmount
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  const startPolling = (runId: string) => {
    const interval = setInterval(async () => {
      try {
        const { data } = await api.get(`/workflows/${workflowId}/runs/${runId}/status`);
        setRunData(data);
        
        // Stop polling if run is complete or failed
        if (data.status === 'completed' || data.status === 'failed') {
          clearInterval(interval);
          setPollingInterval(null);
          setIsRunning(false);
        }
      } catch (error) {
        console.error('Error polling run status:', error);
        clearInterval(interval);
        setPollingInterval(null);
        setIsRunning(false);
      }
    }, 5000);
    
    setPollingInterval(interval);
  };

  const handleRunWorkflow = async () => {
    if (!trigger) return;
    
    try {
      setIsRunning(true);
      
      // Get form values
      const formValues = form.getFieldsValue();
      
      // Submit the run request with correct payload structure
      const { data } = await api.post(`/workflows/${workflowId}/run`, {
        input_data: formValues
      });
      
      // Set initial run data
      setRunData(data);
      
      // Start polling for updates
      startPolling(data.id);
      
    } catch (error) {
      console.error('Error running workflow:', error);
      setIsRunning(false);
    }
  };

  const renderFormField = (field: any) => {
    const commonProps = {
      name: field.name,
      label: field.label,
      rules: field.required ? [{ required: true, message: `${field.label} is required` }] : [],
      extra: field.help_text
    };

    switch (field.field_type) {
      case 'text':
        return (
          <Form.Item key={field.name} {...commonProps}>
            <Input placeholder={field.placeholder} />
          </Form.Item>
        );
      
      case 'textarea':
        return (
          <Form.Item key={field.name} {...commonProps}>
            <TextArea rows={4} placeholder={field.placeholder} />
          </Form.Item>
        );
      
      case 'number':
        return (
          <Form.Item key={field.name} {...commonProps}>
            <InputNumber 
              placeholder={field.placeholder} 
              style={{ width: '100%' }}
              min={field.validation_rules?.min}
              max={field.validation_rules?.max}
            />
          </Form.Item>
        );
      
      case 'email':
        return (
          <Form.Item key={field.name} {...commonProps} rules={[
            ...(commonProps.rules || []),
            { type: 'email', message: 'Please enter a valid email address' }
          ]}>
            <Input type="email" placeholder={field.placeholder} />
          </Form.Item>
        );
      
      case 'select':
        return (
          <Form.Item key={field.name} {...commonProps}>
            <Select placeholder={field.placeholder}>
              {field.options?.values?.map((value: string, index: number) => (
                <Option key={index} value={value}>{value}</Option>
              ))}
            </Select>
          </Form.Item>
        );
      
      case 'checkbox':
        return (
          <Form.Item key={field.name} {...commonProps} valuePropName="checked">
            <Checkbox>{field.label}</Checkbox>
          </Form.Item>
        );
      
      case 'radio':
        return (
          <Form.Item key={field.name} {...commonProps}>
            <Radio.Group>
              {field.options?.values?.map((value: string, index: number) => (
                <Radio key={index} value={value}>{value}</Radio>
              ))}
            </Radio.Group>
          </Form.Item>
        );
      
      case 'date':
        return (
          <Form.Item key={field.name} {...commonProps}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        );
      
      default:
        return (
          <Form.Item key={field.name} {...commonProps}>
            <Input placeholder={field.placeholder} />
          </Form.Item>
        );
    }
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <LoadingOutlined />;
      case 'completed':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'failed':
        return <ExclamationCircleOutlined style={{ color: '#f5222d' }} />;
      default:
        return null;
    }
  };

  if (!trigger) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Alert 
          message="No Trigger Found" 
          description="This workflow doesn't have a trigger configured. Please add a trigger in the Workflow tab first."
          type="warning" 
          showIcon 
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Title level={3}>Run Workflow</Title>
      <Paragraph type="secondary">
        Execute this workflow with the configuration below. The workflow will process through each step and show you the results.
      </Paragraph>

      {!runData ? (
        // Show trigger form if no run has started
        <Card title="Trigger Configuration" style={{ marginBottom: '24px' }}>
          {trigger.type === 'Workflow::Trigger::Form' ? (
            <Form form={form} layout="vertical" onFinish={handleRunWorkflow}>
              {trigger.form_fields?.map(renderFormField)}
              
              <Form.Item style={{ marginTop: '24px' }}>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  icon={<PlayCircleOutlined />}
                  size="large"
                  loading={isRunning}
                >
                  Run Workflow
                </Button>
              </Form.Item>
            </Form>
          ) : (
            <Alert 
              message="Trigger Type Not Supported" 
              description={`The trigger type "${trigger.type}" is not yet supported in the run interface.`}
              type="info" 
              showIcon 
            />
          )}
        </Card>
      ) : (
        // Show run progress if run has started
        <div>
          <Card title={`Executing: ${runData.workflow_name}`} style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <Text strong>Status: </Text>
              <Text style={{ marginLeft: '8px' }}>
                {runData.status === 'running' && <><Spin size="small" style={{ marginRight: '8px' }} />Running...</>}
                {runData.status === 'completed' && <><CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />Completed</>}
                {runData.status === 'failed' && <><ExclamationCircleOutlined style={{ color: '#f5222d', marginRight: '8px' }} />Failed</>}
                {runData.status === 'pending' && <><LoadingOutlined style={{ marginRight: '8px' }} />Starting...</>}
              </Text>
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <Text strong>Progress: </Text>
              <Text>{runData.current_step || 0} of {runData.total_steps} steps</Text>
              <Progress 
                percent={runData.progress_percentage} 
                status={runData.status === 'failed' ? 'exception' : runData.status === 'completed' ? 'success' : 'active'}
                style={{ marginTop: '8px' }}
              />
            </div>
            
            <Text type="secondary">
              Run ID: {runData.id} • Total Steps: {runData.total_steps}
            </Text>
          </Card>

          <Card title="Execution Steps">
            <Steps direction="vertical" current={runData.current_step ? runData.current_step - 1 : -1}>
              {runData.steps?.map((step, index) => (
                <Steps.Step
                  key={step.step_number}
                  title={`${step.step_number}. ${step.action_name}`}
                  description={step.action_type}
                  status={step.status === 'failed' ? 'error' : step.status === 'completed' ? 'finish' : step.status === 'running' ? 'process' : 'wait'}
                  icon={getStepIcon(step.status)}
                  subTitle={
                    step.completed_at 
                      ? `Completed: ${new Date(step.completed_at).toLocaleString()}${step.duration ? ` (${step.duration}ms)` : ''}` 
                      : step.started_at 
                      ? `Started: ${new Date(step.started_at).toLocaleString()}`
                      : undefined
                  }
                />
              ))}
            </Steps>

            {/* Show error details for failed steps */}
            {runData.steps?.some(step => step.status === 'failed') && (
              <div style={{ marginTop: '24px' }}>
                <Title level={4}>Error Details</Title>
                <Collapse>
                  {runData.steps
                    .filter(step => step.status === 'failed')
                    .map(step => (
                      <Collapse.Panel 
                        key={step.step_number} 
                        header={`Step ${step.step_number}: ${step.action_name} - Error`}
                        extra={<ExclamationCircleOutlined style={{ color: '#f5222d' }} />}
                      >
                        <Alert
                          message="Step Failed"
                          description={step.error_message || 'An unknown error occurred'}
                          type="error"
                          showIcon
                        />
                        {step.duration && (
                          <Text type="secondary" style={{ display: 'block', marginTop: '8px' }}>
                            Duration: {step.duration}ms
                          </Text>
                        )}
                      </Collapse.Panel>
                    ))}
                </Collapse>
              </div>
            )}

            {/* Button to start a new run */}
            <div style={{ marginTop: '24px', textAlign: 'center' }}>
              <Button 
                type="default" 
                onClick={() => {
                  setRunData(null);
                  form.resetFields();
                }}
              >
                Start New Run
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}