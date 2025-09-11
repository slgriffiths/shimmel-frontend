'use client';

import { useState } from 'react';
import { Card, Space, Divider, Alert, Typography } from 'antd';
import { MultiFileUpload, FileList } from './index';
import { generateUploadSessionId } from '@/utils/uploadSession';
import type { FileUploadResponse } from '@/types/fileUpload';

const { Text } = Typography;

interface SessionFileUploadProps {
  onFilesChange?: (files: FileUploadResponse['file_info'][], sessionId?: string) => void;
  onSessionReady?: (sessionId: string) => void;
  maxFiles?: number;
  disabled?: boolean;
  showTitle?: boolean;
  title?: string;
  description?: string;
  existingFiles?: FileUploadResponse['file_info'][];
}

export default function SessionFileUpload({
  onFilesChange,
  onSessionReady,
  maxFiles,
  disabled = false,
  showTitle = true,
  title = "File Upload",
  description = "Upload files that will be attached to your workflow run",
  existingFiles = [],
}: SessionFileUploadProps) {
  const [uploadSessionId, setUploadSessionId] = useState<string>();
  const [uploadedFiles, setUploadedFiles] = useState<FileUploadResponse['file_info'][]>(existingFiles);
  const [isUploading, setIsUploading] = useState(false);

  const handleSessionCreated = (sessionId: string) => {
    setUploadSessionId(sessionId);
    onSessionReady?.(sessionId);
  };

  const handleFilesUploaded = (newFiles: FileUploadResponse['file_info'][]) => {
    // Filter out files that are already in the uploaded files to prevent duplicates
    const existingFileIds = new Set(uploadedFiles.map(f => f.id));
    const trulyNewFiles = newFiles.filter(file => !existingFileIds.has(file.id));
    
    const updatedFiles = [...uploadedFiles, ...trulyNewFiles];
    setUploadedFiles(updatedFiles);
    setIsUploading(false);
    
    if (onFilesChange) {
      onFilesChange(updatedFiles, uploadSessionId);
    }
  };

  const handleUploadProgress = (progress: number) => {
    setIsUploading(progress > 0 && progress < 100);
  };

  const handleFileDelete = (fileId: string) => {
    const updatedFiles = uploadedFiles.filter(file => file.id !== fileId);
    setUploadedFiles(updatedFiles);
    
    if (onFilesChange) {
      onFilesChange(updatedFiles, uploadSessionId);
    }
  };

  const remainingSlots = maxFiles ? maxFiles - uploadedFiles.length : undefined;
  const canUpload = !maxFiles || uploadedFiles.length < maxFiles;

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {showTitle && (
        <div>
          <h3>{title}</h3>
          {description && (
            <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
              {description}
            </Text>
          )}
          {maxFiles && (
            <Text type="secondary" style={{ fontSize: '14px' }}>
              {uploadedFiles.length} of {maxFiles} files uploaded
              {remainingSlots && remainingSlots > 0 && ` • ${remainingSlots} slots remaining`}
            </Text>
          )}
          {uploadSessionId && (
            <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: 4 }}>
              Session: {uploadSessionId.substring(0, 20)}...
            </Text>
          )}
        </div>
      )}

      {canUpload && (
        <Card title="Upload Files" size="small">
          <MultiFileUpload
            uploadSessionId={uploadSessionId}
            onFilesUploaded={handleFilesUploaded}
            onSessionCreated={handleSessionCreated}
            onUploadProgress={handleUploadProgress}
            disabled={disabled}
            maxCount={remainingSlots}
          />
        </Card>
      )}

      {!canUpload && maxFiles && (
        <Alert
          message={`Maximum ${maxFiles} files allowed`}
          description="Remove some files to upload new ones"
          type="info"
          showIcon
        />
      )}

      {uploadedFiles.length > 0 && (
        <>
          <Divider />
          <FileList
            files={uploadedFiles}
            onFileDelete={handleFileDelete}
            showDelete={!disabled}
            title="Uploaded Files"
            compact
          />
        </>
      )}

      {isUploading && (
        <Alert
          message="Upload in progress..."
          description="Please wait while your files are being uploaded"
          type="info"
          showIcon
        />
      )}
    </Space>
  );
}