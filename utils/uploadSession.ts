/**
 * Generate a unique upload session ID for temporary file storage
 */
export const generateUploadSessionId = (): string => {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 15);
  return `session_${timestamp}_${randomStr}`;
};

/**
 * Validate upload session ID format
 */
export const isValidUploadSessionId = (sessionId: string): boolean => {
  const pattern = /^session_\d+_[a-z0-9]+$/;
  return pattern.test(sessionId);
};

/**
 * Extract timestamp from upload session ID
 */
export const getSessionTimestamp = (sessionId: string): number | null => {
  const match = sessionId.match(/^session_(\d+)_/);
  return match ? parseInt(match[1], 10) : null;
};

/**
 * Check if upload session is expired (older than 48 hours)
 */
export const isSessionExpired = (sessionId: string, maxAgeHours: number = 48): boolean => {
  const timestamp = getSessionTimestamp(sessionId);
  if (!timestamp) return true;
  
  const maxAge = maxAgeHours * 60 * 60 * 1000; // Convert to milliseconds
  return Date.now() - timestamp > maxAge;
};