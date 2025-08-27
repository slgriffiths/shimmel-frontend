import { List, Typography, Tag } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import { WorkflowRun } from './types';

const { Text } = Typography;

interface RunHistoryListProps {
  runs: WorkflowRun[];
  onSelectRun: (run: WorkflowRun) => void;
}

export default function RunHistoryList({ runs, onSelectRun }: RunHistoryListProps) {
  const getStatusIcon = (status: WorkflowRun['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 16 }} />;
      case 'failed':
        return <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: 16 }} />;
      case 'running':
        return <LoadingOutlined style={{ color: '#1890ff', fontSize: 16 }} />;
      case 'pending':
      default:
        return <ClockCircleOutlined style={{ color: '#faad14', fontSize: 16 }} />;
    }
  };

  const getStatusTag = (status: WorkflowRun['status']) => {
    const statusConfig = {
      completed: { color: 'success', text: 'Completed' },
      failed: { color: 'error', text: 'Failed' },
      running: { color: 'processing', text: 'Running' },
      pending: { color: 'warning', text: 'Pending' },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  };

  return (
    <List
      dataSource={runs}
      renderItem={(run) => {
        const { date, time } = formatDate(run.created_at);

        return (
          <List.Item
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid #f0f0f0',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#fafafa';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            onClick={() => onSelectRun(run)}
          >
            <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {getStatusIcon(run.status)}
                <div>
                  <div style={{ marginBottom: 4 }}>
                    <Text strong>Run #{run.id}</Text>
                    <Text type='secondary' style={{ marginLeft: 8, fontSize: 12 }}>
                      {run.steps_count} steps
                    </Text>
                  </div>
                  <div>
                    <Text style={{ fontSize: 12, color: '#666' }}>
                      {date} at {time}
                    </Text>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {getStatusTag(run.status)}
                {run.progress_percentage > 0 && (
                  <Text style={{ fontSize: 11, color: '#666' }}>{run.progress_percentage}%</Text>
                )}
              </div>
            </div>
          </List.Item>
        );
      }}
      locale={{
        emptyText: 'No previous runs found',
      }}
    />
  );
}
