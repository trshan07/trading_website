// frontend/src/layouts/AdminLayout.jsx
import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  UserOutlined,
  MoneyCollectOutlined,
  StockOutlined,
  FileTextOutlined,
  SettingOutlined,
  AuditOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { Layout, Menu, Button, Avatar, Dropdown, Badge, theme } from 'antd';
import { useAuth } from '../hooks/useAuth';
import logo from '../assets/images/logos/logo-dark.png';


const { Header, Sider, Content } = Layout;

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: <NavLink to="/admin/dashboard">Dashboard</NavLink>,
    },
    {
      key: 'users',
      icon: <UserOutlined />,
      label: <NavLink to="/admin/users">User Management</NavLink>,
    },
    {
      key: 'funding',
      icon: <MoneyCollectOutlined />,
      label: <NavLink to="/admin/funding">Funding Requests</NavLink>,
    },
    {
      key: 'trades',
      icon: <StockOutlined />,
      label: <NavLink to="/admin/trades">Trade Oversight</NavLink>,
    },
    {
      key: 'reports',
      icon: <FileTextOutlined />,
      label: <NavLink to="/admin/reports">Reports</NavLink>,
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: <NavLink to="/admin/settings">System Settings</NavLink>,
    },
    {
      key: 'audit',
      icon: <AuditOutlined />,
      label: <NavLink to="/admin/audit">Audit Logs</NavLink>,
    },
  ];

  const userMenu = [
    {
      key: 'profile',
      label: <NavLink to="/admin/profile">Profile Settings</NavLink>,
    },
    {
      key: 'logout',
      label: 'Logout',
      icon: <LogoutOutlined />,
      onClick: logout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{
          background: '#001529',
          boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
        }}
      >
        <div className="logo-container" style={{ 
          padding: '16px', 
          textAlign: 'center',
          borderBottom: '1px solid rgba(255,215,0,0.2)'
        }}>
          {!collapsed ? (
            <img src={logo} alt="TIK TRADES" style={{ height: '40px' }} />
          ) : (
            <img src={logo} alt="TIK TRADES" style={{ height: '32px' }} />
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['dashboard']}
          items={menuItems}
          style={{
            background: '#001529',
            borderRight: 'none',
          }}
        />
      </Sider>
      
      <Layout>
        <Header
          style={{
            padding: '0 24px',
            background: colorBgContainer,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <Badge count={5} style={{ backgroundColor: '#FFD700' }}>
              <Button type="text" icon={<BellOutlined />} />
            </Badge>
            
            <Dropdown menu={{ items: userMenu }} placement="bottomRight">
              <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Avatar style={{ backgroundColor: '#FFD700', color: '#001529' }}>
                  {user?.name?.charAt(0)}
                </Avatar>
                <span style={{ color: '#001529' }}>{user?.name}</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;