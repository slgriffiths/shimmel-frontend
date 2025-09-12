'use client';

import { useState } from 'react';
import { Typography, Button } from 'antd';
import { UserAddOutlined } from '@ant-design/icons';
import AccountUsersTable from './AccountUsersTable/AccountUsersTable';
import UserViewDrawer from './UserViewDrawer';
import UserEditDrawer from './UserEditDrawer';
import NewUserDrawer from './NewUserDrawer';
import type { User } from '@/types/user';

const { Title } = Typography;

interface AccountUsersProps {
  accountId: number;
}

export default function AccountUsers({ accountId }: AccountUsersProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [viewDrawerOpen, setViewDrawerOpen] = useState(false);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [newUserDrawerOpen, setNewUserDrawerOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleNewUser = () => {
    setNewUserDrawerOpen(true);
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setViewDrawerOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditDrawerOpen(true);
  };

  const handleSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleCloseViewDrawer = () => {
    setViewDrawerOpen(false);
    setSelectedUser(null);
  };

  const handleCloseEditDrawer = () => {
    setEditDrawerOpen(false);
    setSelectedUser(null);
  };

  const handleCloseNewUserDrawer = () => {
    setNewUserDrawerOpen(false);
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>Users</Title>
        <Button
          type="primary"
          icon={<UserAddOutlined />}
          onClick={handleNewUser}
        >
          New User
        </Button>
      </div>

      <AccountUsersTable
        accountId={accountId}
        onViewUser={handleViewUser}
        onEditUser={handleEditUser}
        refreshTrigger={refreshTrigger}
      />

      <UserViewDrawer
        open={viewDrawerOpen}
        onClose={handleCloseViewDrawer}
        user={selectedUser}
      />

      <UserEditDrawer
        open={editDrawerOpen}
        onClose={handleCloseEditDrawer}
        onSuccess={handleSuccess}
        user={selectedUser}
        accountId={accountId}
      />

      <NewUserDrawer
        open={newUserDrawerOpen}
        onClose={handleCloseNewUserDrawer}
        onSuccess={handleSuccess}
        accountId={accountId}
      />
    </div>
  );
}