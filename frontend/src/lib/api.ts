import { apiClient } from './api-client'
import type {
  AdminDashboard,
  AdminUser,
  ActivityItem,
  AuditLogItem,
  ApiResponse,
  AuthTokens,
  FloorItem,
  NamedChartSeries,
  OccupancyMetrics,
  ReservationItem,
  StatisticsSummary,
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

export const getAdminDashboard = async () => {
  const response = await apiClient.get<ApiResponse<AdminDashboard>>('/admin/dashboard')
  return unwrap(response.data)
}

export const getSuperAdminSettings = async () => {
  const response = await apiClient.get<ApiResponse<AdminDashboard>>(
    '/admin/super-admin/settings',
  )
  return unwrap(response.data)
}

export const listAdminReservations = async () => {
  const response = await apiClient.get<ApiResponse<ReservationItem[]>>(
    '/admin/reservations',
  )
  return unwrap(response.data)
}

export const getOccupancyMetrics = async () => {
  const response = await apiClient.get<ApiResponse<OccupancyMetrics>>(
    '/statistics/occupancy',
  )
  return unwrap(response.data)
}

export const getStatisticsSummary = async () => {
  const response = await apiClient.get<ApiResponse<StatisticsSummary>>(
    '/statistics/summary',
  )
  return unwrap(response.data)
}

export const getMostReservedRooms = async () => {
  const response = await apiClient.get<ApiResponse<NamedChartSeries>>(
    '/statistics/most-reserved-rooms',
  )
  return unwrap(response.data)
}

export const getPeakHours = async () => {
  const response = await apiClient.get<ApiResponse<NamedChartSeries>>(
    '/statistics/peak-hours',
  )
  return unwrap(response.data)
}

export const listAuditLogs = async (limit = 50) => {
  const response = await apiClient.get<ApiResponse<AuditLogItem[]>>(
    '/admin/audit-logs',
    {
      params: { limit },
    },
  )
  return unwrap(response.data)
}

export const listAdmins = async () => {
  const response = await apiClient.get<ApiResponse<AdminUser[]>>('/admin/admins')
  return unwrap(response.data)
}

export const updateAdminRole = async (payload: {
  email: string
  role: 'ADMIN' | 'SUPER_ADMIN'
}) => {
  const response = await apiClient.patch<
    ApiResponse<{ id: string; email: string; role: 'ADMIN' | 'SUPER_ADMIN' }>
  >('/admin/admins/role', payload)
  return unwrap(response.data)
}

export const requestPasswordReset = async (payload: { email: string }) => {
  const response = await apiClient.post<ApiResponse<{ reset_token?: string }>>(
    '/auth/password-reset/request',
    payload,
  )
  return unwrap(response.data)
}

export const confirmPasswordReset = async (payload: {
  token: string
  new_password: string
}) => {
  const response = await apiClient.post<ApiResponse<Record<string, never>>>(
    '/auth/password-reset/confirm',
    payload,
  )
  return unwrap(response.data)
}

