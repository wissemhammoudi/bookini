import type {
  AdminWorkspaceSettings,
  FloorRecord,
  OrganizationRecord,
  PlaceRecord,
  ReservationAreaRecord,
  UserRecord,
} from '@/lib/api-types'

import type { AvailabilitySlot } from '@/features/admin-workspace/dialogs/shared-schemas'

export type BaseDialogProps = {
  open: boolean
  onClose: () => void
  error?: string
  isSubmitting?: boolean
}

export type UserDialogProps = BaseDialogProps & {
  title: string
  value?: UserRecord
  organizations: OrganizationRecord[]
  onSubmit: (values: {
    full_name: string
    email: string
    phone: string
    role: 'SUPER_ADMIN' | 'ADMIN' | 'USER'
    status: 'ACTIVE' | 'SUSPENDED'
    organization_ids: string[]
  }) => Promise<void> | void
}

export type OrganizationDialogProps = BaseDialogProps & {
  title: string
  value?: OrganizationRecord
  onSubmit: (values: {
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
  }) => Promise<void> | void
}

export type PlaceDialogProps = BaseDialogProps & {
  title: string
  organizations: OrganizationRecord[]
  value?: PlaceRecord
  onSubmit: (values: {
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
  }) => Promise<void> | void
}

export type FloorDialogProps = BaseDialogProps & {
  title: string
  places: PlaceRecord[]
  value?: FloorRecord
  onSubmit: (values: {
    place_id: string
    floor_name: string
    floor_number: number
    floor_size_sqm: number
    floor_shape: 'SQUARE' | 'RECTANGLE' | 'L_SHAPE' | 'CUSTOM_POLYGON'
    capacity: number
    pricing: number
    description: string
    blueprint_image?: string
    reservation_areas: Array<string | ReservationAreaRecord>
    status: 'ACTIVE' | 'SUSPENDED'
  }) => Promise<void> | void
}

export type SettingsDialogProps = BaseDialogProps & {
  value: AdminWorkspaceSettings
  onSubmit: (values: AdminWorkspaceSettings) => Promise<void> | void
}

export type ConfirmDialogProps = BaseDialogProps & {
  title: string
  description: string
  confirmLabel: string
  color?: 'error' | 'primary' | 'warning'
  onConfirm: () => Promise<void> | void
}
