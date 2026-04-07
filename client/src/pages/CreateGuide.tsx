import React, { useEffect, useState, useCallback } from 'react';
import {
  Steps,
  Checkbox,
  Button,
  Input,
  Radio,
  Card,
  Space,
  Spin,
  message,
  Typography,
  List,
  Divider,
  Image,
} from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import api from '../api';
import type { Attraction } from '../types';
import SortableAttraction from '../components/SortableAttraction';

const { Title, Text } = Typography;

interface SelectedAttraction {
  id: string;
  attraction_id: number;
  name: string;
  address: string;
  description: string;
  photo_url: string | null;
  comment: string | null;
}

const CreateGuide: React.FC = () => {
  const { cityId } = useParams<{ cityId: string }>();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectedAttractions, setSelectedAttractions] = useState<SelectedAttraction[]>([]);
  const [title, setTitle] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    const fetchAttractions = async () => {
      try {
        const res = await api.get('/attractions', { params: { city_id: cityId } });
        setAttractions(res.data);
      } catch {
        message.error('加载景点失败');
      } finally {
        setLoading(false);
      }
    };
    fetchAttractions();
  }, [cityId]);

  const handleSelectionChange = (id: number, checked: boolean) => {
    setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((i) => i !== id)));
  };

  const goToStep1 = () => {
    const items: SelectedAttraction[] = selectedIds.map((id) => {
      const a = attractions.find((attr) => attr.id === id)!;
      const existing = selectedAttractions.find((sa) => sa.attraction_id === id);
      return {
        id: `attraction-${id}`,
        attraction_id: id,
        name: a.name,
        address: a.address,
        description: a.description,
        photo_url: existing?.photo_url || null,
        comment: existing?.comment || null,
      };
    });
    setSelectedAttractions(items);
    setCurrentStep(1);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setSelectedAttractions((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handlePhotoChange = useCallback((attractionId: string, url: string) => {
    setSelectedAttractions((prev) =>
      prev.map((item) => (item.id === attractionId ? { ...item, photo_url: url } : item))
    );
  }, []);

  const handleCommentChange = useCallback((attractionId: string, comment: string) => {
    setSelectedAttractions((prev) =>
      prev.map((item) => (item.id === attractionId ? { ...item, comment } : item))
    );
  }, []);

  const handleSave = async () => {
    if (!title.trim()) {
      message.warning('请输入攻略标题');
      return;
    }
    setSaving(true);
    try {
      await api.post('/guides', {
        title: title.trim(),
        city_id: Number(cityId),
        visibility,
        attractions: selectedAttractions.map((a, index) => ({
          attraction_id: a.attraction_id,
          sort_order: index + 1,
          comment: a.comment || '',
          photo_url: a.photo_url || '',
        })),
      });
      message.success('攻略保存成功！');
      navigate('/my-guides');
    } catch (err: any) {
      message.error(err.response?.data?.error || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  const stepItems = [
    { title: '选择景点' },
    { title: '排序与详情' },
    { title: '保存攻略' },
  ];

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <Title level={3}>创建旅游攻略</Title>
      <Steps current={currentStep} items={stepItems} style={{ marginBottom: 32 }} />

      {currentStep === 0 && (
        <Card>
          <Title level={5}>选择你想打卡的景点</Title>
          {attractions.length === 0 ? (
            <Text type="secondary">该城市暂无景点数据</Text>
          ) : (
            <List
              dataSource={attractions}
              renderItem={(attr) => (
                <List.Item>
                  <Checkbox
                    checked={selectedIds.includes(attr.id)}
                    onChange={(e) => handleSelectionChange(attr.id, e.target.checked)}
                  >
                    <Space direction="vertical" size={0}>
                      <Text strong>{attr.name}</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        📍 {attr.address}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {attr.description}
                      </Text>
                    </Space>
                  </Checkbox>
                </List.Item>
              )}
            />
          )}
          <div style={{ marginTop: 16, textAlign: 'right' }}>
            <Button
              type="primary"
              disabled={selectedIds.length === 0}
              onClick={goToStep1}
            >
              下一步
            </Button>
          </div>
        </Card>
      )}

      {currentStep === 1 && (
        <Card>
          <Title level={5}>拖拽排序，上传照片，写下你的心得</Title>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext
              items={selectedAttractions.map((a) => a.id)}
              strategy={verticalListSortingStrategy}
            >
              {selectedAttractions.map((attr) => (
                <SortableAttraction
                  key={attr.id}
                  id={attr.id}
                  name={attr.name}
                  address={attr.address}
                  photoUrl={attr.photo_url}
                  comment={attr.comment}
                  onPhotoChange={(url) => handlePhotoChange(attr.id, url)}
                  onCommentChange={(c) => handleCommentChange(attr.id, c)}
                />
              ))}
            </SortableContext>
          </DndContext>
          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between' }}>
            <Button onClick={() => setCurrentStep(0)}>上一步</Button>
            <Button type="primary" onClick={() => setCurrentStep(2)}>
              下一步
            </Button>
          </div>
        </Card>
      )}

      {currentStep === 2 && (
        <Card>
          <Title level={5}>填写攻略信息</Title>
          <div style={{ marginBottom: 16 }}>
            <Text strong>攻略标题</Text>
            <Input
              placeholder="给你的攻略起个名字吧"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ marginTop: 8 }}
              size="large"
            />
          </div>
          <div style={{ marginBottom: 24 }}>
            <Text strong>可见性</Text>
            <div style={{ marginTop: 8 }}>
              <Radio.Group value={visibility} onChange={(e) => setVisibility(e.target.value)}>
                <Radio value="public">🌐 公开 — 所有人可见</Radio>
                <Radio value="private">🔒 私密 — 仅自己可见</Radio>
              </Radio.Group>
            </div>
          </div>
          <Divider>攻略预览</Divider>
          <List
            dataSource={selectedAttractions}
            renderItem={(attr, index) => (
              <List.Item>
                <Space align="start">
                  <Text strong style={{ fontSize: 18, color: '#1677ff' }}>
                    {index + 1}
                  </Text>
                  <div>
                    <Text strong>{attr.name}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      📍 {attr.address}
                    </Text>
                    {attr.photo_url && (
                      <div style={{ marginTop: 4 }}>
                        <Image
                          src={
                            attr.photo_url.startsWith('http')
                              ? attr.photo_url
                              : `http://localhost:5000${attr.photo_url}`
                          }
                          width={100}
                          height={75}
                          style={{ objectFit: 'cover', borderRadius: 4 }}
                          alt={attr.name}
                        />
                      </div>
                    )}
                    {attr.comment && (
                      <Text style={{ fontSize: 13, display: 'block', marginTop: 4 }}>
                        💬 {attr.comment}
                      </Text>
                    )}
                  </div>
                </Space>
              </List.Item>
            )}
          />
          <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between' }}>
            <Button onClick={() => setCurrentStep(1)}>上一步</Button>
            <Button type="primary" size="large" loading={saving} onClick={handleSave}>
              保存攻略
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default CreateGuide;
