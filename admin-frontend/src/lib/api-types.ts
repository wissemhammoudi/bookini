export type ApiResponse<T> = {
  success: boolean
  message: string
  data: T
}

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'USER'

export type ActiveState = 'ACTIVE' | 'SUSPENDED'

export type ReservationWorkflowState =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED'

export type RequestState = 'PENDING' | 'APPROVED' | 'REJECTED' | 'PROCESSED'

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

export type CurrentUserProfile = {
  id: string
  full_name: string
  email: string
  role: UserRole
  avatar_url: string | null
}

export type DashboardStat = {
  key: string
  label: string
  value: number
  trend: string
}

export type DashboardChartPoint = {
  label: string
  value: number
}

export type RecentActivity = {
  id: string
  title: string
  description: string
  timestamp: string
  type: 'reservation' | 'organization' | 'partnership' | 'contact' | 'user'
  ip_address?: string
}

export type UserRecord = {
  id: string
  profile_image: string | null
  full_name: string
  email: string
  phone: string
  role: UserRole
  status: ActiveState
  created_date: string
  organization_ids: string[]
}

export type OrganizationRecord = {
  id: string
  logo: string | null
  cover_image: string | null
  name: string
  description: string
  address: string
  contact_email: string
  contact_phone: string
  website: string | null
  social_links: string[]
  status: ActiveState
  created_date: string
}

export type PlaceRecord = {
  id: string
  organization_id: string
  name: string
  description: string
  category: string
  capacity: number
  address: string
  pricing: number
  availability: string
  cover_image: string | null
  gallery: string[]
  features: string[]
  status: ActiveState
  created_date: string
}

export type FloorRecord = {
  id: string
  place_id: string
  floor_name: string
  floor_number: number
  capacity: number
  description: string
  blueprint_image: string | null
  reservation_areas: string[]
  status: ActiveState
  created_date: string
}

export type ReservationRecord = {
  id: string
  user_id: string
  user_name: string
  place_id: string
  place_name: string
  floor_id: string
  floor_name: string
  date: string
  time: string
  status: ReservationWorkflowState
  created_date: string
}

export type ContactRequestRecord = {
  id: string
  full_name: string
  email: string
  phone: string
  subject: string
  message: string
  date: string
  status: RequestState
}

export type PartnershipRequestRecord = {
  id: string
  company_name: string
  contact_person: string
  email: string
  phone: string
  business_description: string
  requested_date: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  generated_credentials: {
    email: string
    temporary_password: string
  } | null
}

export type AdminWorkspaceSettings = {
  profile: {
    full_name: string
    email: string
    phone: string
    title: string
  }
  notifications: {
    email_notifications: boolean
    sms_notifications: boolean
    weekly_report: boolean
    incident_alerts: boolean
  }
  platform: {
    platform_name: string
    support_email: string
    timezone: string
    default_language: string
  }
  security: {
    session_timeout_minutes: number
    require_mfa_for_admins: boolean
    password_rotation_days: number
  }
}

export type AdminWorkspaceResponse = {
  role: 'SUPER_ADMIN' | 'ADMIN'
  dashboard: {
    stats: DashboardStat[]
    reservations_by_month: DashboardChartPoint[]
    most_reserved_places: DashboardChartPoint[]
    organization_activity: DashboardChartPoint[]
    recent_activity: RecentActivity[]
  }
  collections: {
    users: UserRecord[]
    organizations: OrganizationRecord[]
    places: PlaceRecord[]
    floors: FloorRecord[]
    reservations: ReservationRecord[]
    contact_requests: ContactRequestRecord[]
    partnership_requests: PartnershipRequestRecord[]
    settings: AdminWorkspaceSettings
  }
}

export type AdminRatingRecord = {
  id: string
  admin_id: string
  user_id: string
  rating: number
  comment: string | null
  created_at: string
  updated_at: string
}

export type FloorReviewRecord = {
  id: string
  floor_id: string
  user_id: string
  rating: number
  comment: string | null
  created_at: string
  updated_at: string
}

export type FloorReviewsPayload = {
  average_rating: number
  rating_count: number
  reviews: FloorReviewRecord[]
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

export type AdminRatingsPayload = {
  average_rating: number
  rating_count: number
  items: AdminRatingRecord[]
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

export type AdminPublicProfile = {
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
  }>
}
