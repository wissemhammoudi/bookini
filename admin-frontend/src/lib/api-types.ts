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

export type StatisticsSummary = {
  total_reservations: number
  daily_reservations: number
  monthly_reservations: number
  annual_reservations: number
  cancellation_rate: number
  active_users: number
  charts: {
    bar: {
      labels: string[]
      series: number[]
    }
    line: {
      labels: string[]
      series: number[]
    }
    pie: {
      labels: string[]
      series: number[]
    }
  }
}

export type OccupancyMetrics = {
  total_rooms: number
  occupied_rooms: number
  available_rooms: number
  occupancy_percentage: number
  chart: {
    type: string
    labels: string[]
    series: number[]
  }
}

export type NamedChartSeries = {
  items: Array<Record<string, string | number>>
  chart: {
    type: string
    labels: string[]
    series: number[]
  }
}

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
