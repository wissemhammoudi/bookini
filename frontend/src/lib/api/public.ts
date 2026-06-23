import { apiClient } from '../api-client'
import type { ApiResponse } from './common-types'

export type PublicBookingCreatePayload = {
  room_id: number
  room_name: string
  plan_id: string
  guest_name: string
  guest_email: string
  guest_phone: string
  booking_date: string
  start_time: string
  end_time: string
  participants: number
  notes?: string
  price: number
}

export type PublicFloor = {
  id: string
  floor_name: string
  floor_number: number
  capacity: number
  description: string
  status: string
  reservation_areas: string[]
}

export type PublicRoom = {
  id: number
  admin_id?: string | null
  average_rating?: number
  rating_count?: number
  name: string
  description?: string
  capacity: number
  price: number
  address?: string
  availability?: string
  amenities: string[]
  features?: string[]
  image: string
  cover_image?: string | null
  gallery?: string[]
  video_url?: string | null
  organization_id?: string
  organization_name?: string
  floors?: PublicFloor[]
}

export type PublicBookingCreateResponse = {
  id: string
  booking_reference: string
  status: string
}

export type PublicBookingDetails = {
  id: string
  booking_reference: string
  room_name: string
  booking_date: string
  start_time: string
  end_time: string
  guest_name: string
  guest_email: string
  guest_phone: string
  participants: number
  notes: string | null
  price: number
  status: string
  created_at: string
}

export type PublicBookingListItem = {
  id: string
  booking_reference: string
  room_name: string
  booking_date: string
  status: string
  price: number
}

export type PublicBookingCalendarSlot = {
  id: string
  booking_reference: string
  room_id: number
  room_name: string
  booking_date: string
  start_time: string
  end_time: string
  status: string
}

export type PartnershipRequestCreatePayload = {
  company_name: string
  contact_person: string
  contact_email: string
  contact_phone: string
  number_of_floors: number
  expected_users: number
  description: string
}

export type PartnershipRequestCreateResponse = {
  id: string
  company_name: string
  status: string
}

export type PartnershipRequestDetails = {
  id: string
  company_name: string
  contact_person: string
  contact_email: string
  contact_phone: string
  number_of_floors: number
  expected_users: number
  description: string
  status: string
  created_at: string
}

export type ContactRequestCreatePayload = {
  full_name: string
  email: string
  phone: string
  subject: string
  message: string
}

export type ContactRequestCreateResponse = {
  id: string
  status: string
}

export const createPublicBookingRequest = async (payload: PublicBookingCreatePayload) => {
  const response = await apiClient.post<ApiResponse<PublicBookingCreateResponse>>(
    '/public/bookings',
    payload,
  )
  return response.data.data
}

export const listPublicRooms = async () => {
  const response = await apiClient.get<ApiResponse<PublicRoom[]>>('/public/rooms')
  return response.data.data
}

export const getPublicBookingByReference = async (reference: string) => {
  const response = await apiClient.get<ApiResponse<PublicBookingDetails>>(
    `/public/bookings/${reference}`,
  )
  return response.data.data
}

export const listPublicBookingsByEmail = async (email: string) => {
  const response = await apiClient.get<ApiResponse<PublicBookingListItem[]>>('/public/bookings', {
    params: { email },
  })
  return response.data.data
}

export const listPublicBookingCalendarSlots = async (params: {
  room_id: number
  start_date: string
  end_date: string
}) => {
  const response = await apiClient.get<ApiResponse<PublicBookingCalendarSlot[]>>(
    '/public/bookings/calendar',
    { params },
  )
  return response.data.data
}

export const createPartnershipRequest = async (payload: PartnershipRequestCreatePayload) => {
  const response = await apiClient.post<ApiResponse<PartnershipRequestCreateResponse>>(
    '/partners/request',
    payload,
  )
  return response.data.data
}

export const createContactRequest = async (payload: ContactRequestCreatePayload) => {
  const response = await apiClient.post<ApiResponse<ContactRequestCreateResponse>>(
    '/public/contact-requests',
    payload,
  )
  return response.data.data
}

export const getPartnershipRequest = async (requestId: string) => {
  const response = await apiClient.get<ApiResponse<PartnershipRequestDetails>>(
    `/partners/request/${requestId}`,
  )
  return response.data.data
}
