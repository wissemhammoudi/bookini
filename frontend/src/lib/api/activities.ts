import { apiClient } from '../api-client'
import type { ApiResponse } from './common-types'

export type ActivityItem = {
  id: string
  reservation_id: string
  title: string
  description: string | null
  created_at: string
}

export const listActivitiesByReservation = async (reservationId: string) => {
  const response = await apiClient.get<ApiResponse<ActivityItem[]>>(
    `/activities/reservation/${reservationId}`,
  )
  return response.data.data
}

export const createActivityRequest = async (payload: {
  reservation_id: string
  title: string
  description?: string
}) => {
  const response = await apiClient.post<ApiResponse<ActivityItem>>(
    '/activities',
    payload,
  )
  return response.data.data
}
