import type { ApiResponse } from './api-types'

export const unwrap = <T>(response: ApiResponse<T>) => response.data
