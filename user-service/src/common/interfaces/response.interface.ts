export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message: string;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  limit: number;
  page: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// Helper function to create standardized responses
export function createResponse<T>(
  message: string,
  data?: T,
  meta?: PaginationMeta,
): ApiResponse<T> {
  return {
    success: true,
    message,
    data,
    meta,
  };
}

export function createErrorResponse(
  message: string,
  error?: string,
): ApiResponse {
  return {
    success: false,
    message,
    error,
  };
}