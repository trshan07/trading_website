// frontend/src/pages/admin/AdminDashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Progress, Tag, Button, DatePicker, Space, Tooltip, Avatar, Badge } from 'antd';
import {
  UserOutlined,
  DollarOutlined,
  StockOutlined,
  FundOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  ReloadOutlined,
  DownloadOutlined,
  EyeOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { adminService } from '../../services/adminService';
import moment from 'moment';

const { RangePicker } = DatePicker;

const AdminDashboardPage = () => {
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    stats: {},
    recentUsers: [],
    recentTrades: [],
    fundingStats: [],
    tradingVolume: [],
    userGrowth: [],
    topTraders: [],
    recentActivities: [],
  });
  const [dateRange, setDateRange] = useState([moment().subtract(30, 'days'), moment()]);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [dateRange]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const data = await adminService.getDashboardStats({
        startDate: dateRange[0].toISOString(),
        endDate: dateRange[1].toISOString(),
      });
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#FFD700', '#1890ff', '#52c41a', '#faad14', '#f5222d'];

  const userColumns = [
    {
      title: 'User',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <Avatar style={{ backgroundColor: '#FFD700', color: '#001529' }}>
            {text?.charAt(0) || 'U'}
          </Avatar>
          <div>
            <div style={{ fontWeight: 'bold' }}>{text}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>{record.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Balance',
      dataIndex: 'balance',
      key: 'balance',
      render: (balance) => (
        <span style={{ color: '#52c41a', fontWeight: 'bold' }}>
          ${balance?.toLocaleString() || '0'}
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
          text={status?.toUpperCase() || 'PENDING'}
        />
      ),
    },
  ];

  const activityColumns = [
    {
      title: 'Activity',
      dataIndex: 'action',
      key: 'action',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.details}</div>
        </div>
      ),
    },
    {
      title: 'User',
      dataIndex: 'userName',
      key: 'userName',
    },
    {
      title: 'Time',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => moment(date).fromNow(),
    },
  ];

  return (
    <div style={{ background: '#f0f2f5', minHeight: '100vh', padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ color: '#001529', fontWeight: 'bold', fontSize: '28px', margin: 0 }}>
            Admin Dashboard
          </h1>
          <p style={{ color: '#666', marginTop: '8px' }}>
            Welcome back! Here's what's happening with your trading platform today.
          </p>
        </div>
        <Space>
          <RangePicker 
            value={dateRange}
            onChange={setDateRange}
            style={{ borderRadius: '8px' }}
          />
          <Button 
            icon={<ReloadOutlined />} 
            onClick={fetchDashboardData}
            style={{ borderRadius: '8px', borderColor: '#FFD700', color: '#FFD700' }}
            loading={loading}
          >
            Refresh
          </Button>
          <Button 
            icon={<DownloadOutlined />}
            style={{ borderRadius: '8px', background: '#FFD700', borderColor: '#FFD700', color: '#001529' }}
          >
            Export Report
          </Button>
        </Space>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            style={{ 
              borderRadius: '12px', 
              borderTop: '4px solid #FFD700',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}
          >
            <Statistic
              title="Total Users"
              value={dashboardData.stats.totalUsers || 0}
              prefix={<UserOutlined style={{ color: '#FFD700' }} />}
              valueStyle={{ color: '#001529', fontWeight: 'bold' }}
            />
            <div style={{ marginTop: '8px' }}>
              <span style={{ color: '#52c41a' }}>
                <ArrowUpOutlined /> {dashboardData.stats.userGrowth || 0}%
              </span>
              <span style={{ marginLeft: '8px', color: '#666' }}>vs last month</span>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card 
            style={{ 
              borderRadius: '12px', 
              borderTop: '4px solid #FFD700',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}
          >
            <Statistic
              title="Total Volume"
              value={dashboardData.stats.totalVolume || 0}
              precision={2}
              prefix={<DollarOutlined style={{ color: '#FFD700' }} />}
              valueStyle={{ color: '#001529', fontWeight: 'bold' }}
            />
            <div style={{ marginTop: '8px' }}>
              <span style={{ color: '#52c41a' }}>
                <ArrowUpOutlined /> {dashboardData.stats.volumeGrowth || 0}%
              </span>
              <span style={{ marginLeft: '8px', color: '#666' }}>vs last month</span>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card 
            style={{ 
              borderRadius: '12px', 
              borderTop: '4px solid #FFD700',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}
          >
            <Statistic
              title="Active Trades"
              value={dashboardData.stats.activeTrades || 0}
              prefix={<StockOutlined style={{ color: '#FFD700' }} />}
              valueStyle={{ color: '#faad14', fontWeight: 'bold' }}
            />
            <div style={{ marginTop: '8px' }}>
              <span style={{ color: '#666' }}>Currently open positions</span>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card 
            style={{ 
              borderRadius: '12px', 
              borderTop: '4px solid #FFD700',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}
          >
            <Statistic
              title="Pending Funding"
              value={dashboardData.stats.pendingFunding || 0}
              precision={2}
              prefix={<FundOutlined style={{ color: '#FFD700' }} />}
              valueStyle={{ color: '#faad14', fontWeight: 'bold' }}
            />
            <Tooltip title="Pending deposit/withdrawal requests">
              <WarningOutlined style={{ marginLeft: '8px', color: '#faad14' }} />
            </Tooltip>
          </Card>
        </Col>
      </Row>

      {/* Second Row Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: '12px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <Statistic
              title={<span style={{ color: 'white' }}>Active Users</span>}
              value={dashboardData.stats.activeUsers || 0}
              prefix={<CheckCircleOutlined style={{ color: 'white' }} />}
              valueStyle={{ color: 'white', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: '12px', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <Statistic
              title={<span style={{ color: 'white' }}>Success Rate</span>}
              value={dashboardData.stats.successRate || 98.5}
              precision={1}
              suffix="%"
              valueStyle={{ color: 'white', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: '12px', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            <Statistic
              title={<span style={{ color: 'white' }}>Avg Response Time</span>}
              value={dashboardData.stats.avgResponseTime || 145}
              suffix="ms"
              valueStyle={{ color: 'white', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ borderRadius: '12px', background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
            <Statistic
              title={<span style={{ color: 'white' }}>System Uptime</span>}
              value={dashboardData.stats.uptime || 99.9}
              precision={1}
              suffix="%"
              valueStyle={{ color: 'white', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} lg={12}>
          <Card 
            title="Trading Volume Trend" 
            style={{ borderRadius: '12px', borderTop: '3px solid #FFD700' }}
            extra={<Button type="link" style={{ color: '#FFD700' }}>View Details</Button>}
          >
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dashboardData.tradingVolume}>
                <defs>
                  <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FFD700" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#FFD700" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <RechartsTooltip />
                <Area type="monotone" dataKey="volume" stroke="#FFD700" fillOpacity={1} fill="url(#colorVolume)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card 
            title="User Growth" 
            style={{ borderRadius: '12px', borderTop: '3px solid #FFD700' }}
            extra={<Button type="link" style={{ color: '#FFD700' }}>View Details</Button>}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboardData.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="users" fill="#FFD700" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Funding Distribution and Top Traders */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} lg={12}>
          <Card 
            title="Funding Distribution" 
            style={{ borderRadius: '12px', borderTop: '3px solid #FFD700' }}
          >
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dashboardData.fundingStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dashboardData.fundingStats?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card 
            title="Top Traders" 
            style={{ borderRadius: '12px', borderTop: '3px solid #FFD700' }}
            extra={<Button type="link" style={{ color: '#FFD700' }}>View All</Button>}
          >
            <Table
              dataSource={dashboardData.topTraders}
              columns={[
                { title: 'Rank', key: 'rank', render: (_, __, index) => index + 1 },
                { title: 'Trader', dataIndex: 'name', key: 'name' },
                { title: 'Volume', dataIndex: 'volume', key: 'volume', render: v => `$${v?.toLocaleString()}` },
                { title: 'Profit', dataIndex: 'profit', key: 'profit', render: p => <span style={{ color: '#52c41a' }}>+${p?.toLocaleString()}</span> },
              ]}
              pagination={false}
              size="small"
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      {/* Recent Tables */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card 
            title="Recent Users" 
            style={{ borderRadius: '12px', borderTop: '3px solid #FFD700' }}
            extra={
              <Button type="link" style={{ color: '#FFD700' }} onClick={() => window.location.href = '/admin/users'}>
                View All
              </Button>
            }
          >
            <Table
              dataSource={dashboardData.recentUsers}
              columns={userColumns}
              pagination={false}
              loading={loading}
              size="small"
            />
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card 
            title="Recent Activities" 
            style={{ borderRadius: '12px', borderTop: '3px solid #FFD700' }}
            extra={
              <Button type="link" style={{ color: '#FFD700' }} onClick={() => window.location.href = '/admin/audit'}>
                View All
              </Button>
            }
          >
            <Table
              dataSource={dashboardData.recentActivities}
              columns={activityColumns}
              pagination={false}
              loading={loading}
              size="small"
            />
          </Card>
        </Col>
      </Row>

      {/* System Health */}
      <Card 
        title="System Health" 
        style={{ marginTop: '24px', borderRadius: '12px', borderTop: '3px solid #FFD700' }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>CPU Usage</span>
                <span style={{ color: '#52c41a' }}>{dashboardData.stats.cpuUsage || 45}%</span>
              </div>
              <Progress percent={dashboardData.stats.cpuUsage || 45} strokeColor="#FFD700" />
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Memory Usage</span>
                <span style={{ color: '#52c41a' }}>{dashboardData.stats.memoryUsage || 62}%</span>
              </div>
              <Progress percent={dashboardData.stats.memoryUsage || 62} strokeColor="#FFD700" />
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Disk Usage</span>
                <span style={{ color: '#52c41a' }}>{dashboardData.stats.diskUsage || 38}%</span>
              </div>
              <Progress percent={dashboardData.stats.diskUsage || 38} strokeColor="#FFD700" />
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default AdminDashboardPage;