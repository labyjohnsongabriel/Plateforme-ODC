export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  message?: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  success: false;
  error: {
    name: string;
    message: string;
    code: string | null;
    statusCode: number;
    timestamp: string;
    details?: any;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'ASC' | 'DESC';
}