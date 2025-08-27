import { useState, useEffect } from 'react';
import { Drawer, Typography, Button, Divider, Spin, message } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { api } from '@/lib/api';
import { WorkflowRun } from './types';
import RunHistoryList from './RunHistoryList';
import RunInputsSection from './RunInputsSection';
import RunHistoryTimeline from './RunHistoryTimeline';

const { Title } = Typography;

interface RunHistoryDrawerProps {
  open: boolean;
  onClose: () => void;
  workflowId: string;
}

export default function RunHistoryDrawer({ open, onClose, workflowId }: RunHistoryDrawerProps) {
  const [runs, setRuns] = useState<WorkflowRun[]>([]);
  const [selectedRun, setSelectedRun] = useState<WorkflowRun | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && workflowId) {
      fetchRuns();
    }
  }, [open, workflowId]);

  const fetchRuns = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/workflows/${workflowId}/runs`);
      setRuns(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch workflow runs:', error);
      message.error('Failed to load workflow runs');
      setRuns([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRun = (run: WorkflowRun) => {
    setSelectedRun(run);
  };

  const handleBackToList = () => {
    setSelectedRun(null);
  };

  const handleClose = () => {
    setSelectedRun(null);
    onClose();
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: 200,
          }}
        >
          <Spin size='large' />
        </div>
      );
    }

    if (selectedRun) {
      return (
        <div>
          <div style={{ marginBottom: 16 }}>
            <Button type='text' icon={<ArrowLeftOutlined />} onClick={handleBackToList} style={{ marginBottom: 8 }}>
              Back to Runs
            </Button>
            <Title level={4} style={{ margin: 0 }}>
              Run #{selectedRun.id} Details
            </Title>
          </div>

          <RunInputsSection run={selectedRun} />

          <Divider />

          <RunHistoryTimeline steps={selectedRun.steps} />
        </div>
      );
    }

    return <RunHistoryList runs={runs} onSelectRun={handleSelectRun} />;
  };

  return (
    <Drawer
      title={selectedRun ? `Run #${selectedRun.id} - ${selectedRun.workflow_name}` : 'Workflow Run History'}
      placement='right'
      width={600}
      open={open}
      onClose={handleClose}
      destroyOnClose
    >
      {renderContent()}
    </Drawer>
  );
}
