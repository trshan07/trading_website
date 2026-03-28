// frontend/src/pages/admin/UsersPage.jsx
import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  message,
  Tag,
  Popconfirm,
  Tooltip,
  Avatar,
  InputNumber,
  Drawer,
  Descriptions,
  Badge,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  FilterOutlined,
  ExportOutlined,
  DollarOutlined,
  StopOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { adminService } from '../../services/adminService';
import moment from 'moment';

const { Option } = Select;

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [form] = Form.useForm();
  const [balanceForm] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({ status: 'all', role: 'all' });
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  useEffect(() => {
    fetchUsers();
  }, [pagination.current, pagination.pageSize, searchText, filters]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await adminService.getUsers({
        page: pagination.current,
        limit: pagination.pageSize,
        search: searchText,
        status: filters.status !== 'all' ? filters.status : undefined,
        role: filters.role !== 'all' ? filters.role : undefined,
      });
      setUsers(data.users);
      setPagination({ ...pagination, total: data.total });
    } catch (error) {
      message.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (values) => {
    try {
      await adminService.createUser(values);
      message.success('User created successfully');
      setModalVisible(false);
      form.resetFields();
      fetchUsers();
    } catch (error) {
      message.error('Failed to create user');
    }
  };

  const handleUpdateUser = async (values) => {
    try {
      await adminService.updateUser(editingUser.id, values);
      message.success('User updated successfully');
      setModalVisible(false);
      setEditingUser(null);
      form.resetFields();
      fetchUsers();
    } catch (error) {
      message.error('Failed to update user');
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await adminService.deleteUser(userId);
      message.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      message.error('Failed to delete user');
    }
  };

  const handleAdjustBalance = async (values) => {
    try {
      await adminService.adjustUserBalance(selectedUser.id, values);
      message.success('Balance adjusted successfully');
      setDrawerVisible(false);
      fetchUsers();
    } catch (error) {
      message.error('Failed to adjust balance');
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
      await adminService.updateUserStatus(userId, newStatus);
      message.success(`User ${newStatus === 'active' ? 'activated' : 'suspended'} successfully`);
      fetchUsers();
    } catch (error) {
      message.error('Failed to update user status');
    }
  };

  const columns = [
    {
      title: 'User',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <Avatar style={{ backgroundColor: '#FFD700', color: '#001529' }}>
            {text.charAt(0)}
          </Avatar>
          <div>
            <div style={{ fontWeight: 'bold' }}>{text}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{record.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={role === 'admin' ? '#FFD700' : '#1890ff'}>
          {role.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Balance',
      dataIndex: 'balance',
      key: 'balance',
      render: (balance) => (
        <span style={{ color: '#52c41a', fontWeight: 'bold' }}>
          ${balance?.toLocaleString()}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge 
          status={status === 'active' ? 'success' : 'error'} 
          text={status.toUpperCase()}
        />
      ),
    },
    {
      title: 'Joined',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => moment(date).format('YYYY-MM-DD'),
    },
    {
      title: 'Last Login',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      render: (date) => date ? moment(date).fromNow() : 'Never',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedUser(record);
                setDrawerVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Edit User">
            <Button
              icon={<EditOutlined />}
              onClick={() => {
                setEditingUser(record);
                form.setFieldsValue(record);
                setModalVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title={record.status === 'active' ? 'Suspend User' : 'Activate User'}>
            <Button
              icon={record.status === 'active' ? <StopOutlined /> : <CheckCircleOutlined />}
              onClick={() => handleToggleStatus(record.id, record.status)}
              style={{ borderColor: record.status === 'active' ? '#f5222d' : '#52c41a' }}
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this user?"
            onConfirm={() => handleDeleteUser(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Tooltip title="Delete User">
              <Button icon={<DeleteOutlined />} danger />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card 
        title="User Management" 
        style={{ borderTop: '4px solid #FFD700' }}
        extra={
          <Space>
            <Input.Search
              placeholder="Search users..."
              onSearch={setSearchText}
              style={{ width: 200 }}
              allowClear
            />
            <Select
              defaultValue="all"
              style={{ width: 120 }}
              onChange={(value) => setFilters({ ...filters, status: value })}
            >
              <Option value="all">All Status</Option>
              <Option value="active">Active</Option>
              <Option value="suspended">Suspended</Option>
              <Option value="pending">Pending</Option>
            </Select>
            <Select
              defaultValue="all"
              style={{ width: 120 }}
              onChange={(value) => setFilters({ ...filters, role: value })}
            >
              <Option value="all">All Roles</Option>
              <Option value="user">User</Option>
              <Option value="admin">Admin</Option>
            </Select>
            <Button icon={<ExportOutlined />}>Export</Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingUser(null);
                form.resetFields();
                setModalVisible(true);
              }}
              style={{ backgroundColor: '#FFD700', borderColor: '#FFD700', color: '#001529' }}
            >
              Add User
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={users}
          loading={loading}
          pagination={pagination}
          onChange={(newPagination) => setPagination(newPagination)}
          rowKey="id"
        />
      </Card>

      {/* Create/Edit User Modal */}
      <Modal
        title={editingUser ? 'Edit User' : 'Create New User'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingUser(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={editingUser ? handleUpdateUser : handleCreateUser}
        >
          <Form.Item
            name="name"
            label="Full Name"
            rules={[{ required: true, message: 'Please enter name' }]}
          >
            <Input placeholder="Enter full name" />
          </Form.Item>
          
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Invalid email' }
            ]}
          >
            <Input placeholder="Enter email" />
          </Form.Item>
          
          {!editingUser && (
            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true, message: 'Please enter password', min: 6 }]}
            >
              <Input.Password placeholder="Enter password" />
            </Form.Item>
          )}
          
          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="user">User</Option>
              <Option value="admin">Admin</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="active">Active</Option>
              <Option value="suspended">Suspended</Option>
              <Option value="pending">Pending</Option>
            </Select>
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" style={{ backgroundColor: '#FFD700', borderColor: '#FFD700', color: '#001529' }}>
                {editingUser ? 'Update' : 'Create'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* User Details Drawer */}
      <Drawer
        title="User Details"
        placement="right"
        width={500}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        extra={
          <Button 
            icon={<DollarOutlined />} 
            onClick={() => balanceForm.setFieldsValue({ amount: 0, type: 'add' })}
            style={{ borderColor: '#FFD700', color: '#FFD700' }}
          >
            Adjust Balance
          </Button>
        }
      >
        {selectedUser && (
          <>
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Name">{selectedUser.name}</Descriptions.Item>
              <Descriptions.Item label="Email">{selectedUser.email}</Descriptions.Item>
              <Descriptions.Item label="Role">{selectedUser.role}</Descriptions.Item>
              <Descriptions.Item label="Status">
                <Badge status={selectedUser.status === 'active' ? 'success' : 'error'} text={selectedUser.status} />
              </Descriptions.Item>
              <Descriptions.Item label="Balance">
                <span style={{ color: '#52c41a', fontWeight: 'bold' }}>
                  ${selectedUser.balance?.toLocaleString()}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Total Deposits">
                ${selectedUser.totalDeposits?.toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="Total Withdrawals">
                ${selectedUser.totalWithdrawals?.toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="Total Trades">
                {selectedUser.totalTrades}
              </Descriptions.Item>
              <Descriptions.Item label="Joined">
                {moment(selectedUser.createdAt).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
              <Descriptions.Item label="Last Login">
                {selectedUser.lastLogin ? moment(selectedUser.lastLogin).format('YYYY-MM-DD HH:mm:ss') : 'Never'}
              </Descriptions.Item>
            </Descriptions>
            
            <Form
              form={balanceForm}
              layout="vertical"
              onFinish={handleAdjustBalance}
              style={{ marginTop: 24 }}
            >
              <Form.Item
                name="type"
                label="Transaction Type"
                rules={[{ required: true }]}
              >
                <Select>
                  <Option value="add">Add Funds</Option>
                  <Option value="subtract">Subtract Funds</Option>
                </Select>
              </Form.Item>
              
              <Form.Item
                name="amount"
                label="Amount"
                rules={[{ required: true, type: 'number', min: 0.01 }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  precision={2}
                  placeholder="Enter amount"
                />
              </Form.Item>
              
              <Form.Item
                name="reason"
                label="Reason"
                rules={[{ required: true }]}
              >
                <Input.TextArea rows={3} placeholder="Enter reason for adjustment" />
              </Form.Item>
              
              <Form.Item>
                <Button type="primary" htmlType="submit" style={{ backgroundColor: '#FFD700', borderColor: '#FFD700', color: '#001529' }}>
                  Apply Adjustment
                </Button>
              </Form.Item>
            </Form>
          </>
        )}
      </Drawer>
    </div>
  );
};

export default UsersPage;