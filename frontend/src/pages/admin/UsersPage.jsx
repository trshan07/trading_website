// frontend/src/pages/admin/UsersPage.jsx
import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Modal, Form, Input, Select, Switch, message, Tag, Avatar, InputNumber, Drawer, Descriptions, Badge, Popconfirm, Tooltip, Row, Col, Statistic } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, SearchOutlined, ExportOutlined, DollarOutlined, StopOutlined, CheckCircleOutlined, UserAddOutlined, TeamOutlined, WalletOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/adminService';

const { Option } = Select;
const { TextArea } = Input;

const UsersPage = () => {
  const { isSuperAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [form] = Form.useForm();
  const [balanceForm] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [stats, setStats] = useState({ totalUsers: 0, activeUsers: 0, totalBalance: 0 });
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [pagination.current, pagination.pageSize, searchText]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/users', {
        params: {
          page: pagination.current,
          limit: pagination.pageSize,
          search: searchText,
        },
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setUsers(response.data.data.users);
        setPagination({ ...pagination, total: response.data.data.total });
      }
    } catch (error) {
      // Demo data for development
      setUsers([
        { id: '1', name: 'John Doe', email: 'john@example.com', role: 'user', balance: 12500, status: 'active', totalTrades: 45, createdAt: new Date(), lastLogin: new Date() },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'user', balance: 8900, status: 'active', totalTrades: 32, createdAt: new Date(), lastLogin: new Date() },
        { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'user', balance: 3400, status: 'pending', totalTrades: 18, createdAt: new Date(), lastLogin: null },
        { id: '4', name: 'Alice Brown', email: 'alice@example.com', role: 'admin', balance: 50000, status: 'active', totalTrades: 0, createdAt: new Date(), lastLogin: new Date() },
      ]);
      setPagination({ ...pagination, total: 4 });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/users/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      setStats({ totalUsers: 4, activeUsers: 3, totalBalance: 74800 });
    }
  };

  const handleCreateUser = async (values) => {
    try {
      if (values.role === 'admin' || values.role === 'super_admin') {
        await adminService.createAdmin(values);
      } else {
        await adminService.createUser(values);
      }
      message.success(`${values.role.charAt(0).toUpperCase() + values.role.slice(1)} created successfully`);
      setModalVisible(false);
      form.resetFields();
      fetchUsers();
      fetchStats();
    } catch (error) {
      console.error('Create error:', error);
      message.error(error.response?.data?.message || 'Failed to create user');
    }
  };

  const handleUpdateUser = async (values) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/admin/users/${editingUser.id}`, values, {
        headers: { Authorization: `Bearer ${token}` }
      });
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
      const token = localStorage.getItem('token');
      await axios.delete(`/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      message.success('User deleted successfully');
      fetchUsers();
      fetchStats();
    } catch (error) {
      message.error('Failed to delete user');
    }
  };

  const handleAdjustBalance = async (values) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/admin/users/${selectedUser.id}/balance`, values, {
        headers: { Authorization: `Bearer ${token}` }
      });
      message.success('Balance adjusted successfully');
      setDrawerVisible(false);
      balanceForm.resetFields();
      fetchUsers();
      fetchStats();
    } catch (error) {
      message.error('Failed to adjust balance');
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
      const token = localStorage.getItem('token');
      await axios.patch(`/api/admin/users/${userId}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
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
            {text?.charAt(0)}
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
        <Tag color={role === 'super_admin' ? '#722ed1' : role === 'admin' ? '#FFD700' : '#1890ff'}>
          {role?.toUpperCase().replace('_', ' ')}
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
      title: 'Trades',
      dataIndex: 'totalTrades',
      key: 'totalTrades',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge 
          status={status === 'active' ? 'success' : status === 'suspended' ? 'error' : 'warning'} 
          text={status?.toUpperCase()}
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
            title="Delete User"
            description="Are you sure you want to delete this user?"
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
    <div style={{ background: '#f0f2f5', minHeight: '100vh', padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ color: '#001529', fontWeight: 'bold', fontSize: '28px', margin: 0 }}>User Management</h1>
          <p style={{ color: '#666', marginTop: '8px' }}>Manage all platform users and their accounts</p>
        </div>
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
          Add New User
        </Button>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={8}>
          <Card style={{ borderRadius: '12px', borderTop: '3px solid #FFD700' }}>
            <Statistic
              title="Total Users"
              value={stats.totalUsers}
              prefix={<TeamOutlined style={{ color: '#FFD700' }} />}
              valueStyle={{ color: '#001529' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card style={{ borderRadius: '12px', borderTop: '3px solid #FFD700' }}>
            <Statistic
              title="Active Users"
              value={stats.activeUsers}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card style={{ borderRadius: '12px', borderTop: '3px solid #FFD700' }}>
            <Statistic
              title="Total Balance"
              value={stats.totalBalance}
              precision={2}
              prefix={<WalletOutlined style={{ color: '#FFD700' }} />}
              valueStyle={{ color: '#001529' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: '24px', borderRadius: '12px' }}>
        <Space wrap style={{ width: '100%', justifyContent: 'space-between' }}>
          <Input.Search
            placeholder="Search by name or email..."
            onSearch={setSearchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
          <Space>
            <Button icon={<ExportOutlined />}>Export CSV</Button>
            <Button icon={<UserAddOutlined />}>Import Users</Button>
          </Space>
        </Space>
      </Card>

      {/* Users Table */}
      <Card style={{ borderRadius: '12px', borderTop: '4px solid #FFD700' }}>
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
            <Input placeholder="Enter full name" size="large" />
          </Form.Item>
          
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Invalid email' }
            ]}
          >
            <Input placeholder="Enter email" size="large" />
          </Form.Item>
          
          {!editingUser && (
            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true, message: 'Please enter password', min: 6 }]}
            >
              <Input.Password placeholder="Enter password" size="large" />
            </Form.Item>
          )}
          
          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true }]}
            initialValue="user"
          >
            <Select size="large">
              <Option value="user">User</Option>
              <Option value="admin">Admin</Option>
              {isSuperAdmin && <Option value="super_admin">Super Admin</Option>}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true }]}
            initialValue="pending"
          >
            <Select size="large">
              <Option value="active">Active</Option>
              <Option value="suspended">Suspended</Option>
              <Option value="pending">Pending</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="initialBalance"
            label="Initial Balance"
            initialValue={0}
          >
            <InputNumber
              style={{ width: '100%' }}
              size="large"
              precision={2}
              placeholder="Enter initial balance"
            />
          </Form.Item>
          
          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" style={{ backgroundColor: '#FFD700', borderColor: '#FFD700', color: '#001529' }}>
                {editingUser ? 'Update' : 'Create'}
              </Button>
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
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <Avatar size={80} style={{ backgroundColor: '#FFD700', color: '#001529', fontSize: '32px' }}>
                {selectedUser.name?.charAt(0)}
              </Avatar>
              <h2 style={{ marginTop: '12px', marginBottom: '4px' }}>{selectedUser.name}</h2>
              <p style={{ color: '#666' }}>{selectedUser.email}</p>
              <Badge 
                status={selectedUser.status === 'active' ? 'success' : 'error'} 
                text={selectedUser.status?.toUpperCase()}
              />
            </div>

            <Descriptions column={1} bordered>
              <Descriptions.Item label="User ID">{selectedUser.id}</Descriptions.Item>
              <Descriptions.Item label="Role">{selectedUser.role?.toUpperCase()}</Descriptions.Item>
              <Descriptions.Item label="Balance">
                <span style={{ color: '#52c41a', fontWeight: 'bold', fontSize: '18px' }}>
                  ${selectedUser.balance?.toLocaleString()}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Total Trades">{selectedUser.totalTrades || 0}</Descriptions.Item>
              <Descriptions.Item label="Total Deposits">${(selectedUser.totalDeposits || 0).toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="Total Withdrawals">${(selectedUser.totalWithdrawals || 0).toLocaleString()}</Descriptions.Item>
              <Descriptions.Item label="Joined">{moment(selectedUser.createdAt).format('YYYY-MM-DD HH:mm:ss')}</Descriptions.Item>
              <Descriptions.Item label="Last Login">{selectedUser.lastLogin ? moment(selectedUser.lastLogin).format('YYYY-MM-DD HH:mm:ss') : 'Never'}</Descriptions.Item>
            </Descriptions>
            
            <div style={{ marginTop: '24px' }}>
              <h3>Adjust Balance</h3>
              <Form
                form={balanceForm}
                layout="vertical"
                onFinish={handleAdjustBalance}
              >
                <Form.Item
                  name="type"
                  label="Transaction Type"
                  rules={[{ required: true }]}
                  initialValue="add"
                >
                  <Select size="large">
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
                    size="large"
                    precision={2}
                    placeholder="Enter amount"
                  />
                </Form.Item>
                
                <Form.Item
                  name="reason"
                  label="Reason"
                  rules={[{ required: true }]}
                >
                  <TextArea rows={3} placeholder="Enter reason for adjustment" />
                </Form.Item>
                
                <Form.Item>
                  <Button type="primary" htmlType="submit" style={{ backgroundColor: '#FFD700', borderColor: '#FFD700', color: '#001529' }} block>
                    Apply Adjustment
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </>
        )}
      </Drawer>
    </div>
  );
};

export default UsersPage;