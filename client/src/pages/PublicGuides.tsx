import React, { useEffect, useState } from 'react';
import { Card, List, Button, Tag, Space, Spin, Empty, Typography } from 'antd';
import {
  EyeOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import type { Guide } from '../types';

const { Title, Text } = Typography;

const PublicGuides: React.FC = () => {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGuides = async () => {
      try {
        const res = await api.get('/guides/public');
        setGuides(res.data);
      } catch {
        // handled by interceptor
      } finally {
        setLoading(false);
      }
    };
    fetchGuides();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Title level={3}>🌐 公开攻略</Title>
      {guides.length === 0 ? (
        <Empty description="暂无公开攻略" />
      ) : (
        <List
          dataSource={guides}
          renderItem={(guide) => (
            <List.Item>
              <Card style={{ width: '100%' }} hoverable onClick={() => navigate(`/guide/${guide.id}`)}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 12,
                  }}
                >
                  <div>
                    <Text strong style={{ fontSize: 16 }}>
                      {guide.title}
                    </Text>
                    <div style={{ marginTop: 8 }}>
                      <Space wrap>
                        <Tag color="blue">
                          <EnvironmentOutlined /> {guide.city_name}
                        </Tag>
                        <Tag>
                          <UserOutlined /> {guide.nickname || guide.username}
                        </Tag>
                        <Tag>
                          <CalendarOutlined />{' '}
                          {new Date(guide.created_at).toLocaleDateString('zh-CN')}
                        </Tag>
                      </Space>
                    </div>
                  </div>
                  <Button type="primary" icon={<EyeOutlined />}>
                    查看
                  </Button>
                </div>
              </Card>
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

export default PublicGuides;
