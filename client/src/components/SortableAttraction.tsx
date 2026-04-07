import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, Upload, Input, Button, Image, Typography } from 'antd';
import { HolderOutlined, UploadOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import api from '../api';

const { TextArea } = Input;
const { Text } = Typography;

interface SortableAttractionProps {
  id: string;
  name: string;
  address: string;
  photoUrl: string | null;
  comment: string | null;
  onPhotoChange: (url: string) => void;
  onCommentChange: (comment: string) => void;
}

const SortableAttraction: React.FC<SortableAttractionProps> = ({
  id,
  name,
  address,
  photoUrl,
  comment,
  onPhotoChange,
  onCommentChange,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    marginBottom: 16,
  };

  const uploadProps: UploadProps = {
    name: 'photo',
    showUploadList: false,
    customRequest: async ({ file, onSuccess, onError }) => {
      try {
        const formData = new FormData();
        formData.append('photo', file as File);
        const res = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        onPhotoChange(res.data.url);
        onSuccess?.(res.data);
      } catch (err) {
        onError?.(err as Error);
      }
    },
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card
        size="small"
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <HolderOutlined
              {...attributes}
              {...listeners}
              style={{ cursor: 'grab', color: '#999', fontSize: 16 }}
            />
            <span>{name}</span>
          </div>
        }
      >
        <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
          📍 {address}
        </Text>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: '0 0 auto' }}>
            {photoUrl ? (
              <div style={{ marginBottom: 8 }}>
                <Image
                  src={photoUrl.startsWith('http') ? photoUrl : `http://localhost:5000${photoUrl}`}
                  width={160}
                  height={120}
                  style={{ objectFit: 'cover', borderRadius: 4 }}
                  alt={name}
                />
              </div>
            ) : null}
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />} size="small">
                {photoUrl ? '更换照片' : '上传照片'}
              </Button>
            </Upload>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <TextArea
              placeholder="写下你对这个景点的评价和心得..."
              rows={4}
              value={comment || ''}
              onChange={(e) => onCommentChange(e.target.value)}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SortableAttraction;
