'use client';

import { useState, useEffect } from 'react';
import { Table, message } from 'antd';
import { AccountAgentService } from '@/services/accountAgentService';
import { usePagination } from '@/hooks/usePagination';
import { getAgentColumns } from './columns';
import type { Agent } from '@/contexts/ConfigurationContext';

interface AccountAgentsTableProps {
  accountId: number;
  onViewAgent: (agent: Agent) => void;
  refreshTrigger?: number;
}

export default function AccountAgentsTable({
  accountId,
  onViewAgent,
  refreshTrigger,
}: AccountAgentsTableProps) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const pagination = usePagination({ initialPageSize: 20 });

  const fetchAgents = async () => {
    try {
      pagination.setLoading(true);
      const params = pagination.getQueryParams();
      const response = await AccountAgentService.getAccountAgents(accountId, params.page, params.limit);
      
      setAgents(response.agents);
      pagination.updateFromResponse(response);
    } catch (error) {
      console.error('Failed to fetch agents:', error);
      message.error('Failed to load agents');
    }
  };

  useEffect(() => {
    fetchAgents();
  }, [accountId, pagination.current, pagination.pageSize, refreshTrigger]);

  const handleViewAgent = (agent: Agent) => {
    onViewAgent(agent);
  };

  const handleRowClick = (record: Agent) => {
    handleViewAgent(record);
  };

  const columns = getAgentColumns(handleViewAgent);

  return (
    <Table
      columns={columns}
      dataSource={agents}
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
        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} agents`,
        onChange: pagination.setPage,
        onShowSizeChange: (current, size) => pagination.setPageSize(size),
      }}
    />
  );
}