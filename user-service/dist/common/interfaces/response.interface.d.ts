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
export declare function createResponse<T>(message: string, data?: T, meta?: PaginationMeta): ApiResponse<T>;
export declare function createErrorResponse(message: string, error?: string): ApiResponse;
