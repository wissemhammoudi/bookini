export type ApiResponse<T> = {
  success: boolean
  message: string
  data: T
}

export type AuthTokens = {
  access_token: string
  refresh_token: string
  token_type: string
}

export type FloorItem = {
  id: string
  name: string
  capacity: number
  building: string
  floor_number: number
  location: string
  description: string | null
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE'
  is_deleted: boolean
}

export type ReservationItem = {
  id: string
  user_id: string
  floor_id: string
  start_time: string
  end_time: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
}

export type ActivityItem = {
  id: string
  reservation_id: string
  title: string
  description: string | null
  created_at: string
}
