import { zodResolver } from '@hookform/resolvers/zod'
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  MenuItem,
  Stack,
  Switch,
  TextField,
} from '@mui/material'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import type {
  AdminWorkspaceSettings,
  FloorRecord,
  OrganizationRecord,
  PlaceRecord,
  UserRecord,
} from '@/lib/api-types'

const userSchema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  email: z.email('Valid email is required'),
  phone: z.string().min(6, 'Phone is required'),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'USER']),
  status: z.enum(['ACTIVE', 'SUSPENDED']),
  organization_id: z.string().optional(),
})

const organizationSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  description: z.string().min(10, 'Description is required'),
  address: z.string().min(5, 'Address is required'),
  contact_email: z.email('Valid email is required'),
  contact_phone: z.string().min(6, 'Phone is required'),
  website: z.url('Valid website URL required').or(z.literal('')),
  logo: z.url('Valid logo URL required').or(z.literal('')),
  cover_image: z.url('Valid cover image URL required').or(z.literal('')),
  social_links: z.string().default(''),
  status: z.enum(['ACTIVE', 'SUSPENDED']),
})

const placeSchema = z.object({
  organization_id: z.string().min(1, 'Organization is required'),
  name: z.string().min(2, 'Name is required'),
  description: z.string().min(10, 'Description is required'),
  category: z.string().min(2, 'Category is required'),
  capacity: z.coerce.number().int().min(1, 'Capacity must be at least 1'),
  address: z.string().min(5, 'Address is required'),
  pricing: z.coerce.number().min(0, 'Pricing must be positive'),
  availability: z.string().min(2, 'Availability is required'),
  cover_image: z.url('Valid cover image URL required').or(z.literal('')),
  gallery: z.string().default(''),
  features: z.string().default(''),
  status: z.enum(['ACTIVE', 'SUSPENDED']),
})

const floorSchema = z.object({
  place_id: z.string().min(1, 'Place is required'),
  floor_name: z.string().min(2, 'Floor name is required'),
  floor_number: z.coerce.number().int().min(0, 'Floor number must be 0 or more'),
  capacity: z.coerce.number().int().min(1, 'Capacity must be at least 1'),
  description: z.string().min(5, 'Description is required'),
  blueprint_image: z.url('Valid blueprint URL required').or(z.literal('')),
  reservation_areas: z.string().default(''),
  status: z.enum(['ACTIVE', 'SUSPENDED']),
})

const settingsSchema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  email: z.email('Valid email is required'),
  phone: z.string().min(6, 'Phone is required'),
  title: z.string().min(2, 'Title is required'),
  platform_name: z.string().min(2, 'Platform name is required'),
  support_email: z.email('Valid support email is required'),
  timezone: z.string().min(2, 'Timezone is required'),
  default_language: z.string().min(2, 'Language is required'),
  session_timeout_minutes: z.coerce.number().int().min(5),
  password_rotation_days: z.coerce.number().int().min(30),
  email_notifications: z.boolean(),
  sms_notifications: z.boolean(),
  weekly_report: z.boolean(),
  incident_alerts: z.boolean(),
  require_mfa_for_admins: z.boolean(),
})

type UserFormValues = z.infer<typeof userSchema>
type OrganizationFormValues = z.infer<typeof organizationSchema>
type PlaceFormValues = z.infer<typeof placeSchema>
type FloorFormValues = z.infer<typeof floorSchema>
type SettingsFormValues = z.infer<typeof settingsSchema>

type BaseDialogProps = {
  open: boolean
  onClose: () => void
  error?: string
  isSubmitting?: boolean
}

type UserDialogProps = BaseDialogProps & {
  title: string
  value?: UserRecord
  organizations: OrganizationRecord[]
  onSubmit: (values: {
    full_name: string
    email: string
    phone: string
    role: 'SUPER_ADMIN' | 'ADMIN' | 'USER'
    status: 'ACTIVE' | 'SUSPENDED'
    organization_id?: string
  }) => Promise<void> | void
}

export const UserDialog = ({
  error,
  isSubmitting = false,
  onClose,
  onSubmit,
  open,
  organizations,
  title,
  value,
}: UserDialogProps) => {
  const { handleSubmit, register, reset, formState: { errors } } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    values: {
      full_name: value?.full_name ?? '',
      email: value?.email ?? '',
      phone: value?.phone ?? '',
      role: value?.role ?? 'USER',
      status: value?.status ?? 'ACTIVE',
      organization_id: value?.organization_id ?? '',
    },
  })

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} component="form" id="user-form" onSubmit={handleSubmit(async (formValues) => {
          await onSubmit({
            ...formValues,
            organization_id: formValues.organization_id || undefined,
          })
        })}>
          {error ? <Alert severity="error">{error}</Alert> : null}
          <TextField label="Full Name" {...register('full_name')} error={Boolean(errors.full_name)} helperText={errors.full_name?.message} />
          <TextField label="Email" {...register('email')} error={Boolean(errors.email)} helperText={errors.email?.message} />
          <TextField label="Phone" {...register('phone')} error={Boolean(errors.phone)} helperText={errors.phone?.message} />
          <TextField select label="Role" defaultValue={value?.role ?? 'USER'} {...register('role')} error={Boolean(errors.role)} helperText={errors.role?.message}>
            <MenuItem value="SUPER_ADMIN">Super Admin</MenuItem>
            <MenuItem value="ADMIN">Organization Admin</MenuItem>
            <MenuItem value="USER">Regular User</MenuItem>
          </TextField>
          <TextField select label="Status" defaultValue={value?.status ?? 'ACTIVE'} {...register('status')} error={Boolean(errors.status)} helperText={errors.status?.message}>
            <MenuItem value="ACTIVE">Active</MenuItem>
            <MenuItem value="SUSPENDED">Suspended</MenuItem>
          </TextField>
          <TextField select label="Organization" defaultValue={value?.organization_id ?? ''} {...register('organization_id')} helperText="Optional for super admins and regular users">
            <MenuItem value="">No organization</MenuItem>
            {organizations.map((organization) => (
              <MenuItem key={organization.id} value={organization.id}>{organization.name}</MenuItem>
            ))}
          </TextField>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button type="submit" form="user-form" variant="contained" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save user'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

type OrganizationDialogProps = BaseDialogProps & {
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

export const OrganizationDialog = ({
  error,
  isSubmitting = false,
  onClose,
  onSubmit,
  open,
  title,
  value,
}: OrganizationDialogProps) => {
  const { handleSubmit, register, reset, formState: { errors } } = useForm<OrganizationFormValues>({
    resolver: zodResolver(organizationSchema),
    values: {
      name: value?.name ?? '',
      description: value?.description ?? '',
      address: value?.address ?? '',
      contact_email: value?.contact_email ?? '',
      contact_phone: value?.contact_phone ?? '',
      website: value?.website ?? '',
      logo: value?.logo ?? '',
      cover_image: value?.cover_image ?? '',
      social_links: value?.social_links.join(', ') ?? '',
      status: value?.status ?? 'ACTIVE',
    },
  })

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} component="form" id="organization-form" onSubmit={handleSubmit(async (formValues) => {
          await onSubmit({
            ...formValues,
            website: formValues.website || undefined,
            logo: formValues.logo || undefined,
            cover_image: formValues.cover_image || undefined,
            social_links: formValues.social_links
              .split(',')
              .map((item) => item.trim())
              .filter(Boolean),
          })
        })}>
          {error ? <Alert severity="error">{error}</Alert> : null}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="Organization Name" {...register('name')} error={Boolean(errors.name)} helperText={errors.name?.message} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="Contact Email" {...register('contact_email')} error={Boolean(errors.contact_email)} helperText={errors.contact_email?.message} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="Contact Phone" {...register('contact_phone')} error={Boolean(errors.contact_phone)} helperText={errors.contact_phone?.message} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth select label="Status" defaultValue={value?.status ?? 'ACTIVE'} {...register('status')} error={Boolean(errors.status)} helperText={errors.status?.message}>
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="SUSPENDED">Suspended</MenuItem>
              </TextField>
            </Grid>
          </Grid>
          <TextField label="Address" {...register('address')} error={Boolean(errors.address)} helperText={errors.address?.message} />
          <TextField label="Description" multiline minRows={3} {...register('description')} error={Boolean(errors.description)} helperText={errors.description?.message} />
          <TextField label="Website" {...register('website')} error={Boolean(errors.website)} helperText={errors.website?.message ?? 'Optional'} />
          <TextField label="Logo URL" {...register('logo')} error={Boolean(errors.logo)} helperText={errors.logo?.message ?? 'Optional'} />
          <TextField label="Cover Image URL" {...register('cover_image')} error={Boolean(errors.cover_image)} helperText={errors.cover_image?.message ?? 'Optional'} />
          <TextField label="Social Links" {...register('social_links')} error={Boolean(errors.social_links)} helperText={errors.social_links?.message ?? 'Comma separated URLs'} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button type="submit" form="organization-form" variant="contained" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save organization'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

type PlaceDialogProps = BaseDialogProps & {
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
    availability: string
    cover_image?: string
    gallery: string[]
    features: string[]
    status: 'ACTIVE' | 'SUSPENDED'
  }) => Promise<void> | void
}

export const PlaceDialog = ({
  error,
  isSubmitting = false,
  onClose,
  onSubmit,
  open,
  organizations,
  title,
  value,
}: PlaceDialogProps) => {
  const { handleSubmit, register, reset, formState: { errors } } = useForm<PlaceFormValues>({
    resolver: zodResolver(placeSchema),
    values: {
      organization_id: value?.organization_id ?? organizations[0]?.id ?? '',
      name: value?.name ?? '',
      description: value?.description ?? '',
      category: value?.category ?? '',
      capacity: value?.capacity ?? 1,
      address: value?.address ?? '',
      pricing: value?.pricing ?? 0,
      availability: value?.availability ?? '',
      cover_image: value?.cover_image ?? '',
      gallery: value?.gallery.join(', ') ?? '',
      features: value?.features.join(', ') ?? '',
      status: value?.status ?? 'ACTIVE',
    },
  })

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} component="form" id="place-form" onSubmit={handleSubmit(async (formValues) => {
          await onSubmit({
            ...formValues,
            cover_image: formValues.cover_image || undefined,
            gallery: formValues.gallery.split(',').map((item) => item.trim()).filter(Boolean),
            features: formValues.features.split(',').map((item) => item.trim()).filter(Boolean),
          })
        })}>
          {error ? <Alert severity="error">{error}</Alert> : null}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth select label="Organization" defaultValue={value?.organization_id ?? organizations[0]?.id ?? ''} {...register('organization_id')} error={Boolean(errors.organization_id)} helperText={errors.organization_id?.message}>
                {organizations.map((organization) => (
                  <MenuItem key={organization.id} value={organization.id}>{organization.name}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="Category" {...register('category')} error={Boolean(errors.category)} helperText={errors.category?.message} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="Name" {...register('name')} error={Boolean(errors.name)} helperText={errors.name?.message} />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField fullWidth type="number" label="Capacity" {...register('capacity')} error={Boolean(errors.capacity)} helperText={errors.capacity?.message} />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField fullWidth type="number" label="Pricing" {...register('pricing')} error={Boolean(errors.pricing)} helperText={errors.pricing?.message} />
            </Grid>
          </Grid>
          <TextField label="Address" {...register('address')} error={Boolean(errors.address)} helperText={errors.address?.message} />
          <TextField label="Availability" {...register('availability')} error={Boolean(errors.availability)} helperText={errors.availability?.message} />
          <TextField label="Description" multiline minRows={3} {...register('description')} error={Boolean(errors.description)} helperText={errors.description?.message} />
          <TextField label="Cover Image URL" {...register('cover_image')} error={Boolean(errors.cover_image)} helperText={errors.cover_image?.message ?? 'Optional'} />
          <TextField label="Gallery URLs" {...register('gallery')} error={Boolean(errors.gallery)} helperText={errors.gallery?.message ?? 'Comma separated URLs'} />
          <TextField label="Feature Tags" {...register('features')} error={Boolean(errors.features)} helperText={errors.features?.message ?? 'Comma separated values'} />
          <TextField select label="Status" defaultValue={value?.status ?? 'ACTIVE'} {...register('status')} error={Boolean(errors.status)} helperText={errors.status?.message}>
            <MenuItem value="ACTIVE">Active</MenuItem>
            <MenuItem value="SUSPENDED">Suspended</MenuItem>
          </TextField>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button type="submit" form="place-form" variant="contained" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save place'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

type FloorDialogProps = BaseDialogProps & {
  title: string
  places: PlaceRecord[]
  value?: FloorRecord
  onSubmit: (values: {
    place_id: string
    floor_name: string
    floor_number: number
    capacity: number
    description: string
    blueprint_image?: string
    reservation_areas: string[]
    status: 'ACTIVE' | 'SUSPENDED'
  }) => Promise<void> | void
}

export const FloorDialog = ({
  error,
  isSubmitting = false,
  onClose,
  onSubmit,
  open,
  places,
  title,
  value,
}: FloorDialogProps) => {
  const { handleSubmit, register, reset, formState: { errors } } = useForm<FloorFormValues>({
    resolver: zodResolver(floorSchema),
    values: {
      place_id: value?.place_id ?? places[0]?.id ?? '',
      floor_name: value?.floor_name ?? '',
      floor_number: value?.floor_number ?? 0,
      capacity: value?.capacity ?? 1,
      description: value?.description ?? '',
      blueprint_image: value?.blueprint_image ?? '',
      reservation_areas: value?.reservation_areas.join(', ') ?? '',
      status: value?.status ?? 'ACTIVE',
    },
  })

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} component="form" id="floor-form" onSubmit={handleSubmit(async (formValues) => {
          await onSubmit({
            ...formValues,
            blueprint_image: formValues.blueprint_image || undefined,
            reservation_areas: formValues.reservation_areas.split(',').map((item) => item.trim()).filter(Boolean),
          })
        })}>
          {error ? <Alert severity="error">{error}</Alert> : null}
          <TextField select label="Place" defaultValue={value?.place_id ?? places[0]?.id ?? ''} {...register('place_id')} error={Boolean(errors.place_id)} helperText={errors.place_id?.message}>
            {places.map((place) => (
              <MenuItem key={place.id} value={place.id}>{place.name}</MenuItem>
            ))}
          </TextField>
          <TextField label="Floor Name" {...register('floor_name')} error={Boolean(errors.floor_name)} helperText={errors.floor_name?.message} />
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth type="number" label="Floor Number" {...register('floor_number')} error={Boolean(errors.floor_number)} helperText={errors.floor_number?.message} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth type="number" label="Capacity" {...register('capacity')} error={Boolean(errors.capacity)} helperText={errors.capacity?.message} />
            </Grid>
          </Grid>
          <TextField label="Description" multiline minRows={3} {...register('description')} error={Boolean(errors.description)} helperText={errors.description?.message} />
          <TextField label="Blueprint URL" {...register('blueprint_image')} error={Boolean(errors.blueprint_image)} helperText={errors.blueprint_image?.message ?? 'Optional'} />
          <TextField label="Reservation Areas" {...register('reservation_areas')} error={Boolean(errors.reservation_areas)} helperText={errors.reservation_areas?.message ?? 'Comma separated values'} />
          <TextField select label="Status" defaultValue={value?.status ?? 'ACTIVE'} {...register('status')} error={Boolean(errors.status)} helperText={errors.status?.message}>
            <MenuItem value="ACTIVE">Active</MenuItem>
            <MenuItem value="SUSPENDED">Suspended</MenuItem>
          </TextField>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button type="submit" form="floor-form" variant="contained" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save floor'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

type SettingsDialogProps = BaseDialogProps & {
  value: AdminWorkspaceSettings
  onSubmit: (values: AdminWorkspaceSettings) => Promise<void> | void
}

export const SettingsDialog = ({
  error,
  isSubmitting = false,
  onClose,
  onSubmit,
  open,
  value,
}: SettingsDialogProps) => {
  const { handleSubmit, register, reset, formState: { errors } } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    values: {
      full_name: value.profile.full_name,
      email: value.profile.email,
      phone: value.profile.phone,
      title: value.profile.title,
      platform_name: value.platform.platform_name,
      support_email: value.platform.support_email,
      timezone: value.platform.timezone,
      default_language: value.platform.default_language,
      session_timeout_minutes: value.security.session_timeout_minutes,
      password_rotation_days: value.security.password_rotation_days,
      email_notifications: value.notifications.email_notifications,
      sms_notifications: value.notifications.sms_notifications,
      weekly_report: value.notifications.weekly_report,
      incident_alerts: value.notifications.incident_alerts,
      require_mfa_for_admins: value.security.require_mfa_for_admins,
    },
  })

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Update Settings</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} component="form" id="settings-form" onSubmit={handleSubmit(async (formValues) => {
          await onSubmit({
            profile: {
              full_name: formValues.full_name,
              email: formValues.email,
              phone: formValues.phone,
              title: formValues.title,
            },
            platform: {
              platform_name: formValues.platform_name,
              support_email: formValues.support_email,
              timezone: formValues.timezone,
              default_language: formValues.default_language,
            },
            security: {
              session_timeout_minutes: formValues.session_timeout_minutes,
              password_rotation_days: formValues.password_rotation_days,
              require_mfa_for_admins: formValues.require_mfa_for_admins,
            },
            notifications: {
              email_notifications: formValues.email_notifications,
              sms_notifications: formValues.sms_notifications,
              weekly_report: formValues.weekly_report,
              incident_alerts: formValues.incident_alerts,
            },
          })
        })}>
          {error ? <Alert severity="error">{error}</Alert> : null}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="Full Name" {...register('full_name')} error={Boolean(errors.full_name)} helperText={errors.full_name?.message} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="Title" {...register('title')} error={Boolean(errors.title)} helperText={errors.title?.message} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="Email" {...register('email')} error={Boolean(errors.email)} helperText={errors.email?.message} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="Phone" {...register('phone')} error={Boolean(errors.phone)} helperText={errors.phone?.message} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="Platform Name" {...register('platform_name')} error={Boolean(errors.platform_name)} helperText={errors.platform_name?.message} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="Support Email" {...register('support_email')} error={Boolean(errors.support_email)} helperText={errors.support_email?.message} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="Timezone" {...register('timezone')} error={Boolean(errors.timezone)} helperText={errors.timezone?.message} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="Default Language" {...register('default_language')} error={Boolean(errors.default_language)} helperText={errors.default_language?.message} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth type="number" label="Session Timeout (minutes)" {...register('session_timeout_minutes')} error={Boolean(errors.session_timeout_minutes)} helperText={errors.session_timeout_minutes?.message} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth type="number" label="Password Rotation (days)" {...register('password_rotation_days')} error={Boolean(errors.password_rotation_days)} helperText={errors.password_rotation_days?.message} />
            </Grid>
          </Grid>
          <FormControlLabel control={<Switch {...register('email_notifications')} defaultChecked={value.notifications.email_notifications} />} label="Email notifications" />
          <FormControlLabel control={<Switch {...register('sms_notifications')} defaultChecked={value.notifications.sms_notifications} />} label="SMS notifications" />
          <FormControlLabel control={<Switch {...register('weekly_report')} defaultChecked={value.notifications.weekly_report} />} label="Weekly reports" />
          <FormControlLabel control={<Switch {...register('incident_alerts')} defaultChecked={value.notifications.incident_alerts} />} label="Incident alerts" />
          <FormControlLabel control={<Switch {...register('require_mfa_for_admins')} defaultChecked={value.security.require_mfa_for_admins} />} label="Require MFA for admins" />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button type="submit" form="settings-form" variant="contained" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save settings'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

type ConfirmDialogProps = BaseDialogProps & {
  title: string
  description: string
  confirmLabel: string
  color?: 'error' | 'primary' | 'warning'
  onConfirm: () => Promise<void> | void
}

export const ConfirmDialog = ({
  color = 'primary',
  confirmLabel,
  description,
  error,
  isSubmitting = false,
  onClose,
  onConfirm,
  open,
  title,
}: ConfirmDialogProps) => (
  <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent dividers>
      <Stack spacing={2}>
        {error ? <Alert severity="error">{error}</Alert> : null}
        <Alert severity={color === 'error' ? 'warning' : 'info'}>{description}</Alert>
      </Stack>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancel</Button>
      <Button variant="contained" color={color} disabled={isSubmitting} onClick={() => void onConfirm()}>
        {isSubmitting ? 'Working...' : confirmLabel}
      </Button>
    </DialogActions>
  </Dialog>
)
