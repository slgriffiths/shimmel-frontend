'use client';

import { useEffect, useState } from 'react';
import { Typography, Tabs, Spin, message } from 'antd';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';

const { Title } = Typography;

interface Account {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export default function AccountDetailPage() {
  const params = useParams();
  const accountId = params.id;
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (accountId) {
      fetchAccount();
    }
  }, [accountId]);

  const fetchAccount = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/accounts/${accountId}`);
      setAccount(data);
    } catch (error) {
      console.error('Failed to fetch account:', error);
      message.error('Failed to load account');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        padding: 24, 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: 400 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!account) {
    return (
      <div style={{ padding: 24 }}>
        <Title level={3}>Account not found</Title>
      </div>
    );
  }

  const tabItems = [
    {
      key: 'workflows',
      label: 'Workflows',
      children: <div>Workflows content coming soon</div>,
    },
    {
      key: 'agents',
      label: 'Agents',
      children: <div>Agents content coming soon</div>,
    },
    {
      key: 'users',
      label: 'Users',
      children: <div>Users content coming soon</div>,
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>{account.name}</Title>
      
      <Tabs items={tabItems} />
    </div>
  );
}