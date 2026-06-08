import { apiClient } from './api-client'
import type {
  ActivityItem,
  ApiResponse,
  AuthTokens,
  FloorItem,
  ReservationItem,
} from './api-types'

const unwrap = <T>(response: ApiResponse<T>) => response.data

export const loginRequest = async (payload: {
  email: string
  password: string
}) => {
  const response = await apiClient.post<ApiResponse<AuthTokens>>('/auth/login', payload)
  return unwrap(response.data)
}

export const registerRequest = async (payload: {
  full_name: string
  email: string
  password: string
}) => {
  const response = await apiClient.post<ApiResponse<AuthTokens>>(
    '/auth/register',
    payload,
  )
  return unwrap(response.data)
}

export const changePasswordRequest = async (payload: {
  current_password: string
  new_password: string
}) => {
  await apiClient.post<ApiResponse<Record<string, never>>>(
    '/auth/change-password',
    payload,
  )
}

export const listFloors = async (status?: string) => {
  const response = await apiClient.get<ApiResponse<FloorItem[]>>('/floors', {
    params: status ? { status } : undefined,
  })
  return unwrap(response.data)
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
  return unwrap(response.data)
}

export const listReservationHistory = async () => {
  const response = await apiClient.get<ApiResponse<ReservationItem[]>>(
    '/reservations/history',
  )
  return unwrap(response.data)
}

export const listCurrentReservations = async () => {
  const response = await apiClient.get<ApiResponse<ReservationItem[]>>(
    '/reservations/current',
  )
  return unwrap(response.data)
}

export const cancelReservationRequest = async (reservationId: string) => {
  const response = await apiClient.post<ApiResponse<ReservationItem>>(
    `/reservations/${reservationId}/cancel`,
  )
  return unwrap(response.data)
}

export const listActivitiesByReservation = async (reservationId: string) => {
  const response = await apiClient.get<ApiResponse<ActivityItem[]>>(
    `/activities/reservation/${reservationId}`,
  )
  return unwrap(response.data)
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
  return unwrap(response.data)
}
