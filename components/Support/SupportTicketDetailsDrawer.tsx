'use client';

import { useState, useEffect } from 'react';
import { Drawer, Typography, Tag, Space, List, Avatar, Button, Form, Input, message, Divider, Select } from 'antd';
import { UserOutlined, SendOutlined, ClockCircleOutlined, EditOutlined } from '@ant-design/icons';
import { SupportTicketService } from '@/services/supportTicketService';
import { useConfiguration } from '@/contexts/ConfigurationContext';
import { formatTimeAgo } from '@/utils/dateUtils';
import type { SupportTicket, SupportTicketResponse, CreateSupportTicketResponseRequest } from '@/types/supportTicket';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface SupportTicketDetailsDrawerProps {
  open: boolean;
  onClose: () => void;
  ticket: SupportTicket | null;
}

export default function SupportTicketDetailsDrawer({
  open,
  onClose,
  ticket,
}: SupportTicketDetailsDrawerProps) {
  const [responses, setResponses] = useState<SupportTicketResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [form] = Form.useForm();
  const { configuration } = useConfiguration();

  useEffect(() => {
    if (open && ticket) {
      fetchTicketWithResponses();
    }
  }, [open, ticket]);

  const fetchTicketWithResponses = async () => {
    if (!ticket) return;
    
    try {
      setLoading(true);
      // Get the full ticket data including responses
      const fullTicket = await SupportTicketService.getSupportTicket(ticket.id);
      setResponses(fullTicket.responses || []);
    } catch (error) {
      console.error('Failed to fetch ticket details:', error);
      message.error('Failed to load ticket details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitResponse = async (values: CreateSupportTicketResponseRequest) => {
    if (!ticket) return;

    try {
      setSubmitting(true);
      await SupportTicketService.createSupportTicketResponse(ticket.id, values);
      message.success('Response added successfully');
      form.resetFields();
      fetchTicketWithResponses(); // Refresh ticket with responses
    } catch (error) {
      console.error('Failed to add response:', error);
      message.error('Failed to add response');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (newStatus: 'open' | 'closed' | 'completed') => {
    if (!ticket) return;

    try {
      setUpdatingStatus(true);
      await SupportTicketService.updateSupportTicket(ticket.id, { status: newStatus });
      message.success('Ticket status updated successfully');
      // Update the local ticket status
      ticket.status = newStatus;
    } catch (error) {
      console.error('Failed to update ticket status:', error);
      message.error('Failed to update ticket status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'blue';
      case 'completed': return 'orange';
      case 'closed': return 'green';
      default: return 'default';
    }
  };

  // Check if user is super admin
  const isSuperAdmin = configuration?.user?.data?.role === 'super';

  if (!ticket) return null;

  return (
    <Drawer
      title={
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <span>Support Ticket #{ticket.id}</span>
            <Tag color={getStatusColor(ticket.status)}>
              {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1).replace('_', ' ')}
            </Tag>
            {isSuperAdmin && (
              <Select
                value={ticket.status}
                onChange={handleStatusUpdate}
                loading={updatingStatus}
                size="small"
                style={{ minWidth: 100 }}
              >
                <Select.Option value="open">Open</Select.Option>
                <Select.Option value="completed">Completed</Select.Option>
                <Select.Option value="closed">Closed</Select.Option>
              </Select>
            )}
          </div>
          <Space direction="vertical" size={4}>
            <Text type="secondary" style={{ fontSize: 14 }}>
              Created {formatTimeAgo(ticket.created_at)} by {ticket.user.name}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Account: {ticket.account.name}
            </Text>
          </Space>
        </div>
      }
      open={open}
      onClose={onClose}
      width={800}
    >
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ marginBottom: 8 }}>
          {ticket.title}
        </Title>
        <Paragraph style={{ fontSize: 16, lineHeight: 1.6 }}>
          {ticket.description}
        </Paragraph>
      </div>

      <Divider />

      <div style={{ marginBottom: 24 }}>
        <Title level={5} style={{ marginBottom: 16 }}>
          Responses ({responses.length})
        </Title>
        
        <List
          loading={loading}
          dataSource={responses}
          locale={{
            emptyText: 'No responses yet. Add the first response below.'
          }}
          renderItem={(response) => (
            <List.Item style={{ padding: '16px 0', border: 'none' }}>
              <div style={{ width: '100%' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 12,
                  marginBottom: 8 
                }}>
                  <Avatar 
                    icon={<UserOutlined />} 
                    size="small"
                    style={{ 
                      backgroundColor: response.user.is_admin ? '#1890ff' : '#52c41a' 
                    }}
                  />
                  <Text strong>
                    {response.user.name}
                  </Text>
                  {response.user.is_admin && (
                    <Tag color="blue">Admin</Tag>
                  )}
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    <ClockCircleOutlined /> {formatTimeAgo(response.created_at)}
                  </Text>
                </div>
                <div style={{ 
                  marginLeft: 32,
                  padding: 16,
                  background: response.user.is_admin ? '#f0f8ff' : '#f6ffed',
                  borderRadius: 8,
                  border: response.user.is_admin ? '1px solid #d6e7ff' : '1px solid #d9f7be'
                }}>
                  <Paragraph style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                    {response.message}
                  </Paragraph>
                </div>
              </div>
            </List.Item>
          )}
        />
      </div>

      {ticket.status !== 'closed' && (
        <>
          <Divider />
          
          <div>
            <Title level={5} style={{ marginBottom: 16 }}>
              Add Response
            </Title>
            
            <Form
              form={form}
              onFinish={handleSubmitResponse}
              layout="vertical"
            >
              <Form.Item
                name="message"
                rules={[
                  { required: true, message: 'Please enter your response' },
                  { min: 5, message: 'Response must be at least 5 characters' }
                ]}
              >
                <TextArea
                  placeholder="Type your response here..."
                  rows={4}
                  maxLength={1000}
                  showCount
                />
              </Form.Item>
              
              <Form.Item style={{ marginBottom: 0 }}>
                <Button 
                  type="primary" 
                  htmlType="submit"
                  loading={submitting}
                  icon={<SendOutlined />}
                >
                  Send Response
                </Button>
              </Form.Item>
            </Form>
          </div>
        </>
      )}

      {ticket.status === 'closed' && (
        <div style={{
          padding: 16,
          background: '#f6ffed',
          borderRadius: 8,
          border: '1px solid #b7eb8f',
          textAlign: 'center'
        }}>
          <Text type="secondary">
            This ticket has been closed. Contact support if you need to reopen it.
          </Text>
        </div>
      )}
    </Drawer>
  );
}