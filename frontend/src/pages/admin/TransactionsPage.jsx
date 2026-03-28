// frontend/src/pages/admin/TransactionsPage.jsx
import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Select,
  DatePicker,
  Input,
  Tag,
  Modal,
  Descriptions,
  message,
  Tooltip,
  Badge,
  Statistic,
  Row,
  Col,
} from 'antd';
import {
  EyeOutlined,
  SearchOutlined,
  ReloadOutlined,
  ExportOutlined,
  FilterOutlined,
  DollarOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import { adminService } from '../../services/adminService';
import moment from 'moment';

const { RangePicker } = DatePicker;
const { Option } = Select;

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    dateRange: null,
    search: '',
  });
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchTransactions();
    fetchTransactionStats();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const data = await adminService.getTransactions({
        page: pagination.current,
        limit: pagination.pageSize,
        ...filters,
        startDate: filters.dateRange?.[0]?.toISOString(),
        endDate: filters.dateRange?.[1]?.toISOString(),
      });
      setTransactions(data.transactions);
      setPagination({ ...pagination, total: data.total });
    } catch (error) {
      message.error('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactionStats = async () => {
    try {
      const data = await adminService.getTransactionStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch transaction stats');
    }
  };

  const columns = [
    {
      title: 'Transaction ID',
      dataIndex: 'id',
      key: 'id',
      render: (id) => <span style={{ fontFamily: 'monospace' }}>#{id.slice(-8)}</span>,
    },
    {
      title: 'User',
      dataIndex: 'userName',
      key: 'userName',
      render: (text, record) => (
        <div>
          <div>{text}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.userEmail}</div>
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={type === 'deposit' ? '#52c41a' : type === 'withdrawal' ? '#f5222d' : '#1890ff'}>
          {type?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount, record) => (
        <span style={{ 
          color: record.type === 'deposit' ? '#52c41a' : record.type === 'withdrawal' ? '#f5222d' : '#1890ff',
          fontWeight: 'bold' 
        }}>
          {record.type === 'withdrawal' ? '-' : '+'}${amount?.toLocaleString()}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge 
          status={
            status === 'completed' ? 'success' :
            status === 'pending' ? 'warning' : 'error'
          }
          text={status?.toUpperCase()}
        />
      ),
    },
    {
      title: 'Method',
      dataIndex: 'method',
      key: 'method',
      render: (method) => method?.toUpperCase(),
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => moment(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Tooltip title="View Details">
          <Button
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedTransaction(record);
              setModalVisible(true);
            }}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={8}>
          <Card style={{ borderRadius: '12px', borderTop: '3px solid #FFD700' }}>
            <Statistic
              title="Total Transactions"
              value={stats.totalTransactions || 0}
              prefix={<SwapOutlined style={{ color: '#FFD700' }} />}
              valueStyle={{ color: '#001529' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card style={{ borderRadius: '12px', borderTop: '3px solid #FFD700' }}>
            <Statistic
              title="Total Volume"
              value={stats.totalVolume || 0}
              precision={2}
              prefix={<DollarOutlined style={{ color: '#FFD700' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card style={{ borderRadius: '12px', borderTop: '3px solid #FFD700' }}>
            <Statistic
              title="Pending Transactions"
              value={stats.pendingTransactions || 0}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Card 
        title="Transaction Management" 
        style={{ borderRadius: '12px', borderTop: '4px solid #FFD700' }}
        extra={
          <Space>
            <Select
              defaultValue="all"
              style={{ width: 120 }}
              onChange={(value) => setFilters({ ...filters, type: value })}
            >
              <Option value="all">All Types</Option>
              <Option value="deposit">Deposits</Option>
              <Option value="withdrawal">Withdrawals</Option>
              <Option value="trade">Trades</Option>
            </Select>
            <Select
              defaultValue="all"
              style={{ width: 120 }}
              onChange={(value) => setFilters({ ...filters, status: value })}
            >
              <Option value="all">All Status</Option>
              <Option value="pending">Pending</Option>
              <Option value="completed">Completed</Option>
              <Option value="failed">Failed</Option>
            </Select>
            <RangePicker
              onChange={(dates) => setFilters({ ...filters, dateRange: dates })}
            />
            <Input.Search
              placeholder="Search by user or ID"
              onSearch={(value) => setFilters({ ...filters, search: value })}
              style={{ width: 200 }}
              allowClear
            />
            <Button 
              icon={<ReloadOutlined />} 
              onClick={() => {
                setFilters({ type: 'all', status: 'all', dateRange: null, search: '' });
                fetchTransactions();
              }}
            >
              Reset
            </Button>
            <Button 
              icon={<ExportOutlined />}
              style={{ background: '#FFD700', borderColor: '#FFD700', color: '#001529' }}
              onClick={() => adminService.exportTransactions(filters)}
            >
              Export
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={transactions}
          loading={loading}
          pagination={pagination}
          onChange={(newPagination) => setPagination(newPagination)}
          rowKey="id"
        />
      </Card>

      {/* Transaction Details Modal */}
      <Modal
        title="Transaction Details"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={700}
      >
        {selectedTransaction && (
          <Descriptions column={2} bordered>
            <Descriptions.Item label="Transaction ID" span={2}>
              {selectedTransaction.id}
            </Descriptions.Item>
            <Descriptions.Item label="User">{selectedTransaction.userName}</Descriptions.Item>
            <Descriptions.Item label="Email">{selectedTransaction.userEmail}</Descriptions.Item>
            <Descriptions.Item label="Type">
              <Tag color={selectedTransaction.type === 'deposit' ? '#52c41a' : '#f5222d'}>
                {selectedTransaction.type?.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Amount">
              <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                ${selectedTransaction.amount?.toLocaleString()}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Badge 
                status={
                  selectedTransaction.status === 'completed' ? 'success' :
                  selectedTransaction.status === 'pending' ? 'warning' : 'error'
                }
                text={selectedTransaction.status?.toUpperCase()}
              />
            </Descriptions.Item>
            <Descriptions.Item label="Method">{selectedTransaction.method?.toUpperCase()}</Descriptions.Item>
            <Descriptions.Item label="Reference">{selectedTransaction.reference || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Created">
              {moment(selectedTransaction.createdAt).format('YYYY-MM-DD HH:mm:ss')}
            </Descriptions.Item>
            <Descriptions.Item label="Updated">
              {moment(selectedTransaction.updatedAt).format('YYYY-MM-DD HH:mm:ss')}
            </Descriptions.Item>
            {selectedTransaction.completedAt && (
              <Descriptions.Item label="Completed" span={2}>
                {moment(selectedTransaction.completedAt).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
            )}
            {selectedTransaction.notes && (
              <Descriptions.Item label="Notes" span={2}>
                {selectedTransaction.notes}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default TransactionsPage;