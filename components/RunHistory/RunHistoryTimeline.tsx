import { Timeline, Typography, Collapse, Tag } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import { RunStep } from './types';

const { Text, Paragraph } = Typography;
const { Panel } = Collapse;

interface RunHistoryTimelineProps {
  steps: RunStep[];
}

export default function RunHistoryTimeline({ steps }: RunHistoryTimelineProps) {
  const getStepIcon = (status: RunStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'failed':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      case 'running':
        return <LoadingOutlined style={{ color: '#1890ff' }} />;
      case 'pending':
      default:
        return <ClockCircleOutlined style={{ color: '#d9d9d9' }} />;
    }
  };

  const getStepColor = (status: RunStep['status']) => {
    switch (status) {
      case 'completed':
        return '#52c41a';
      case 'failed':
        return '#ff4d4f';
      case 'running':
        return '#1890ff';
      case 'pending':
      default:
        return '#d9d9d9';
    }
  };

  const formatDuration = (duration?: number) => {
    if (!duration) return 'N/A';
    if (duration < 1000) return `${duration}ms`;
    return `${(duration / 1000).toFixed(2)}s`;
  };

  const timelineItems = steps.map((step) => ({
    dot: getStepIcon(step.status),
    color: getStepColor(step.status),
    children: (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <Text strong>{step.action_name}</Text>
          <Tag color={step.status === 'completed' ? 'green' : step.status === 'failed' ? 'red' : 'default'}>
            {step.status}
          </Tag>
          {step.duration && (
            <Text type='secondary' style={{ fontSize: 12 }}>
              {formatDuration(step.duration)}
            </Text>
          )}
        </div>

        <Collapse ghost size='small'>
          <Panel header={<Text type='secondary'>View Details</Text>} key={step.step_number}>
            <div style={{ padding: '8px 0' }}>
              <div style={{ marginBottom: 8 }}>
                <Text strong>Action Type: </Text>
                <Text code>{step.action_type}</Text>
              </div>

              {step.started_at && (
                <div style={{ marginBottom: 8 }}>
                  <Text strong>Started: </Text>
                  <Text>{new Date(step.started_at).toLocaleString()}</Text>
                </div>
              )}

              {step.completed_at && (
                <div style={{ marginBottom: 8 }}>
                  <Text strong>Completed: </Text>
                  <Text>{new Date(step.completed_at).toLocaleString()}</Text>
                </div>
              )}

              {step.error_message && (
                <div style={{ marginBottom: 8 }}>
                  <Text strong>Error: </Text>
                  <Paragraph type='danger' style={{ margin: 0 }}>
                    {step.error_message}
                  </Paragraph>
                </div>
              )}

              {step.output_data && (
                <div>
                  <Text strong>Output: </Text>
                  <Paragraph
                    code
                    style={{
                      backgroundColor: '#f6f8fa',
                      padding: 8,
                      borderRadius: 4,
                      margin: '4px 0 0 0',
                      maxHeight: 200,
                      overflow: 'auto',
                    }}
                  >
                    {typeof step.output_data === 'string'
                      ? step.output_data
                      : JSON.stringify(step.output_data, null, 2)}
                  </Paragraph>
                </div>
              )}
            </div>
          </Panel>
        </Collapse>
      </div>
    ),
  }));

  return (
    <div>
      <Typography.Title level={5} style={{ marginBottom: 16 }}>
        Execution Steps
      </Typography.Title>
      <Timeline items={timelineItems} />
    </div>
  );
}
