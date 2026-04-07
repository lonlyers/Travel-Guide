import React, { useEffect, useState } from 'react';
import { Card, Typography, Spin, Empty, List, Image, Button, Divider, Space, Tag } from 'antd';
import { DownloadOutlined, EnvironmentOutlined, CalendarOutlined, UserOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import api from '../api';
import type { Guide } from '../types';

const { Title, Text, Paragraph } = Typography;

const GuideDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [guide, setGuide] = useState<Guide | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGuide = async () => {
      try {
        const res = await api.get(`/guides/${id}`);
        setGuide(res.data);
      } catch {
        // handled by interceptor
      } finally {
        setLoading(false);
      }
    };
    fetchGuide();
  }, [id]);

  const handleDownloadPdf = () => {
    window.open(`http://localhost:5000/api/guides/${id}/pdf`, '_blank');
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!guide) {
    return <Empty description="攻略未找到" />;
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <Title level={3} style={{ margin: 0 }}>
              {guide.title}
            </Title>
            <Space style={{ marginTop: 8 }} wrap>
              <Tag color="blue">
                <EnvironmentOutlined /> {guide.city_name}
              </Tag>
              <Tag>
                <UserOutlined /> {guide.nickname || guide.username}
              </Tag>
              <Tag>
                <CalendarOutlined /> {new Date(guide.created_at).toLocaleDateString('zh-CN')}
              </Tag>
              <Tag color={guide.visibility === 'public' ? 'green' : 'orange'}>
                {guide.visibility === 'public' ? '🌐 公开' : '🔒 私密'}
              </Tag>
            </Space>
          </div>
          <Button type="primary" icon={<DownloadOutlined />} onClick={handleDownloadPdf}>
            下载PDF
          </Button>
        </div>

        <Divider />

        <List
          dataSource={guide.attractions || []}
          renderItem={(attr, index) => (
            <List.Item style={{ display: 'block', padding: '16px 0' }}>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: '#1677ff',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: 16,
                    flexShrink: 0,
                  }}
                >
                  {index + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Title level={5} style={{ margin: 0 }}>
                    {attr.attraction_name}
                  </Title>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    📍 {attr.attraction_address}
                  </Text>
                  <Paragraph
                    type="secondary"
                    style={{ marginTop: 4, marginBottom: 8, fontSize: 13 }}
                  >
                    {attr.attraction_description}
                  </Paragraph>
                  {attr.photo_url && (
                    <div style={{ marginBottom: 8 }}>
                      <Image
                        src={
                          attr.photo_url.startsWith('http')
                            ? attr.photo_url
                            : `http://localhost:5000${attr.photo_url}`
                        }
                        width={240}
                        style={{ borderRadius: 8 }}
                        alt={attr.attraction_name}
                      />
                    </div>
                  )}
                  {attr.comment && (
                    <Card
                      size="small"
                      style={{ background: '#f9f9f9', borderColor: '#e8e8e8' }}
                    >
                      <Text>💬 {attr.comment}</Text>
                    </Card>
                  )}
                </div>
              </div>
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default GuideDetail;
