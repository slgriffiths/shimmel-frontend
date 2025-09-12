'use client';

import { useState, useEffect } from 'react';
import { Table, message } from 'antd';
import { WorkflowService } from '@/services/workflowService';
import { usePagination } from '@/hooks/usePagination';
import { getWorkflowColumns } from './columns';
import type { Workflow } from '@/types/workflow';

interface AccountWorkflowsTableProps {
  accountId: number;
  onViewWorkflow: (workflow: Workflow) => void;
  refreshTrigger?: number;
}

export default function AccountWorkflowsTable({
  accountId,
  onViewWorkflow,
  refreshTrigger,
}: AccountWorkflowsTableProps) {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const pagination = usePagination({ initialPageSize: 20 });

  const fetchWorkflows = async () => {
    try {
      pagination.setLoading(true);
      const params = pagination.getQueryParams();
      const response = await WorkflowService.getAccountWorkflows(accountId, params.page, params.limit);
      
      setWorkflows(response.workflows);
      pagination.updateFromResponse(response);
    } catch (error) {
      console.error('Failed to fetch workflows:', error);
      message.error('Failed to load workflows');
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, [accountId, pagination.current, pagination.pageSize, refreshTrigger]);

  const handleViewWorkflow = (workflow: Workflow) => {
    onViewWorkflow(workflow);
  };

  const handleRowClick = (record: Workflow) => {
    handleViewWorkflow(record);
  };

  const columns = getWorkflowColumns(handleViewWorkflow);

  return (
    <Table
      columns={columns}
      dataSource={workflows}
      rowKey="id"
      loading={pagination.loading}
      onRow={(record) => ({
        onClick: () => handleRowClick(record),
        style: { cursor: 'pointer' }
      })}
      pagination={{
        current: pagination.current,
        pageSize: pagination.pageSize,
        total: pagination.total,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} workflows`,
        onChange: pagination.setPage,
        onShowSizeChange: (current, size) => pagination.setPageSize(size),
      }}
    />
  );
}