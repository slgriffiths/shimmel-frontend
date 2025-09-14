'use client';

import { useState, useEffect } from 'react';
import { Typography, Button, Table, Tag, message, Space } from 'antd';
import { PlusOutlined, EyeOutlined } from '@ant-design/icons';
import { SupportTicketService } from '@/services/supportTicketService';
import { usePagination } from '@/hooks/usePagination';
import { formatTimeAgo } from '@/utils/dateUtils';
import CreateSupportTicketDrawer from '@/components/Support/CreateSupportTicketDrawer';
import SupportTicketDetailsDrawer from '@/components/Support/SupportTicketDetailsDrawer';
import type { SupportTicket } from '@/types/supportTicket';

const { Title, Text } = Typography;

export default function SupportPage() {
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [detailsDrawerOpen, setDetailsDrawerOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const pagination = usePagination({ initialPageSize: 20 });

  useEffect(() => {
    fetchSupportTickets();
  }, [pagination.current, pagination.pageSize, refreshTrigger]);

  const fetchSupportTickets = async () => {
    try {
      pagination.setLoading(true);
      const params = pagination.getQueryParams();
      const response = await SupportTicketService.getSupportTickets(params.page, params.limit);
      
      setSupportTickets(response.support_tickets);
      pagination.updateFromResponse(response);
    } catch (error) {
      console.error('Failed to fetch support tickets:', error);
      message.error('Failed to load support tickets');
    }
  };

  const handleCreateTicket = () => {
    setCreateDrawerOpen(true);
  };

  const handleViewTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setDetailsDrawerOpen(true);
  };

  const handleCreateSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
    setCreateDrawerOpen(false);
  };

  const handleCloseCreateDrawer = () => {
    setCreateDrawerOpen(false);
  };

  const handleCloseDetailsDrawer = () => {
    setDetailsDrawerOpen(false);
    setSelectedTicket(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'blue';
      case 'completed': return 'orange';
      case 'closed': return 'green';
      default: return 'default';
    }
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: SupportTicket) => (
        <Button 
          type="link" 
          onClick={() => handleViewTicket(record)} 
          style={{ padding: 0, fontWeight: 'bold', textAlign: 'left' }}
        >
          {title}
        </Button>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
        </Tag>
      ),
    },
    {
      title: 'Responses',
      dataIndex: 'response_count',
      key: 'response_count',
      width: 100,
      render: (count: number) => count || 0,
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 150,
      render: (date: string) => (
        <Text type="secondary">{formatTimeAgo(date)}</Text>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      render: (_, record: SupportTicket) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => handleViewTicket(record)}
        />
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>Support Tickets</Title>
          <Text type="secondary" style={{ fontSize: 16 }}>
            Get help from our support team
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreateTicket}
          size="large"
        >
          Create Support Ticket
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={supportTickets}
        rowKey="id"
        loading={pagination.loading}
        onRow={(record) => ({
          onClick: () => handleViewTicket(record),
          style: { cursor: 'pointer' }
        })}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} tickets`,
          onChange: pagination.setPage,
          onShowSizeChange: (current, size) => pagination.setPageSize(size),
        }}
        locale={{
          emptyText: (
            <div style={{ padding: '40px 0', textAlign: 'center' }}>
              <Text type="secondary" style={{ fontSize: 16 }}>
                No support tickets yet
              </Text>
              <br />
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={handleCreateTicket}
                style={{ marginTop: 16 }}
              >
                Create Your First Ticket
              </Button>
            </div>
          )
        }}
      />

      <CreateSupportTicketDrawer
        open={createDrawerOpen}
        onClose={handleCloseCreateDrawer}
        onSuccess={handleCreateSuccess}
      />

      <SupportTicketDetailsDrawer
        open={detailsDrawerOpen}
        onClose={handleCloseDetailsDrawer}
        ticket={selectedTicket}
      />
    </div>
  );
}