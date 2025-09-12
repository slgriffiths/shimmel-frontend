import { Button, Space, Tag, Tooltip } from 'antd';
import { EditOutlined, EyeOutlined, UserDeleteOutlined, UserAddOutlined } from '@ant-design/icons';
import type { User } from '@/types/user';

export const getUserColumns = (
  handleViewUser: (user: User) => void,
  handleEditUser: (user: User) => void,
  handleDisableUser: (user: User) => void,
  handleEnableUser: (user: User) => void
) => [
  {
    title: 'Name',
    key: 'name',
    render: (_, record: User) => (
      <Button 
        type="link" 
        onClick={() => handleViewUser(record)} 
        style={{ padding: 0, fontWeight: 'bold' }}
      >
        {`${record.first_name} ${record.last_name}`}
      </Button>
    ),
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
  },
  {
    title: 'Role',
    key: 'role',
    render: (_, record: User) => (
      <Tag color={record.role === 'admin' ? 'gold' : 'blue'}>
        {record.role === 'admin' ? 'Account Admin' : 'User'}
      </Tag>
    ),
  },
  {
    title: 'Status',
    key: 'status',
    render: (_, record: User) => (
      <Tag color={record.disabled_at ? 'red' : 'green'}>
        {record.disabled_at ? 'Disabled' : 'Active'}
      </Tag>
    ),
  },
  {
    title: 'Last Sign In',
    dataIndex: 'last_sign_in_at',
    key: 'last_sign_in_at',
    render: (date: string) => date ? new Date(date).toLocaleDateString() : 'Never',
  },
  {
    title: 'Created',
    dataIndex: 'created_at',
    key: 'created_at',
    width: 120,
    render: (date: string) => new Date(date).toLocaleDateString(),
  },
  {
    title: 'Actions',
    key: 'actions',
    width: 150,
    render: (_, record: User) => (
      <Space>
        <Tooltip title="View User">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleViewUser(record);
            }}
          />
        </Tooltip>
        
        <Tooltip title="Edit User">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleEditUser(record);
            }}
          />
        </Tooltip>
        
        {record.disabled_at ? (
          <Tooltip title="Enable User">
            <Button
              type="text"
              icon={<UserAddOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleEnableUser(record);
              }}
              style={{ color: '#52c41a' }}
            />
          </Tooltip>
        ) : (
          <Tooltip title="Disable User">
            <Button
              type="text"
              icon={<UserDeleteOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleDisableUser(record);
              }}
              danger
            />
          </Tooltip>
        )}
      </Space>
    ),
  },
];