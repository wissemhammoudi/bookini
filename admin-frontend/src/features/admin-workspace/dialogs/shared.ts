export {
  dialogActionsSx,
  dialogContentSx,
  dialogPaperSx,
} from '@/features/admin-workspace/dialogs/shared-dialog-styles'

export { DialogHeading } from '@/features/admin-workspace/dialogs/shared-ui'

export {
  availabilityDayOptions,
  floorSchema,
  organizationSchema,
  placeSchema,
  resolveImageUrl,
  settingsSchema,
  userSchema,
} from '@/features/admin-workspace/dialogs/shared-schemas'

export {
  buildDesksFromFloor,
  deriveReservationAreasFromDesks,
  normalizeRoomName,
  toUniqueAreaNames,
} from '@/features/admin-workspace/dialogs/shared-layout'

export type {
  AvailabilitySlot,
  FloorFormValues,
  OrganizationFormValues,
  PlaceFormValues,
  SettingsFormValues,
  UserFormValues,
} from '@/features/admin-workspace/dialogs/shared-schemas'

export type {
  ConfirmDialogProps,
  FloorDialogProps,
  OrganizationDialogProps,
  PlaceDialogProps,
  SettingsDialogProps,
  UserDialogProps,
} from '@/features/admin-workspace/dialogs/shared-props'
