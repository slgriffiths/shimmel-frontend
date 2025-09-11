'use client';

import { Row, Col, Empty, Typography } from 'antd';
import FileCard from './FileCard';
import type { FileUploadResponse } from '@/types/fileUpload';

const { Title } = Typography;

interface FileListProps {
  files: FileUploadResponse['file_info'][];
  onFileDelete?: (fileId: string) => void;
  showDelete?: boolean;
  title?: string;
  compact?: boolean;
  emptyText?: string;
}

export default function FileList({ 
  files, 
  onFileDelete, 
  showDelete = false,
  title,
  compact = false,
  emptyText = "No files uploaded yet"
}: FileListProps) {
  if (files.length === 0) {
    return (
      <div>
        {title && <Title level={4}>{title}</Title>}
        <Empty 
          description={emptyText}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    );
  }

  if (compact) {
    return (
      <div>
        {title && <Title level={4}>{title}</Title>}
        <div>
          {files.map(file => (
            <FileCard
              key={file.id}
              file={file}
              onDelete={onFileDelete}
              showDelete={showDelete}
              compact
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {title && <Title level={4}>{title}</Title>}
      <Row gutter={[16, 16]}>
        {files.map(file => (
          <Col key={file.id} xs={24} sm={12} md={8} lg={6}>
            <FileCard
              file={file}
              onDelete={onFileDelete}
              showDelete={showDelete}
            />
          </Col>
        ))}
      </Row>
    </div>
  );
}