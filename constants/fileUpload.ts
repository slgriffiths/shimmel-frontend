export const ALLOWED_FILE_TYPES = {
  PDF: 'application/pdf',
  CSV: 'text/csv',
  TXT: 'text/plain',
  EXCEL_XLS: 'application/vnd.ms-excel',
  EXCEL_XLSX: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  WORD_DOC: 'application/msword',
  WORD_DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
} as const;

export const ALLOWED_FILE_TYPES_ARRAY = Object.values(ALLOWED_FILE_TYPES);

export const FILE_EXTENSIONS = {
  [ALLOWED_FILE_TYPES.PDF]: '.pdf',
  [ALLOWED_FILE_TYPES.CSV]: '.csv',
  [ALLOWED_FILE_TYPES.TXT]: '.txt',
  [ALLOWED_FILE_TYPES.EXCEL_XLS]: '.xls',
  [ALLOWED_FILE_TYPES.EXCEL_XLSX]: '.xlsx',
  [ALLOWED_FILE_TYPES.WORD_DOC]: '.doc',
  [ALLOWED_FILE_TYPES.WORD_DOCX]: '.docx',
} as const;

export const FILE_TYPE_NAMES = {
  [ALLOWED_FILE_TYPES.PDF]: 'PDF Document',
  [ALLOWED_FILE_TYPES.CSV]: 'CSV File',
  [ALLOWED_FILE_TYPES.TXT]: 'Text File',
  [ALLOWED_FILE_TYPES.EXCEL_XLS]: 'Excel Spreadsheet',
  [ALLOWED_FILE_TYPES.EXCEL_XLSX]: 'Excel Spreadsheet',
  [ALLOWED_FILE_TYPES.WORD_DOC]: 'Word Document',
  [ALLOWED_FILE_TYPES.WORD_DOCX]: 'Word Document',
} as const;

export const MAX_FILE_SIZE_MB = 100;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export const UPLOAD_STATUS = {
  PENDING: 'pending',
  UPLOADING: 'uploading',
  DONE: 'done',
  ERROR: 'error',
  REMOVED: 'removed',
} as const;

export const FILE_UPLOAD_ENDPOINTS = {
  PRESIGNED_URL: '/file_uploads/presigned_url',
  ATTACH_TO_SESSION: '/file_uploads/attach_to_session',
  DOWNLOAD: '/file_uploads/download',
} as const;