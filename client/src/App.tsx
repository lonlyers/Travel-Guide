import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import AppLayout from './components/AppLayout';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Cities from './pages/Cities';
import CreateGuide from './pages/CreateGuide';
import GuideDetail from './pages/GuideDetail';
import MyGuides from './pages/MyGuides';
import PublicGuides from './pages/PublicGuides';

const App: React.FC = () => {
  return (
    <ConfigProvider locale={zhCN}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/cities" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cities" element={<Cities />} />
          <Route
            path="/create-guide/:cityId"
            element={
              <PrivateRoute>
                <CreateGuide />
              </PrivateRoute>
            }
          />
          <Route path="/guide/:id" element={<GuideDetail />} />
          <Route
            path="/my-guides"
            element={
              <PrivateRoute>
                <MyGuides />
              </PrivateRoute>
            }
          />
          <Route path="/public-guides" element={<PublicGuides />} />
        </Route>
      </Routes>
    </ConfigProvider>
  );
};

export default App;
