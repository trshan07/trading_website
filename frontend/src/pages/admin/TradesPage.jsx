// frontend/src/pages/admin/TradesPage.jsx
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
  Statistic,
  Row,
  Col,
  message,
  Tooltip,
} from 'antd';
import {
  EyeOutlined,
  StopOutlined,
  ReloadOutlined,
  BarChartOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { adminService } from '../../services/adminService';
import moment from 'moment';

const { RangePicker } = DatePicker;
const { Option } = Select;

const TradesPage = () => {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    dateRange: null,
    search: '',
  });
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchTrades();
    fetchTradeStats();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchTrades = async () => {
    setLoading(true);
    try {
      const data = await adminService.getTrades({
        page: pagination.current,
        limit: pagination.pageSize,
        ...filters,
        startDate: filters.dateRange?.[0]?.toISOString(),
        endDate: filters.dateRange?.[1]?.toISOString(),
      });
      setTrades(data.trades);
      setPagination({ ...pagination, total: data.total });
    } catch (error) {
      message.error('Failed to fetch trades');
    } finally {
      setLoading(false);
    }
  };

  const fetchTradeStats = async () => {
    try {
      const data = await adminService.getTradeStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch trade stats');
    }
  };

  const handleCancelTrade = async (tradeId) => {
    try {
      await adminService.cancelTrade(tradeId);
      message.success('Trade cancelled successfully');
      fetchTrades();
      fetchTradeStats();
    } catch (error) {
      message.error('Failed to cancel trade');
    }
  };

  const columns = [
    {
      title: 'Trade ID',
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
      title: 'Pair',
      dataIndex: 'pair',
      key: 'pair',
      render: (pair) => <Tag color="blue">{pair}</Tag>,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={type === 'BUY' ? '#52c41a' : '#f5222d'}>
          {type}
        </Tag>
      ),
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `$${amount.toLocaleString()}`,
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `$${price.toLocaleString()}`,
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (total) => (
        <span style={{ fontWeight: 'bold' }}>${total.toLocaleString()}</span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={
          status === 'completed' ? '#52c41a' :
          status === 'pending' ? '#faad14' :
          status === 'cancelled' ? '#f5222d' : '#1890ff'
        }>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Time',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => moment(date).fromNow(),
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
                setSelectedTrade(record);
                setModalVisible(true);
              }}
            />
          </Tooltip>
          {record.status === 'pending' && (
            <Tooltip title="Cancel Trade">
              <Button
                icon={<StopOutlined />}
                danger
                onClick={() => handleCancelTrade(record.id)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderTop: '3px solid #FFD700' }}>
            <Statistic
              title="Total Trades"
              value={stats.totalTrades}
              prefix={<BarChartOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderTop: '3px solid #FFD700' }}>
            <Statistic
              title="Total Volume"
              value={stats.totalVolume}
              precision={2}
              prefix="$"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderTop: '3px solid #FFD700' }}>
            <Statistic
              title="Active Trades"
              value={stats.activeTrades}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderTop: '3px solid #FFD700' }}>
            <Statistic
              title="Success Rate"
              value={stats.successRate}
              suffix="%"
              precision={1}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Trading Volume Chart */}
      <Card style={{ marginBottom: 24, borderTop: '3px solid #FFD700' }}>
        <h3>Trading Volume (Last 7 Days)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={stats.volumeData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <RechartsTooltip />
            <Line type="monotone" dataKey="volume" stroke="#FFD700" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Trades Table */}
      <Card 
        title="Trade Oversight" 
        style={{ borderTop: '4px solid #FFD700' }}
        extra={
          <Space>
            <Select
              defaultValue="all"
              style={{ width: 120 }}
              onChange={(value) => setFilters({ ...filters, status: value })}
            >
              <Option value="all">All Status</Option>
              <Option value="pending">Pending</Option>
              <Option value="completed">Completed</Option>
              <Option value="cancelled">Cancelled</Option>
            </Select>
            <Select
              defaultValue="all"
              style={{ width: 100 }}
              onChange={(value) => setFilters({ ...filters, type: value })}
            >
              <Option value="all">All Types</Option>
              <Option value="BUY">Buy</Option>
              <Option value="SELL">Sell</Option>
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
                setFilters({ status: 'all', type: 'all', dateRange: null, search: '' });
                fetchTrades();
              }}
            >
              Reset
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={trades}
          loading={loading}
          pagination={pagination}
          onChange={(newPagination) => setPagination(newPagination)}
          rowKey="id"
        />
      </Card>

      {/* Trade Details Modal */}
      <Modal
        title="Trade Details"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={700}
      >
        {selectedTrade && (
          <Descriptions column={2} bordered>
            <Descriptions.Item label="Trade ID">{selectedTrade.id}</Descriptions.Item>
            <Descriptions.Item label="User">{selectedTrade.userName}</Descriptions.Item>
            <Descriptions.Item label="Email">{selectedTrade.userEmail}</Descriptions.Item>
            <Descriptions.Item label="Pair">{selectedTrade.pair}</Descriptions.Item>
            <Descriptions.Item label="Type">
              <Tag color={selectedTrade.type === 'BUY' ? '#52c41a' : '#f5222d'}>
                {selectedTrade.type}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Amount">{selectedTrade.amount} units</Descriptions.Item>
            <Descriptions.Item label="Price">${selectedTrade.price.toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="Total">${selectedTrade.total.toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={
                selectedTrade.status === 'completed' ? '#52c41a' :
                selectedTrade.status === 'pending' ? '#faad14' : '#f5222d'
              }>
                {selectedTrade.status.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Created">{moment(selectedTrade.createdAt).format('YYYY-MM-DD HH:mm:ss')}</Descriptions.Item>
            <Descriptions.Item label="Updated">{moment(selectedTrade.updatedAt).format('YYYY-MM-DD HH:mm:ss')}</Descriptions.Item>
            {selectedTrade.completedAt && (
              <Descriptions.Item label="Completed">{moment(selectedTrade.completedAt).format('YYYY-MM-DD HH:mm:ss')}</Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default TradesPage;