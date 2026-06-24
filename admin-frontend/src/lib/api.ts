import { apiClient } from './api-client'
import type {
  AdminWorkspaceResponse,
  AdminWorkspaceSettings,
  AdminDashboard,
  AdminUser,
  ActivityItem,
  AvailabilitySlot,
  AdminPublicProfile,
  AdminRatingsPayload,
  AdminRatingRecord,
  AuditLogItem,
  ApiResponse,
  AuthTokens,
  ContactRequestRecord,
  CurrentUserProfile,
  FloorRecord,
  FloorReviewRecord,
  FloorReviewsPayload,
  FloorItem,
  NamedChartSeries,
  OrganizationRecord,
  OccupancyMetrics,
  PlaceRecord,
  ReservationItem,
  ReservationRecord,
  StatisticsSummary,
  UserRecord,
  RecentActivity,
} from './api-types'

const unwrap = <T>(response: ApiResponse<T>) => response.data

export const loginRequest = async (payload: {
  email: string
  password: string
}) => {
  const response = await apiClient.post<ApiResponse<AuthTokens>>('/auth/login', payload)
  return unwrap(response.data)
}

export const getCurrentUserProfile = async () => {
  const response = await apiClient.get<ApiResponse<CurrentUserProfile>>('/auth/me')
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

export const getAdminPublicProfile = async (adminId: string) => {
  const response = await apiClient.get<ApiResponse<AdminPublicProfile>>(
    `/admins/${adminId}/profile`,
  )
  return unwrap(response.data)
}

export const listAdminRatingsByAdmin = async (
  adminId: string,
  params?: {
    limit?: number
    offset?: number
    min_rating?: number
    max_rating?: number
  },
) => {
  const response = await apiClient.get<ApiResponse<AdminRatingsPayload>>(
    `/admins/${adminId}/ratings`,
    { params },
  )
  return unwrap(response.data)
}

export const upsertMyAdminRating = async (
  adminId: string,
  payload: { rating: number; comment?: string },
) => {
  const response = await apiClient.post<ApiResponse<AdminRatingRecord>>(
    `/admins/${adminId}/ratings/me`,
    payload,
  )
  return unwrap(response.data)
}

export const deleteMyAdminRating = async (adminId: string) => {
  await apiClient.delete<ApiResponse<Record<string, never>>>(
    `/admins/${adminId}/ratings/me`,
  )
}

export const listFloorReviewsByFloor = async (
  floorId: string,
  params?: {
    limit?: number
    offset?: number
    min_rating?: number
    max_rating?: number
  },
) => {
  const response = await apiClient.get<ApiResponse<FloorReviewsPayload>>(
    `/floors/${floorId}/reviews`,
    { params },
  )
  return unwrap(response.data)
}

export const upsertMyFloorReview = async (
  floorId: string,
  payload: { rating: number; comment?: string },
) => {
  const response = await apiClient.post<ApiResponse<FloorReviewRecord>>(
    `/floors/${floorId}/reviews/me`,
    payload,
  )
  return unwrap(response.data)
}

export const deleteMyFloorReview = async (floorId: string) => {
  await apiClient.delete<ApiResponse<Record<string, never>>>(
    `/floors/${floorId}/reviews/me`,
  )
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

export const getAdminWorkspace = async () => {
  const response = await apiClient.get<ApiResponse<AdminWorkspaceResponse>>('/admin/workspace')
  return unwrap(response.data)
}

export const getWorkspaceAuditLogs = async () => {
  const response = await apiClient.get<ApiResponse<RecentActivity[]>>('/admin/workspace/audit-logs')
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

export const createWorkspaceFloor = async (payload: {
  place_id: string
  floor_name: string
  floor_number: number
  floor_size_sqm: number
  floor_shape: 'SQUARE' | 'RECTANGLE' | 'L_SHAPE' | 'CUSTOM_POLYGON'
  capacity: number
  pricing: number
  description: string
  blueprint_image?: string
  reservation_areas: Array<string | { name: string; price: number; includes: string[]; is_reservable: boolean; geometry?: { x?: number; y?: number; w?: number; h?: number; rotation?: number; type?: string } }>
  status: 'ACTIVE' | 'SUSPENDED'
}) => {
  const response = await apiClient.post<ApiResponse<FloorRecord>>('/admin/workspace/floors', payload)
  return unwrap(response.data)
}

export const updateWorkspaceFloor = async (
  floorId: string,
  payload: {
    place_id: string
    floor_name: string
    floor_number: number
    floor_size_sqm: number
    floor_shape: 'SQUARE' | 'RECTANGLE' | 'L_SHAPE' | 'CUSTOM_POLYGON'
    capacity: number
    pricing: number
    description: string
    blueprint_image?: string
    reservation_areas: Array<string | { name: string; price: number; includes: string[]; is_reservable: boolean; geometry?: { x?: number; y?: number; w?: number; h?: number; rotation?: number; type?: string } }>
    status: 'ACTIVE' | 'SUSPENDED'
  },
) => {
  const response = await apiClient.put<ApiResponse<FloorRecord>>(`/admin/workspace/floors/${floorId}`, payload)
  return unwrap(response.data)
}

export const deleteWorkspaceFloor = async (floorId: string) => {
  await apiClient.delete(`/admin/workspace/floors/${floorId}`)
}

export const updateWorkspaceReservation = async (
  reservationId: string,
  statusValue: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED',
) => {
  const response = await apiClient.patch<ApiResponse<ReservationRecord>>(`/admin/workspace/reservations/${reservationId}`, {
    status: statusValue,
  })
  return unwrap(response.data)
}

export const updateWorkspaceContactRequest = async (
  requestId: string,
  statusValue: 'PENDING' | 'PROCESSED',
) => {
  const response = await apiClient.patch<ApiResponse<ContactRequestRecord>>(`/admin/workspace/contact-requests/${requestId}`, {
    status: statusValue,
  })
  return unwrap(response.data)
}

export const deleteWorkspaceContact = async (requestId: string) => {
  await apiClient.delete(`/admin/workspace/contact-requests/${requestId}`)
}


export const updateWorkspaceSettings = async (payload: AdminWorkspaceSettings) => {
  const response = await apiClient.put<ApiResponse<AdminWorkspaceSettings>>('/admin/workspace/settings', payload)
  return unwrap(response.data)
}

export const uploadImageRequest = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  const response = await apiClient.post<ApiResponse<{ url: string }>>(
    '/auth/upload',
    formData,
    {
      timeout: 60000,
      headers: {
        'Content-Type': undefined,
      },
    },
  )
  return unwrap(response.data)
}
