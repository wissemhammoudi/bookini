import { z } from 'zod'

const isAbsoluteUrl = (value: string) => {
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

const isUploadPath = (value: string) => value.startsWith('/api/v1/auth/uploads/')

export const resolveImageUrl = (value: string) => {
  if (!value) return ''
  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:')) {
    return value
  }

  const apiBase = import.meta.env.VITE_API_BASE_URL ?? (import.meta.env.DEV ? 'http://localhost:8000/api/v1' : '/api/v1')
  if (value.startsWith('/api/v1')) {
    return import.meta.env.DEV ? `http://localhost:8000${value}` : value
  }

  return `${apiBase}${value.startsWith('/') ? '' : '/'}${value}`
}

const optionalImageLocation = (label: string) =>
  z.string().refine((value) => value === '' || isAbsoluteUrl(value) || isUploadPath(value), {
    message: `Valid ${label} URL required`,
  })

export const userSchema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  email: z.email('Valid email is required'),
  phone: z.string().min(6, 'Phone is required'),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'USER']),
  status: z.enum(['ACTIVE', 'SUSPENDED']),
})

export const organizationSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  description: z.string().min(10, 'Description is required'),
  address: z.string().min(5, 'Address is required'),
  contact_email: z.email('Valid email is required'),
  contact_phone: z.string().min(6, 'Phone is required'),
  website: z.url('Valid website URL required').or(z.literal('')),
  logo: optionalImageLocation('logo'),
  cover_image: optionalImageLocation('cover image'),
  social_links: z.string(),
  status: z.enum(['ACTIVE', 'SUSPENDED']),
})

export type AvailabilityDay = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY'

export type AvailabilitySlot = {
  day: AvailabilityDay
  start_time: string
  end_time: string
}

export const placeSchema = z.object({
  organization_id: z.string().min(1, 'Organization is required'),
  name: z.string().min(2, 'Name is required'),
  description: z.string().min(10, 'Description is required'),
  category: z.string().min(2, 'Category is required'),
  capacity: z.number().int().min(1, 'Capacity must be at least 1'),
  address: z.string().min(5, 'Address is required'),
  pricing: z.number().min(0, 'Pricing must be positive'),
  availability: z
    .array(
      z
        .object({
          day: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']),
          start_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Invalid start time'),
          end_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Invalid end time'),
        })
        .refine((slot) => slot.start_time < slot.end_time, {
          message: 'End time must be after start time',
          path: ['end_time'],
        }),
    )
    .min(1, 'At least one availability slot is required'),
  cover_image: optionalImageLocation('cover image'),
  gallery: z.string(),
  features: z.string(),
  status: z.enum(['ACTIVE', 'SUSPENDED']),
})

export const floorSchema = z.object({
  place_id: z.string().min(1, 'Place is required'),
  floor_name: z.string().min(2, 'Floor name is required'),
  floor_number: z.number().int().min(0, 'Floor number must be 0 or more'),
  floor_size_sqm: z.number().min(1, 'Floor size must be at least 1 sqm'),
  floor_shape: z.enum(['SQUARE', 'RECTANGLE', 'L_SHAPE', 'CUSTOM_POLYGON']),
  capacity: z.number().int().min(1, 'Capacity must be at least 1'),
  pricing: z.number().min(0, 'Pricing must be positive'),
  description: z.string().min(5, 'Description is required'),
  blueprint_image: z.string().optional(),
  reservation_areas: z.string(),
  status: z.enum(['ACTIVE', 'SUSPENDED']),
})

export const settingsSchema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  email: z.email('Valid email is required'),
  phone: z.string().min(6, 'Phone is required'),
  title: z.string().min(2, 'Title is required'),
  platform_name: z.string().min(2, 'Platform name is required'),
  support_email: z.email('Valid support email is required'),
  timezone: z.string().min(2, 'Timezone is required'),
  default_language: z.string().min(2, 'Language is required'),
  session_timeout_minutes: z.number().int().min(5),
  password_rotation_days: z.number().int().min(30),
  email_notifications: z.boolean(),
  sms_notifications: z.boolean(),
  weekly_report: z.boolean(),
  incident_alerts: z.boolean(),
  require_mfa_for_admins: z.boolean(),
})

export type UserFormValues = z.infer<typeof userSchema>
export type OrganizationFormValues = z.infer<typeof organizationSchema>
export type PlaceFormValues = z.infer<typeof placeSchema>
export type FloorFormValues = z.infer<typeof floorSchema>
export type SettingsFormValues = z.infer<typeof settingsSchema>

export const availabilityDayOptions: Array<{ value: AvailabilityDay; label: string }> = [
  { value: 'MONDAY', label: 'Monday' },
  { value: 'TUESDAY', label: 'Tuesday' },
  { value: 'WEDNESDAY', label: 'Wednesday' },
  { value: 'THURSDAY', label: 'Thursday' },
  { value: 'FRIDAY', label: 'Friday' },
  { value: 'SATURDAY', label: 'Saturday' },
]
