'use client';

import { Card, Button, Typography, Space, Tooltip } from 'antd';
import { DownloadOutlined, DeleteOutlined } from '@ant-design/icons';
import { FileUploadService } from '@/services/fileUploadService';
import { 
  getFileIconComponent, 
  getFileColorTheme, 
  getFileTypeName,
  formatFileSize 
} from '@/utils/fileUploadUtils';
import type { FileUploadResponse } from '@/types/fileUpload';

const { Text } = Typography;

interface FileCardProps {
  file: FileUploadResponse['file_info'];
  onDelete?: (fileId: string) => void;
  showDelete?: boolean;
  compact?: boolean;
}

export default function FileCard({ 
  file, 
  onDelete, 
  showDelete = false,
  compact = false 
}: FileCardProps) {
  const IconComponent = getFileIconComponent(file.content_type);
  const colorTheme = getFileColorTheme(file.content_type);
  const typeName = getFileTypeName(file.content_type);

  const handleDownload = async () => {
    await FileUploadService.downloadFile(file.id, file.filename);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(file.id);
    }
  };

  if (compact) {
    return (
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          padding: '8px 12px',
          border: '1px solid #d9d9d9',
          borderRadius: '6px',
          marginBottom: '8px'
        }}
      >
        <div 
          style={{
            width: 32,
            height: 32,
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
            ...colorTheme
          }}
        >
          <IconComponent style={{ fontSize: 16 }} />
        </div>
        
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 500, fontSize: '14px' }}>
            <Tooltip title={file.filename}>
              <Text ellipsis style={{ maxWidth: 200 }}>
                {file.filename}
              </Text>
            </Tooltip>
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {typeName} • {file.human_size || formatFileSize(file.byte_size)}
          </div>
        </div>

        <Space>
          <Button 
            type="text" 
            size="small"
            icon={<DownloadOutlined />}
            onClick={handleDownload}
            title="Download"
          />
          {showDelete && (
            <Button 
              type="text" 
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={handleDelete}
              title="Remove"
            />
          )}
        </Space>
      </div>
    );
  }

  return (
    <Card
      size="small"
      style={{ width: 200 }}
      actions={[
        <Button 
          key="download"
          type="text" 
          size="small"
          icon={<DownloadOutlined />}
          onClick={handleDownload}
        >
          Download
        </Button>,
        ...(showDelete ? [
          <Button 
            key="delete"
            type="text" 
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={handleDelete}
          >
            Remove
          </Button>
        ] : [])
      ]}
    >
      <div style={{ textAlign: 'center' }}>
        <div 
          style={{
            width: 60,
            height: 60,
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
            ...colorTheme
          }}
        >
          <IconComponent style={{ fontSize: 24 }} />
        </div>
        
        <Tooltip title={file.filename}>
          <div style={{ fontWeight: 500, marginBottom: 4 }}>
            <Text ellipsis>
              {file.filename}
            </Text>
          </div>
        </Tooltip>
        
        <div style={{ fontSize: '12px', color: '#666', marginBottom: 4 }}>
          {typeName}
        </div>
        
        <div style={{ fontSize: '12px', color: '#999' }}>
          {file.human_size || formatFileSize(file.byte_size)}
        </div>
      </div>
    </Card>
  );
}