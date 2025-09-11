import { message } from 'antd';
import { 
  FilePdfOutlined,
  FileExcelOutlined,
  FileWordOutlined,
  FileTextOutlined,
  FileOutlined,
} from '@ant-design/icons';
import { 
  ALLOWED_FILE_TYPES_ARRAY, 
  MAX_FILE_SIZE_BYTES, 
  FILE_TYPE_NAMES,
  ALLOWED_FILE_TYPES,
} from '@/constants/fileUpload';
import type { UploadFile } from '@/types/fileUpload';

/**
 * Validate file type
 */
export const validateFileType = (file: File): boolean => {
  if (!ALLOWED_FILE_TYPES_ARRAY.includes(file.type as any)) {
    message.error(
      `File type "${file.type}" is not allowed. Supported types: PDF, Excel, Word, CSV, TXT`
    );
    return false;
  }
  return true;
};

/**
 * Validate file size
 */
export const validateFileSize = (file: File): boolean => {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    message.error(
      `File "${file.name}" is too large. Maximum size is 100MB.`
    );
    return false;
  }
  return true;
};

/**
 * Validate file before upload
 */
export const validateFile = (file: File): boolean => {
  return validateFileType(file) && validateFileSize(file);
};

/**
 * Get file type name for display
 */
export const getFileTypeName = (contentType: string): string => {
  return FILE_TYPE_NAMES[contentType as keyof typeof FILE_TYPE_NAMES] || 'Unknown';
};

/**
 * Format file size for human reading
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Get file icon component based on content type
 */
export const getFileIconComponent = (contentType: string) => {
  switch (contentType) {
    case ALLOWED_FILE_TYPES.PDF:
      return FilePdfOutlined;
    case ALLOWED_FILE_TYPES.EXCEL_XLS:
    case ALLOWED_FILE_TYPES.EXCEL_XLSX:
      return FileExcelOutlined;
    case ALLOWED_FILE_TYPES.WORD_DOC:
    case ALLOWED_FILE_TYPES.WORD_DOCX:
      return FileWordOutlined;
    case ALLOWED_FILE_TYPES.CSV:
    case ALLOWED_FILE_TYPES.TXT:
      return FileTextOutlined;
    default:
      return FileOutlined;
  }
};

/**
 * Get file color theme based on content type
 */
export const getFileColorTheme = (contentType: string): { background: string; color: string } => {
  switch (contentType) {
    case ALLOWED_FILE_TYPES.PDF:
      return { background: '#ff4d4f', color: '#fff' };
    case ALLOWED_FILE_TYPES.EXCEL_XLS:
    case ALLOWED_FILE_TYPES.EXCEL_XLSX:
      return { background: '#52c41a', color: '#fff' };
    case ALLOWED_FILE_TYPES.WORD_DOC:
    case ALLOWED_FILE_TYPES.WORD_DOCX:
      return { background: '#1890ff', color: '#fff' };
    case ALLOWED_FILE_TYPES.CSV:
      return { background: '#faad14', color: '#fff' };
    case ALLOWED_FILE_TYPES.TXT:
      return { background: '#8c8c8c', color: '#fff' };
    default:
      return { background: '#d9d9d9', color: '#262626' };
  }
};

/**
 * Generate unique file ID
 */
export const generateFileId = (): string => {
  return `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Convert File to UploadFile
 */
export const fileToUploadFile = (file: File): UploadFile => {
  const uploadFile = file as UploadFile;
  uploadFile.uid = generateFileId();
  uploadFile.status = 'pending';
  uploadFile.percent = 0;
  return uploadFile;
};

/**
 * Check if file upload is completed
 */
export const isUploadComplete = (fileList: UploadFile[]): boolean => {
  return fileList.every(file => 
    file.status === 'done' || file.status === 'error' || file.status === 'removed'
  );
};

/**
 * Get successfully uploaded files
 */
export const getUploadedFiles = (fileList: UploadFile[]): UploadFile[] => {
  return fileList.filter(file => file.status === 'done' && file.response);
};

/**
 * Get upload progress for all files
 */
export const getOverallProgress = (fileList: UploadFile[]): number => {
  if (fileList.length === 0) return 0;
  
  const totalProgress = fileList.reduce((sum, file) => {
    return sum + (file.percent || 0);
  }, 0);
  
  return Math.round(totalProgress / fileList.length);
};