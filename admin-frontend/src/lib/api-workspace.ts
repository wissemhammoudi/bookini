import { apiClient } from './api-client'
import type {
  AdminWorkspaceResponse,
  AdminWorkspaceSettings,
  ApiResponse,
  AvailabilitySlot,
  OrganizationRecord,
  PlaceRecord,
  UserRecord,
} from './api-types'
import { unwrap } from './api-utils'

export const getAdminWorkspace = async () => {
  const response = await apiClient.get<ApiResponse<AdminWorkspaceResponse>>('/admin/workspace')
  return unwrap(response.data)
}

export const createWorkspaceUser = async (payload: {
  full_name: string
  email: string
  phone: string
  role: 'SUPER_ADMIN' | 'ADMIN' | 'USER'
  status: 'ACTIVE' | 'SUSPENDED'
  organization_ids: string[]
}) => {
  const response = await apiClient.post<ApiResponse<UserRecord>>('/admin/workspace/users', payload)
  return unwrap(response.data)
}

export const updateWorkspaceUser = async (
  userId: string,
  payload: {
    full_name: string
    email: string
    phone: string
    role: 'SUPER_ADMIN' | 'ADMIN' | 'USER'
    status: 'ACTIVE' | 'SUSPENDED'
    organization_ids: string[]
  },
) => {
  const response = await apiClient.put<ApiResponse<UserRecord>>(`/admin/workspace/users/${userId}`, payload)
  return unwrap(response.data)
}

export const updateWorkspaceUserStatus = async (userId: string, statusValue: 'ACTIVE' | 'SUSPENDED') => {
  const response = await apiClient.patch<ApiResponse<UserRecord>>(`/admin/workspace/users/${userId}/status/${statusValue}`)
  return unwrap(response.data)
}

export const deleteWorkspaceUser = async (userId: string) => {
  await apiClient.delete(`/admin/workspace/users/${userId}`)
}

export const createWorkspaceOrganization = async (payload: {
  name: string
  description: string
  address: string
  contact_email: string
  contact_phone: string
  website?: string
  logo?: string
  cover_image?: string
  social_links: string[]
  status: 'ACTIVE' | 'SUSPENDED'
}) => {
  const response = await apiClient.post<ApiResponse<OrganizationRecord>>('/admin/workspace/organizations', payload)
  return unwrap(response.data)
}

export const updateWorkspaceOrganization = async (
  organizationId: string,
  payload: {
    name: string
    description: string
    address: string
    contact_email: string
    contact_phone: string
    website?: string
    logo?: string
    cover_image?: string
    social_links: string[]
    status: 'ACTIVE' | 'SUSPENDED'
  },
) => {
  const response = await apiClient.put<ApiResponse<OrganizationRecord>>(`/admin/workspace/organizations/${organizationId}`, payload)
  return unwrap(response.data)
}

export const updateWorkspaceOrganizationStatus = async (
  organizationId: string,
  statusValue: 'ACTIVE' | 'SUSPENDED',
) => {
  const response = await apiClient.patch<ApiResponse<OrganizationRecord>>(`/admin/workspace/organizations/${organizationId}/status/${statusValue}`)
  return unwrap(response.data)
}

export const deleteWorkspaceOrganization = async (organizationId: string) => {
  await apiClient.delete(`/admin/workspace/organizations/${organizationId}`)
}

export const createWorkspacePlace = async (payload: {
  organization_id: string
  name: string
  description: string
  category: string
  capacity: number
  address: string
  pricing: number
  availability: AvailabilitySlot[]
  cover_image?: string
  gallery: string[]
  features: string[]
  status: 'ACTIVE' | 'SUSPENDED'
}) => {
  const response = await apiClient.post<ApiResponse<PlaceRecord>>('/admin/workspace/places', payload)
  return unwrap(response.data)
}

export const updateWorkspacePlace = async (
  placeId: string,
  payload: {
    organization_id: string
    name: string
    description: string
    category: string
    capacity: number
    address: string
    pricing: number
    availability: AvailabilitySlot[]
    cover_image?: string
    gallery: string[]
    features: string[]
    status: 'ACTIVE' | 'SUSPENDED'
  },
) => {
  const response = await apiClient.put<ApiResponse<PlaceRecord>>(`/admin/workspace/places/${placeId}`, payload)
  return unwrap(response.data)
}

export const deleteWorkspacePlace = async (placeId: string) => {
  await apiClient.delete(`/admin/workspace/places/${placeId}`)
}

export const updateWorkspaceSettings = async (payload: AdminWorkspaceSettings) => {
  const response = await apiClient.put<ApiResponse<AdminWorkspaceSettings>>('/admin/workspace/settings', payload)
  return unwrap(response.data)
}
