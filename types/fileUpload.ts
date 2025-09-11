export interface PresignedUrlResponse {
  url: string;
  fields: Record<string, string>;
  key: string;
}

export interface FileUploadResponse {
  file_info: {
    id: string;
    filename: string;
    content_type: string;
    byte_size: number;
    human_size: string;
    checksum: string;
    created_at: string;
  };
  session_id?: string; // Returned when uploading to session
}

export interface AttachFileRequest {
  workflow_run_id: string;
  s3_key: string;
  filename: string;
  content_type: string;
  file_size: number;
}

export interface AttachFileToSessionRequest {
  upload_session_id: string;
  s3_key: string;
  filename: string;
  content_type: string;
  file_size: number;
}

export interface FileDownloadResponse {
  download_url: string;
}

export interface UploadFile extends File {
  uid: string;
  status?: 'uploading' | 'done' | 'error' | 'removed';
  percent?: number;
  response?: FileUploadResponse;
  error?: Error;
}

export interface FileUploadProgressEvent {
  percent: number;
  loaded: number;
  total: number;
}

export type FileUploadStatus = 'pending' | 'uploading' | 'done' | 'error' | 'removed';