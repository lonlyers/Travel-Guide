import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Spin, Empty, Typography } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import type { City } from '../types';

const { Meta } = Card;
const { Title } = Typography;

const Cities: React.FC = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await api.get('/cities');
        setCities(res.data);
      } catch {
        // error handled by interceptor
      } finally {
        setLoading(false);
      }
    };
    fetchCities();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (cities.length === 0) {
    return <Empty description="暂无城市数据" />;
  }

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>
        <EnvironmentOutlined /> 选择目的地
      </Title>
      <Row gutter={[24, 24]}>
        {cities.map((city) => (
          <Col xs={24} sm={12} md={8} lg={6} key={city.id}>
            <Card
              hoverable
              cover={
                <div style={{ height: 200, overflow: 'hidden' }}>
                  <img
                    alt={city.name}
                    src={city.image_url || 'https://via.placeholder.com/400x200?text=City'}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              }
              onClick={() => navigate(`/create-guide/${city.id}`)}
            >
              <Meta title={city.name} description={city.description} />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Cities;
