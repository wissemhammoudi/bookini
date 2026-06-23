import { apiClient } from '../api-client'
import type { ApiResponse } from './common-types'

export type AdminProfile = {
  admin: {
    id: string
    full_name: string
    email: string
    avatar_url: string | null
    role: 'ADMIN' | 'SUPER_ADMIN'
  }
  average_rating: number
  rating_count: number
  spaces: Array<{
    id: string
    admin_id: string | null
    name: string
    capacity: number
    building: string
    floor_number: number
    location: string
    description: string | null
    status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE'
    is_deleted: boolean
    average_rating: number
    rating_count: number
    cover_image?: string | null
  }>
}

export type AdminRating = {
  id: string
  admin_id: string
  user_id: string
  rating: number
  comment: string | null
  created_at: string
  updated_at: string
}

export type AdminRatingsResponse = {
  average_rating: number
  rating_count: number
  items: AdminRating[]
  pagination: {
    limit: number
    offset: number
    returned: number
  }
  filters: {
    min_rating: number | null
    max_rating: number | null
  }
}

export type FloorReview = {
  id: string
  floor_id: string
  user_id: string
  rating: number
  comment: string | null
  created_at: string
  updated_at: string
}

export type FloorReviewsResponse = {
  average_rating: number
  rating_count: number
  reviews: FloorReview[]
  pagination: {
    limit: number
    offset: number
    returned: number
  }
  filters: {
    min_rating: number | null
    max_rating: number | null
  }
}

export const getAdminProfile = async (adminId: string) => {
  const response = await apiClient.get<ApiResponse<AdminProfile>>(
    `/admins/${adminId}/profile`,
  )
  return response.data.data
}

export const listAdminRatings = async (
  adminId: string,
  params?: {
    limit?: number
    offset?: number
    min_rating?: number
    max_rating?: number
  },
) => {
  const response = await apiClient.get<ApiResponse<AdminRatingsResponse>>(
    `/admins/${adminId}/ratings`,
    { params },
  )
  return response.data.data
}

export const upsertMyAdminRating = async (
  adminId: string,
  payload: { rating: number; comment?: string },
) => {
  const response = await apiClient.post<ApiResponse<AdminRating>>(
    `/admins/${adminId}/ratings/me`,
    payload,
  )
  return response.data.data
}

export const deleteMyAdminRating = async (adminId: string) => {
  await apiClient.delete<ApiResponse<Record<string, never>>>(
    `/admins/${adminId}/ratings/me`,
  )
}

export const listFloorReviews = async (
  floorId: string,
  params?: {
    limit?: number
    offset?: number
    min_rating?: number
    max_rating?: number
  },
) => {
  const response = await apiClient.get<ApiResponse<FloorReviewsResponse>>(
    `/floors/${floorId}/reviews`,
    { params },
  )
  return response.data.data
}

export const upsertMyFloorReview = async (
  floorId: string,
  payload: { rating: number; comment?: string },
) => {
  const response = await apiClient.post<ApiResponse<FloorReview>>(
    `/floors/${floorId}/reviews/me`,
    payload,
  )
  return response.data.data
}

export const deleteMyFloorReview = async (floorId: string) => {
  await apiClient.delete<ApiResponse<Record<string, never>>>(
    `/floors/${floorId}/reviews/me`,
  )
}
