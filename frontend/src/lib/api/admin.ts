import { apiClient } from '../api-client'
import type { ApiResponse } from './common-types'
import type { FloorItem } from './floors'
import type { ReservationItem } from './reservations'

export type AdminDashboard = {
  role: string
  permissions_scope: string
  total_admin_users: number
}

export type AdminUser = {
  id: string
  full_name: string
  email: string
  role: 'ADMIN' | 'SUPER_ADMIN'
  is_active: boolean
}

export type AuditLogItem = {
  id: string
  user_id: string
  action: string
  ip_address: string
  metadata: Record<string, unknown>
  timestamp: string
}

export const getAdminDashboard = async () => {
  const response = await apiClient.get<ApiResponse<AdminDashboard>>('/admin/dashboard')
  return response.data.data
}

export const getSuperAdminSettings = async () => {
  const response = await apiClient.get<ApiResponse<AdminDashboard>>(
    '/admin/super-admin/settings',
  )
  return response.data.data
}

export const listAdminReservations = async () => {
  const response = await apiClient.get<ApiResponse<ReservationItem[]>>(
    '/admin/reservations',
  )
  return response.data.data
}

export const listAuditLogs = async (limit = 50) => {
  const response = await apiClient.get<ApiResponse<AuditLogItem[]>>(
    '/admin/audit-logs',
    {
      params: { limit },
    },
  )
  return response.data.data
}

export const listAdmins = async () => {
  const response = await apiClient.get<ApiResponse<AdminUser[]>>('/admin/admins')
  return response.data.data
}

export const updateAdminRole = async (payload: {
  email: string
  role: 'ADMIN' | 'SUPER_ADMIN'
}) => {
  const response = await apiClient.patch<
    ApiResponse<{ id: string; email: string; role: 'ADMIN' | 'SUPER_ADMIN' }>
  >('/admin/admins/role', payload)
  return response.data.data
}
