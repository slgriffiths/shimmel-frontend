import { api } from '@/lib/api';
import { message } from 'antd';
import type {
  PresignedUrlResponse,
  FileUploadResponse,
  AttachFileRequest,
  AttachFileToSessionRequest,
  FileDownloadResponse,
} from '@/types/fileUpload';
import { FILE_UPLOAD_ENDPOINTS } from '@/constants/fileUpload';

export class FileUploadService {
  /**
   * Get presigned URL for S3 upload
   */
  static async getPresignedUrl(
    filename: string,
    contentType: string,
    uploadSessionId?: string
  ): Promise<PresignedUrlResponse> {
    try {
      const params: any = {
        filename: filename,
        content_type: contentType,
      };

      if (uploadSessionId) {
        params.upload_session_id = uploadSessionId;
      }

      const { data } = await api.get(FILE_UPLOAD_ENDPOINTS.PRESIGNED_URL, { params });
      return data;
    } catch (error) {
      console.error('Failed to get presigned URL:', error);
      throw new Error('Failed to get presigned URL');
    }
  }

  /**
   * Upload file directly to S3 using presigned URL
   */
  static async uploadToS3(
    file: File,
    presignedData: PresignedUrlResponse,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    const formData = new FormData();

    // Add all presigned POST fields
    Object.keys(presignedData.fields).forEach(fieldKey => {
      formData.append(fieldKey, presignedData.fields[fieldKey]);
    });

    // Add file last
    formData.append('file', file);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      if (onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            onProgress(progress);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`S3 upload failed: ${xhr.status}`));
        }
      };

      xhr.onerror = () => {
        reject(new Error('S3 upload failed due to network error'));
      };

      xhr.open('POST', presignedData.url);
      xhr.send(formData);
    });
  }

  /**
   * Attach uploaded file to upload session
   */
  static async attachToSession(
    attachData: AttachFileToSessionRequest
  ): Promise<FileUploadResponse & { session_id?: string }> {
    try {
      const payload: any = {
        s3_key: attachData.s3_key,
        filename: attachData.filename,
        content_type: attachData.content_type,
        file_size: attachData.file_size,
      };

      // Include session_id if provided, otherwise backend will create one
      if (attachData.upload_session_id) {
        payload.session_id = attachData.upload_session_id;
      }

      const { data } = await api.post(FILE_UPLOAD_ENDPOINTS.ATTACH_TO_SESSION, payload);
      return data;
    } catch (error) {
      console.error('Failed to attach file to session:', error);
      throw new Error('Failed to attach file to session');
    }
  }

  /**
   * Complete file upload process (presigned URL -> S3 upload -> attach to session)
   */
  static async uploadFileToSession(
    file: File,
    uploadSessionId?: string,
    onProgress?: (progress: number) => void
  ): Promise<FileUploadResponse & { session_id?: string }> {
    try {
      // Step 1: Get presigned URL
      onProgress?.(10);
      const presignedData = await this.getPresignedUrl(
        file.name,
        file.type,
        uploadSessionId
      );

      // Step 2: Upload to S3
      onProgress?.(20);
      await this.uploadToS3(file, presignedData, (progress) => {
        // Map S3 progress to 20-80% of overall progress
        const overallProgress = 20 + (progress * 0.6);
        onProgress?.(Math.round(overallProgress));
      });

      // Step 3: Attach to session
      onProgress?.(90);
      const result = await this.attachToSession({
        upload_session_id: uploadSessionId || '', // Backend will create if empty
        s3_key: presignedData.key,
        filename: file.name,
        content_type: file.type,
        file_size: file.size,
      });

      onProgress?.(100);
      return result;
    } catch (error) {
      console.error('File upload failed:', error);
      throw error;
    }
  }

  /**
   * Get download URL for a file
   */
  static async getDownloadUrl(fileId: string): Promise<string> {
    try {
      const { data }: { data: FileDownloadResponse } = await api.get(
        `${FILE_UPLOAD_ENDPOINTS.DOWNLOAD}/${fileId}`
      );
      return data.download_url;
    } catch (error) {
      console.error('Failed to get download URL:', error);
      throw new Error('Failed to get download URL');
    }
  }

  /**
   * Download a file
   */
  static async downloadFile(fileId: string, filename: string): Promise<void> {
    try {
      const downloadUrl = await this.getDownloadUrl(fileId);
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      message.success('Download started');
    } catch (error) {
      console.error('Download failed:', error);
      message.error('Download failed');
    }
  }
}