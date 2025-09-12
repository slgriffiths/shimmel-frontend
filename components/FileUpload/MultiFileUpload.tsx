'use client';

import { useState, useCallback } from 'react';
import { Upload, message, Progress } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { FileUploadService } from '@/services/fileUploadService';
import { validateFile, fileToUploadFile, isUploadComplete, getUploadedFiles } from '@/utils/fileUploadUtils';
import { generateUploadSessionId } from '@/utils/uploadSession';
import { ALLOWED_FILE_TYPES_ARRAY } from '@/constants/fileUpload';
import type { UploadFile, FileUploadResponse } from '@/types/fileUpload';

const { Dragger } = Upload;

interface MultiFileUploadProps {
  uploadSessionId?: string;
  onFilesUploaded?: (files: FileUploadResponse['file_info'][]) => void;
  onSessionCreated?: (sessionId: string) => void;
  onUploadProgress?: (progress: number) => void;
  disabled?: boolean;
  maxCount?: number;
}

export default function MultiFileUpload({ 
  uploadSessionId,
  onFilesUploaded,
  onSessionCreated,
  onUploadProgress,
  disabled = false,
  maxCount,
}: MultiFileUploadProps) {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>(uploadSessionId);

  const customRequest = useCallback(async ({ 
    file, 
    onSuccess, 
    onError, 
    onProgress 
  }: any) => {
    try {
      const uploadFile = file as File;
      
      const response = await FileUploadService.uploadFileToSession(
        uploadFile,
        currentSessionId,
        (progress) => {
          onProgress({ percent: progress });
        }
      );

      // If a new session was created, track it
      if (response.session_id && !currentSessionId) {
        setCurrentSessionId(response.session_id);
        onSessionCreated?.(response.session_id);
      }

      onSuccess(response, uploadFile);
      message.success(`${uploadFile.name} uploaded successfully`);
    } catch (error) {
      console.error('Upload error:', error);
      onError(error);
      message.error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [currentSessionId, onSessionCreated]);

  const handleChange = useCallback((info: any) => {
    const newFileList = [...info.fileList];
    
    // Update file list
    setFileList(newFileList);

    // Check if uploading
    const isCurrentlyUploading = newFileList.some(file => file.status === 'uploading');
    setUploading(isCurrentlyUploading);

    // Calculate overall progress
    if (onUploadProgress && newFileList.length > 0) {
      const totalProgress = newFileList.reduce((sum, file) => {
        return sum + (file.percent || 0);
      }, 0);
      const overallProgress = Math.round(totalProgress / newFileList.length);
      onUploadProgress(overallProgress);
    }

    // Check if all files are uploaded
    if (isUploadComplete(newFileList) && onFilesUploaded) {
      const uploadedFiles = getUploadedFiles(newFileList)
        .map(file => file.response?.file_info)
        .filter(Boolean);
      
      if (uploadedFiles.length > 0) {
        onFilesUploaded(uploadedFiles);
      }
    }
  }, [onFilesUploaded, onUploadProgress]);

  const beforeUpload = useCallback((file: File) => {
    // Validate file
    if (!validateFile(file)) {
      return Upload.LIST_IGNORE;
    }

    // Check max count
    if (maxCount && fileList.length >= maxCount) {
      message.error(`Maximum ${maxCount} files allowed`);
      return Upload.LIST_IGNORE;
    }

    return true;
  }, [fileList.length, maxCount]);

  const onRemove = useCallback((file: UploadFile) => {
    const newFileList = fileList.filter(item => item.uid !== file.uid);
    setFileList(newFileList);
    
    // Recalculate progress after removal
    if (onUploadProgress) {
      if (newFileList.length === 0) {
        onUploadProgress(0);
      } else {
        const totalProgress = newFileList.reduce((sum, f) => {
          return sum + (f.percent || 0);
        }, 0);
        const overallProgress = Math.round(totalProgress / newFileList.length);
        onUploadProgress(overallProgress);
      }
    }
  }, [fileList, onUploadProgress]);

  const uploadProps = {
    name: 'file',
    multiple: true,
    fileList,
    customRequest,
    onChange: handleChange,
    beforeUpload,
    onRemove,
    disabled: disabled || uploading,
    accept: ALLOWED_FILE_TYPES_ARRAY.join(','),
  };

  return (
    <div>
      <Dragger {...uploadProps}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">
          Click or drag files to this area to upload
        </p>
        <p className="ant-upload-hint">
          Supports PDF, Excel, Word, CSV, and TXT files. Maximum file size: 100MB
          {maxCount && ` • Maximum ${maxCount} files`}
        </p>
      </Dragger>
      
      {uploading && (
        <div style={{ marginTop: 16 }}>
          <Progress 
            percent={Math.round(
              fileList.reduce((sum, file) => sum + (file.percent || 0), 0) / 
              Math.max(fileList.length, 1)
            )}
            status="active"
            showInfo={false}
          />
          <div style={{ textAlign: 'center', marginTop: 8, color: '#666' }}>
            Uploading files...
          </div>
        </div>
      )}
    </div>
  );
}