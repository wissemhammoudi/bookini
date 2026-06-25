import { apiClient } from './api-client'
import type { ApiResponse, ContactRequestRecord, FloorRecord, ReservationRecord } from './api-types'
import { unwrap } from './api-utils'

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
  reservation_areas: Array<string | {
    name: string
    price: number
    includes: string[]
    is_reservable: boolean
    geometry?: { x?: number; y?: number; w?: number; h?: number; rotation?: number; type?: string }
  }>
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
    reservation_areas: Array<string | {
      name: string
      price: number
      includes: string[]
      is_reservable: boolean
      geometry?: { x?: number; y?: number; w?: number; h?: number; rotation?: number; type?: string }
    }>
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
