'use client';

import { useEffect, useState } from 'react';
import { Table, Typography, message as antdMessage, Button, Modal, Spin } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import styles from './Workflows.module.scss';
import { api } from '@/lib/api';
import { workflowColumns } from './columns';
import { generateWorkflowName } from '@/app/utils/animalNames';
import { useRouter } from 'next/navigation';

const { Title } = Typography;

interface Workflow {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  steps_count?: number;
  status?: string;
}

export default function Workflows() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        const { data } = await api.get('/workflows');
        setWorkflows(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load workflows:', err);
        antdMessage.error('Error loading workflows.');
      } finally {
        setLoading(false);
      }
    };
    fetchWorkflows();
  }, []);

  const handleCreateWorkflow = async () => {
    setCreating(true);
    const startTime = Date.now();
    
    try {
      const workflowName = generateWorkflowName();
      const { data } = await api.post('/workflows', {
        workflow: {
          name: workflowName,
          description: `A new workflow created automatically`
        }
      });
      
      // Ensure minimum 3 second delay
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, 3000 - elapsedTime);
      
      setTimeout(() => {
        // Navigate to the new workflow detail page
        router.push(`/workflows/${data.id}`);
        antdMessage.success(`Created "${workflowName}" successfully!`);
        setCreating(false);
      }, remainingTime);
      
    } catch (err) {
      console.error('Failed to create workflow:', err);
      antdMessage.error('Error creating workflow.');
      setCreating(false);
    }
  };

  return (
    <div className={styles.workflows}>
      <div className={styles.header}>
        <Title level={2}>Workflows</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={handleCreateWorkflow}
          loading={creating}
        >
          Create Workflow
        </Button>
      </div>
      
      <Table
        columns={workflowColumns}
        dataSource={workflows}
        loading={loading}
        rowKey="id"
        pagination={{
          pageSize: 20,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} workflows`,
        }}
        className={styles.workflowsTable}
      />
      
      <Modal
        title="Creating Workflow"
        open={creating}
        footer={null}
        closable={false}
        centered
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <Spin size="large" />
          <p style={{ marginTop: '16px', marginBottom: '0' }}>
            We are creating your workflow. This may take a minute...
          </p>
        </div>
      </Modal>
    </div>
  );
}