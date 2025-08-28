'use client';

import { useEffect, useState } from 'react';
import { Table, Typography, Button, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { usePagination, PagyResponse } from '@/hooks/usePagination';
import { getAccountColumns } from './columns';
import CreateAccountDrawer from './CreateAccountDrawer/CreateAccountDrawer';

const { Title } = Typography;

interface Account {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  users_count?: number;
  workflows_count?: number;
}

export default function AccountsList() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const pagination = usePagination({ initialPageSize: 20 });

  useEffect(() => {
    fetchAccounts();
  }, [pagination.current, pagination.pageSize]);

  const fetchAccounts = async () => {
    pagination.setLoading(true);
    try {
      const params = pagination.getQueryParams();
      const { data } = await api.get<PagyResponse<Account>>('/accounts', { params });
      
      setAccounts(data.accounts);
      pagination.updateFromResponse(data);
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
      message.error('Failed to load accounts');
      setAccounts([]);
      pagination.setLoading(false);
    }
  };

  const handleViewAccount = (accountId: number) => {
    router.push(`/accounts/${accountId}`);
  };

  const handleCreateAccount = () => {
    setCreateDrawerOpen(true);
  };

  const handleCreateSuccess = () => {
    fetchAccounts();
  };

  const columns = getAccountColumns(handleViewAccount);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2}>Accounts</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateAccount}>
          Create Account
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={accounts}
        rowKey="id"
        loading={pagination.loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} accounts`,
          pageSizeOptions: ['20', '50', '100'],
          onChange: (page, pageSize) => {
            if (pageSize !== pagination.pageSize) {
              pagination.setPageSize(pageSize);
            } else {
              pagination.setPage(page);
            }
          },
        }}
      />

      <CreateAccountDrawer
        open={createDrawerOpen}
        onClose={() => setCreateDrawerOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}