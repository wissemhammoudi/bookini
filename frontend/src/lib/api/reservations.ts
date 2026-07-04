import { apiClient } from '../api-client'
import type { ApiResponse } from './common-types'

export type ReservationItem = {
  id: string
  user_id: string
  floor_id: string
  start_time: string
  end_time: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
}

export const createReservationRequest = async (payload: {
  floor_id: string
  start_time: string
  end_time: string
}) => {
  const response = await apiClient.post<ApiResponse<ReservationItem>>(
    '/reservations',
    payload,
  )
  return response.data.data
}

export const listReservationHistory = async () => {
  const response = await apiClient.get<ApiResponse<ReservationItem[]>>(
    '/reservations/history',
  )
  return response.data.data
}

export const listCurrentReservations = async () => {
  const response = await apiClient.get<ApiResponse<ReservationItem[]>>(
    '/reservations/current',
  )
  return response.data.data
}

export const cancelReservationRequest = async (reservationId: string) => {
  const response = await apiClient.post<ApiResponse<ReservationItem>>(
    `/reservations/${reservationId}/cancel`,
  )
  return response.data.data
}
