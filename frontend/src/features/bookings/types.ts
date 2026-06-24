/**
 * Type definitions for booking features
 */

export interface BookingFormData {
  guestName: string
  guestEmail: string
  guestPhone: string
  bookingDate: string
  startTime: string
  endTime: string
  participants: string
  notes: string
}

export interface BookingPayload extends BookingFormData {
  roomId: number
  floorId?: string
  roomKey?: string
  bookingType?: 'WHOLE_FLOOR' | 'SELECTED_AREAS'
  selectedAreaKeys?: string[]
  roomName: string
  planId: string
  price: number
}

export interface BookingConfirmation {
  reference: string
  roomName: string
  date: string
  startTime: string
  endTime: string
  guestName: string
  price: number
}

export interface SubscriptionPlan {
  id: string
  name: string
  price: number | string
  period: string
  recommended?: boolean
  features: string[]
}
