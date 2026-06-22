import type { ReactNode } from 'react'

import type {
  ContactRequestRecord,
  FloorRecord,
  OrganizationRecord,
  PlaceRecord,
  ReservationRecord,
  UserRecord,
} from '@/lib/api-types'

export type SectionKey =
  | 'dashboard'
  | 'users'
  | 'organizations'
  | 'places'
  | 'floors'
  | 'reservations'
  | 'requests'
  | 'settings'

export type FeedbackState = {
  severity: 'success' | 'error'
  message: string
}

export type DialogState =
  | { type: 'user-create' }
  | { type: 'user-edit'; value: UserRecord }
  | { type: 'organization-create' }
  | { type: 'organization-edit'; value: OrganizationRecord }
  | { type: 'place-create' }
  | { type: 'place-edit'; value: PlaceRecord }
  | { type: 'floor-create' }
  | { type: 'floor-edit'; value: FloorRecord }
  | { type: 'settings' }
  | {
      type: 'confirm'
      title: string
      description: string
      confirmLabel: string
      color?: 'error' | 'primary' | 'warning'
      onConfirm: () => Promise<void>
    }
  | null

export type SectionConfig = {
  key: SectionKey
  label: string
  caption: string
  icon: ReactNode
  roles: Array<'SUPER_ADMIN' | 'ADMIN'>
}

export type ReservationFilter = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
export type RoleFilter = 'ALL' | 'SUPER_ADMIN' | 'ADMIN' | 'USER'

export type UserActionHandler = (user: UserRecord) => void
export type OrganizationActionHandler = (organization: OrganizationRecord) => void
export type PlaceActionHandler = (place: PlaceRecord) => void
export type FloorActionHandler = (floor: FloorRecord) => void
export type ReservationActionHandler = (reservation: ReservationRecord) => void
export type ContactActionHandler = (request: ContactRequestRecord) => void
