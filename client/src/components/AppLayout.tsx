import React from 'react';
import { Layout, Menu, Button, Space, Typography } from 'antd';
import {
  CompassOutlined,
  BookOutlined,
  GlobalOutlined,
  LoginOutlined,
  LogoutOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../store/authContext';

const { Header, Content, Footer } = Layout;
const { Text } = Typography;

const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();

  const menuItems = [
    {
      key: '/cities',
      icon: <CompassOutlined />,
      label: '城市列表',
    },
    {
      key: '/public-guides',
      icon: <GlobalOutlined />,
      label: '公开攻略',
    },
    ...(isAuthenticated
      ? [
          {
            key: '/my-guides',
            icon: <BookOutlined />,
            label: '我的攻略',
          },
        ]
      : []),
  ];

  const getSelectedKey = () => {
    const path = location.pathname;
    if (path.startsWith('/cities') || path.startsWith('/create-guide')) return '/cities';
    if (path.startsWith('/my-guides')) return '/my-guides';
    if (path.startsWith('/public-guides')) return '/public-guides';
    return path;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          background: '#001529',
        }}
      >
        <div
          style={{
            color: '#fff',
            fontSize: 18,
            fontWeight: 'bold',
            marginRight: 40,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
          onClick={() => navigate('/cities')}
        >
          🌍 旅游打卡攻略
        </div>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[getSelectedKey()]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ flex: 1, minWidth: 0 }}
        />
        <Space>
          {isAuthenticated ? (
            <>
              <Text style={{ color: '#fff' }}>
                <UserOutlined /> {user?.nickname || user?.username}
              </Text>
              <Button
                type="text"
                icon={<LogoutOutlined />}
                onClick={handleLogout}
                style={{ color: '#fff' }}
              >
                退出
              </Button>
            </>
          ) : (
            <Button
              type="text"
              icon={<LoginOutlined />}
              onClick={() => navigate('/login')}
              style={{ color: '#fff' }}
            >
              登录
            </Button>
          )}
        </Space>
      </Header>
      <Content style={{ padding: '24px 48px', background: '#f5f5f5', minHeight: 'calc(100vh - 134px)' }}>
        <Outlet />
      </Content>
      <Footer style={{ textAlign: 'center', background: '#fff' }}>
        旅游打卡攻略 ©{new Date().getFullYear()} — 探索世界，记录美好
      </Footer>
    </Layout>
  );
};

export default AppLayout;
