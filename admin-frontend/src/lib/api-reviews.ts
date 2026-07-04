import { apiClient } from './api-client'
import type {
  AdminPublicProfile,
  AdminRatingRecord,
  AdminRatingsPayload,
  ApiResponse,
  FloorReviewRecord,
  FloorReviewsPayload,
} from './api-types'
import { unwrap } from './api-utils'

export const getAdminPublicProfile = async (adminId: string) => {
  const response = await apiClient.get<ApiResponse<AdminPublicProfile>>(`/admins/${adminId}/profile`)
  return unwrap(response.data)
}

export const listAdminRatingsByAdmin = async (
  adminId: string,
  params?: { limit?: number; offset?: number; min_rating?: number; max_rating?: number },
) => {
  const response = await apiClient.get<ApiResponse<AdminRatingsPayload>>(`/admins/${adminId}/ratings`, { params })
  return unwrap(response.data)
}

export const upsertMyAdminRating = async (
  adminId: string,
  payload: { rating: number; comment?: string },
) => {
  const response = await apiClient.post<ApiResponse<AdminRatingRecord>>(`/admins/${adminId}/ratings/me`, payload)
  return unwrap(response.data)
}

export const deleteMyAdminRating = async (adminId: string) => {
  await apiClient.delete<ApiResponse<Record<string, never>>>(`/admins/${adminId}/ratings/me`)
}

export const listFloorReviewsByFloor = async (
  floorId: string,
  params?: { limit?: number; offset?: number; min_rating?: number; max_rating?: number },
) => {
  const response = await apiClient.get<ApiResponse<FloorReviewsPayload>>(`/floors/${floorId}/reviews`, { params })
  return unwrap(response.data)
}

export const upsertMyFloorReview = async (
  floorId: string,
  payload: { rating: number; comment?: string },
) => {
  const response = await apiClient.post<ApiResponse<FloorReviewRecord>>(`/floors/${floorId}/reviews/me`, payload)
  return unwrap(response.data)
}

export const deleteMyFloorReview = async (floorId: string) => {
  await apiClient.delete<ApiResponse<Record<string, never>>>(`/floors/${floorId}/reviews/me`)
}
