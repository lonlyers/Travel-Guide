import React, { useEffect, useState } from 'react';
import { Card, List, Button, Tag, Space, Spin, Empty, Typography, Popconfirm, message } from 'antd';
import {
  EyeOutlined,
  DeleteOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import type { Guide } from '../types';

const { Title, Text } = Typography;

const MyGuides: React.FC = () => {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchGuides = async () => {
    try {
      const res = await api.get('/guides/my');
      setGuides(res.data);
    } catch {
      // handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuides();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/guides/${id}`);
      message.success('删除成功');
      setGuides((prev) => prev.filter((g) => g.id !== id));
    } catch (err: any) {
      message.error(err.response?.data?.error || '删除失败');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Title level={3}>📖 我的攻略</Title>
      {guides.length === 0 ? (
        <Empty description="你还没有创建任何攻略">
          <Button type="primary" onClick={() => navigate('/cities')}>
            去创建攻略
          </Button>
        </Empty>
      ) : (
        <List
          dataSource={guides}
          renderItem={(guide) => (
            <List.Item>
              <Card style={{ width: '100%' }} hoverable>
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
                        <Tag color={guide.visibility === 'public' ? 'green' : 'orange'}>
                          {guide.visibility === 'public' ? '🌐 公开' : '🔒 私密'}
                        </Tag>
                        <Tag>
                          <CalendarOutlined />{' '}
                          {new Date(guide.created_at).toLocaleDateString('zh-CN')}
                        </Tag>
                      </Space>
                    </div>
                  </div>
                  <Space>
                    <Button
                      type="primary"
                      icon={<EyeOutlined />}
                      onClick={() => navigate(`/guide/${guide.id}`)}
                    >
                      查看
                    </Button>
                    <Popconfirm
                      title="确定删除此攻略？"
                      onConfirm={() => handleDelete(guide.id)}
                      okText="确定"
                      cancelText="取消"
                    >
                      <Button danger icon={<DeleteOutlined />}>
                        删除
                      </Button>
                    </Popconfirm>
                  </Space>
                </div>
              </Card>
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

export default MyGuides;
