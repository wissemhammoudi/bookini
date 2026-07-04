import { apiClient } from './api-client'
import type {
  AdminDashboard,
  AdminUser,
  ApiResponse,
  AuditLogItem,
  NamedChartSeries,
  OccupancyMetrics,
  ReservationItem,
  RecentActivity,
  StatisticsSummary,
} from './api-types'
import { unwrap } from './api-utils'

export const getAdminDashboard = async () => {
  const response = await apiClient.get<ApiResponse<AdminDashboard>>('/admin/dashboard')
  return unwrap(response.data)
}

export const getSuperAdminSettings = async () => {
  const response = await apiClient.get<ApiResponse<AdminDashboard>>('/admin/super-admin/settings')
  return unwrap(response.data)
}

export const listAdminReservations = async () => {
  const response = await apiClient.get<ApiResponse<ReservationItem[]>>('/admin/reservations')
  return unwrap(response.data)
}

export const getOccupancyMetrics = async () => {
  const response = await apiClient.get<ApiResponse<OccupancyMetrics>>('/statistics/occupancy')
  return unwrap(response.data)
}

export const getStatisticsSummary = async () => {
  const response = await apiClient.get<ApiResponse<StatisticsSummary>>('/statistics/summary')
  return unwrap(response.data)
}

export const getMostReservedRooms = async () => {
  const response = await apiClient.get<ApiResponse<NamedChartSeries>>('/statistics/most-reserved-rooms')
  return unwrap(response.data)
}

export const getPeakHours = async () => {
  const response = await apiClient.get<ApiResponse<NamedChartSeries>>('/statistics/peak-hours')
  return unwrap(response.data)
}

export const listAuditLogs = async (limit = 50) => {
  const response = await apiClient.get<ApiResponse<AuditLogItem[]>>('/admin/audit-logs', {
    params: { limit },
  })
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
  const response = await apiClient.patch<ApiResponse<{ id: string; email: string; role: 'ADMIN' | 'SUPER_ADMIN' }>>('/admin/admins/role', payload)
  return unwrap(response.data)
}

export const getWorkspaceAuditLogs = async () => {
  const response = await apiClient.get<ApiResponse<RecentActivity[]>>('/admin/workspace/audit-logs')
  return unwrap(response.data)
}
