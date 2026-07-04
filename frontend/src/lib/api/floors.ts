import { apiClient } from '../api-client'
import type { ApiResponse } from './common-types'

export type FloorItem = {
  id: string
  name: string
  capacity: number
  building: string
  floor_number: number
  location: string
  description: string | null
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE'
  is_deleted: boolean
}

export const listFloors = async (status?: string) => {
  const response = await apiClient.get<ApiResponse<FloorItem[]>>('/floors', {
    params: status ? { status } : undefined,
  })
  return response.data.data
}
