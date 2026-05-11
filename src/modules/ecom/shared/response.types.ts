export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: ApiError
  meta?: PaginationMeta
}

export interface ApiError {
  code: string
  message: string
  details?: unknown
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}
