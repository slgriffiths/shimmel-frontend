'use client';

import { useState, useEffect } from 'react';
import { Table, message, Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { UserService } from '@/services/userService';
import { usePagination } from '@/hooks/usePagination';
import { getUserColumns } from './columns';
import type { User } from '@/types/user';

const { confirm } = Modal;

interface AccountUsersTableProps {
  accountId: number;
  onViewUser: (user: User) => void;
  onEditUser: (user: User) => void;
  refreshTrigger?: number;
}

export default function AccountUsersTable({
  accountId,
  onViewUser,
  onEditUser,
  refreshTrigger,
}: AccountUsersTableProps) {
  const [users, setUsers] = useState<User[]>([]);
  const pagination = usePagination({ initialPageSize: 20 });

  const fetchUsers = async () => {
    try {
      pagination.setLoading(true);
      const params = pagination.getQueryParams();
      const response = await UserService.getUsers(accountId, params.page, params.limit);
      
      setUsers(response.users);
      pagination.updateFromResponse(response);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      message.error('Failed to load users');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [accountId, pagination.current, pagination.pageSize, refreshTrigger]);

  const handleViewUser = (user: User) => {
    onViewUser(user);
  };

  const handleEditUser = (user: User) => {
    onEditUser(user);
  };

  const handleDisableUser = (user: User) => {
    confirm({
      title: `Disable User "${user.first_name} ${user.last_name}"?`,
      icon: <ExclamationCircleOutlined />,
      content: 'This user will no longer be able to access the account. This action can be reversed.',
      okText: 'Disable',
      okType: 'danger',
      cancelText: 'Cancel',
      async onOk() {
        try {
          await UserService.disableUser(accountId, user.id);
          message.success('User disabled successfully');
          fetchUsers();
        } catch (error) {
          console.error('Failed to disable user:', error);
          message.error('Failed to disable user');
        }
      },
    });
  };

  const handleEnableUser = async (user: User) => {
    try {
      await UserService.enableUser(accountId, user.id);
      message.success('User enabled successfully');
      fetchUsers();
    } catch (error) {
      console.error('Failed to enable user:', error);
      message.error('Failed to enable user');
    }
  };

  const handleResendInvitation = async (user: User) => {
    try {
      await UserService.resendInvitation(accountId, user.id);
      message.success(`Invitation resent to ${user.first_name} ${user.last_name}`);
    } catch (error) {
      console.error('Failed to resend invitation:', error);
      message.error('Failed to resend invitation');
    }
  };

  const handleRowClick = (record: User) => {
    handleViewUser(record);
  };

  const columns = getUserColumns(
    handleViewUser,
    handleEditUser,
    handleDisableUser,
    handleEnableUser,
    handleResendInvitation
  );

  return (
    <Table
      columns={columns}
      dataSource={users}
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
        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} users`,
        onChange: pagination.setPage,
        onShowSizeChange: (current, size) => pagination.setPageSize(size),
      }}
    />
  );
}