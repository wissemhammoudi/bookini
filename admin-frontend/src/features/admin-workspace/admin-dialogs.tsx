import { useState, useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  MenuItem,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
  alpha,
} from '@mui/material'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { uploadImageRequest } from '@/lib/api'

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
  social_links: z.string(),
  status: z.enum(['ACTIVE', 'SUSPENDED']),
})

const placeSchema = z.object({
  organization_id: z.string().min(1, 'Organization is required'),
  name: z.string().min(2, 'Name is required'),
  description: z.string().min(10, 'Description is required'),
  category: z.string().min(2, 'Category is required'),
  capacity: z.number().int().min(1, 'Capacity must be at least 1'),
  address: z.string().min(5, 'Address is required'),
  pricing: z.number().min(0, 'Pricing must be positive'),
  availability: z.string().min(2, 'Availability is required'),
  cover_image: z.url('Valid cover image URL required').or(z.literal('')),
  gallery: z.string(),
  features: z.string(),
  status: z.enum(['ACTIVE', 'SUSPENDED']),
})

const floorSchema = z.object({
  place_id: z.string().min(1, 'Place is required'),
  floor_name: z.string().min(2, 'Floor name is required'),
  floor_number: z.number().int().min(0, 'Floor number must be 0 or more'),
  capacity: z.number().int().min(1, 'Capacity must be at least 1'),
  description: z.string().min(5, 'Description is required'),
  blueprint_image: z.string().optional(),
  reservation_areas: z.string(),
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
  session_timeout_minutes: z.number().int().min(5),
  password_rotation_days: z.number().int().min(30),
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

const dialogPaperSx = {
  '& .MuiDialog-paper': {
    borderRadius: 5,
    border: '1px solid',
    borderColor: 'divider',
    backgroundImage: 'none',
    background: (theme: any) => theme.palette.mode === 'light' ? 'linear-gradient(180deg, #FFFFFF 0%, #F7FAFF 100%)' : 'linear-gradient(180deg, #101D32 0%, #0C1525 100%)',
    boxShadow: '0 28px 70px rgba(16, 24, 40, 0.16)',
  },
}

const dialogContentSx = {
  pt: 2.5,
}

const dialogActionsSx = {
  px: 3,
  py: 2.5,
  borderTop: '1px solid',
  borderColor: 'divider',
  backgroundColor: alpha('#0059B3', 0.02),
}

const DialogHeading = ({
  tone,
  title,
  subtitle,
}: {
  tone: string
  title: string
  subtitle: string
}) => (
  <Stack spacing={1}>
    <Chip label={tone} size="small" variant="outlined" sx={{ alignSelf: 'flex-start', fontWeight: 700 }} />
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: '-0.02em' }}>
        {title}
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 0.5 }}>
        {subtitle}
      </Typography>
    </Box>
  </Stack>
)

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
    organization_ids: string[]
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
  const [selectedOrgs, setSelectedOrgs] = useState<string[]>(() => value?.organization_ids ?? [])

  const { handleSubmit, register, reset, formState: { errors } } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    values: {
      full_name: value?.full_name ?? '',
      email: value?.email ?? '',
      phone: value?.phone ?? '',
      role: value?.role ?? 'USER',
      status: value?.status ?? 'ACTIVE',
    },
  })

  useEffect(() => {
    if (open) {
      setSelectedOrgs(value?.organization_ids ?? [])
    }
  }, [open, value])

  const handleClose = () => {
    reset()
    setSelectedOrgs([])
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth sx={dialogPaperSx}>
      <DialogTitle sx={{ px: 3, pt: 3, pb: 0 }}>
        <DialogHeading
          tone="User access"
          title={title}
          subtitle="Create or update an account with role, status, and organization context."
        />
      </DialogTitle>
      <DialogContent dividers sx={dialogContentSx}>
        <Stack spacing={2} component="form" id="user-form" onSubmit={handleSubmit(async (formValues) => {
          await onSubmit({
            ...formValues,
            organization_ids: selectedOrgs,
          })
        })}>
          {error ? <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert> : null}
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
          <TextField
            select
            label="Organizations"
            value={selectedOrgs}
            onChange={(e) => setSelectedOrgs(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value as string[])}
            slotProps={{
              select: {
                multiple: true,
                renderValue: (selected: any) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(selected as string[]).map((val) => {
                      const org = organizations.find((o) => o.id === val)
                      return <Chip key={val} label={org?.name ?? val} size="small" />
                    })}
                  </Box>
                ),
              },
            }}
            helperText="Optional for super admins and regular users"
          >
            {organizations.map((organization) => (
              <MenuItem key={organization.id} value={organization.id}>
                {organization.name}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </DialogContent>
      <DialogActions sx={dialogActionsSx}>
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
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth sx={dialogPaperSx}>
      <DialogTitle sx={{ px: 3, pt: 3, pb: 0 }}>
        <DialogHeading
          tone="Organization profile"
          title={title}
          subtitle="Capture the organization identity, contact details, and public presence."
        />
      </DialogTitle>
      <DialogContent dividers sx={dialogContentSx}>
        <Stack spacing={2} component="form" id="organization-form" onSubmit={handleSubmit(async (formValues) => {
          await onSubmit({
            ...formValues,
            website: formValues.website || undefined,
            logo: formValues.logo || undefined,
            cover_image: formValues.cover_image || undefined,
            social_links: formValues.social_links
              .split(',')
              .map((item: string) => item.trim())
              .filter(Boolean),
          })
        })}>
          {error ? <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert> : null}
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
      <DialogActions sx={dialogActionsSx}>
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
  const [isUploadingCover, setIsUploadingCover] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const { handleSubmit, register, reset, setValue, formState: { errors } } = useForm<PlaceFormValues>({
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

  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploadingCover(true)
    setUploadError(null)
    try {
      const response = await uploadImageRequest(file)
      setValue('cover_image', response.url)
    } catch (err: any) {
      setUploadError(err.response?.data?.message || err.message || 'Failed to upload image')
    } finally {
      setIsUploadingCover(false)
      e.target.value = ''
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth sx={dialogPaperSx}>
      <DialogTitle sx={{ px: 3, pt: 3, pb: 0 }}>
        <DialogHeading
          tone="Place inventory"
          title={title}
          subtitle="Define the room or space details that surface in the reservation experience."
        />
      </DialogTitle>
      <DialogContent dividers sx={dialogContentSx}>
        <Stack spacing={2} component="form" id="place-form" onSubmit={handleSubmit(async (formValues) => {
          await onSubmit({
            ...formValues,
            cover_image: formValues.cover_image || undefined,
            gallery: formValues.gallery.split(',').map((item: string) => item.trim()).filter(Boolean),
            features: formValues.features.split(',').map((item: string) => item.trim()).filter(Boolean),
          })
        })}>
          {(error || uploadError) ? <Alert severity="error" sx={{ borderRadius: 2 }}>{error || uploadError}</Alert> : null}
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
              <TextField fullWidth type="number" label="Capacity" {...register('capacity', { valueAsNumber: true })} error={Boolean(errors.capacity)} helperText={errors.capacity?.message} />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField fullWidth type="number" label="Pricing" {...register('pricing', { valueAsNumber: true })} error={Boolean(errors.pricing)} helperText={errors.pricing?.message} />
            </Grid>
          </Grid>
          <TextField label="Address" {...register('address')} error={Boolean(errors.address)} helperText={errors.address?.message} />
          <TextField label="Availability" {...register('availability')} error={Boolean(errors.availability)} helperText={errors.availability?.message} />
          <TextField label="Description" multiline minRows={3} {...register('description')} error={Boolean(errors.description)} helperText={errors.description?.message} />
          
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
            <TextField
              label="Cover Image URL"
              {...register('cover_image')}
              error={Boolean(errors.cover_image)}
              helperText={errors.cover_image?.message ?? 'Optional URL or upload an image'}
              fullWidth
            />
            <Button
              variant="outlined"
              component="label"
              disabled={isUploadingCover}
              sx={{ height: 40, mt: 0.5, whiteSpace: 'nowrap' }}
            >
              {isUploadingCover ? 'Uploading...' : 'Upload File'}
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleCoverImageUpload}
              />
            </Button>
          </Stack>

          <TextField label="Gallery URLs" {...register('gallery')} error={Boolean(errors.gallery)} helperText={errors.gallery?.message ?? 'Comma separated URLs'} />
          <TextField label="Feature Tags" {...register('features')} error={Boolean(errors.features)} helperText={errors.features?.message ?? 'Comma separated values'} />
          <TextField select label="Status" defaultValue={value?.status ?? 'ACTIVE'} {...register('status')} error={Boolean(errors.status)} helperText={errors.status?.message}>
            <MenuItem value="ACTIVE">Active</MenuItem>
            <MenuItem value="SUSPENDED">Suspended</MenuItem>
          </TextField>
        </Stack>
      </DialogContent>
      <DialogActions sx={dialogActionsSx}>
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
  const [isUploadingBlueprint, setIsUploadingBlueprint] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const { handleSubmit, register, reset, setValue, formState: { errors } } = useForm<FloorFormValues>({
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

  const handleBlueprintUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploadingBlueprint(true)
    setUploadError(null)
    try {
      const response = await uploadImageRequest(file)
      setValue('blueprint_image', response.url)
    } catch (err: any) {
      setUploadError(err.response?.data?.message || err.message || 'Failed to upload blueprint')
    } finally {
      setIsUploadingBlueprint(false)
      e.target.value = ''
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth sx={dialogPaperSx}>
      <DialogTitle sx={{ px: 3, pt: 3, pb: 0 }}>
        <DialogHeading
          tone="Floor planning"
          title={title}
          subtitle="Configure a floor, its capacity, and the reservation areas it exposes."
        />
      </DialogTitle>
      <DialogContent dividers sx={dialogContentSx}>
        <Stack spacing={2} component="form" id="floor-form" onSubmit={handleSubmit(async (formValues) => {
          await onSubmit({
            ...formValues,
            blueprint_image: formValues.blueprint_image || undefined,
            reservation_areas: formValues.reservation_areas.split(',').map((item: string) => item.trim()).filter(Boolean),
          })
        })}>
          {(error || uploadError) ? <Alert severity="error" sx={{ borderRadius: 2 }}>{error || uploadError}</Alert> : null}
          <TextField select label="Place" defaultValue={value?.place_id ?? places[0]?.id ?? ''} {...register('place_id')} error={Boolean(errors.place_id)} helperText={errors.place_id?.message}>
            {places.map((place) => (
              <MenuItem key={place.id} value={place.id}>{place.name}</MenuItem>
            ))}
          </TextField>
          <TextField label="Floor Name" {...register('floor_name')} error={Boolean(errors.floor_name)} helperText={errors.floor_name?.message} />
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth type="number" label="Floor Number" {...register('floor_number', { valueAsNumber: true })} error={Boolean(errors.floor_number)} helperText={errors.floor_number?.message} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth type="number" label="Capacity" {...register('capacity', { valueAsNumber: true })} error={Boolean(errors.capacity)} helperText={errors.capacity?.message} />
            </Grid>
          </Grid>
          <TextField label="Description" multiline minRows={3} {...register('description')} error={Boolean(errors.description)} helperText={errors.description?.message} />
          
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
            <TextField
              label="Blueprint URL"
              {...register('blueprint_image')}
              error={Boolean(errors.blueprint_image)}
              helperText={errors.blueprint_image?.message ?? 'Optional URL or upload blueprint'}
              fullWidth
            />
            <Button
              variant="outlined"
              component="label"
              disabled={isUploadingBlueprint}
              sx={{ height: 40, mt: 0.5, whiteSpace: 'nowrap' }}
            >
              {isUploadingBlueprint ? 'Uploading...' : 'Upload File'}
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleBlueprintUpload}
              />
            </Button>
          </Stack>

          <TextField label="Reservation Areas" {...register('reservation_areas')} error={Boolean(errors.reservation_areas)} helperText={errors.reservation_areas?.message ?? 'Comma separated values'} />
          <TextField select label="Status" defaultValue={value?.status ?? 'ACTIVE'} {...register('status')} error={Boolean(errors.status)} helperText={errors.status?.message}>
            <MenuItem value="ACTIVE">Active</MenuItem>
            <MenuItem value="SUSPENDED">Suspended</MenuItem>
          </TextField>
        </Stack>
      </DialogContent>
      <DialogActions sx={dialogActionsSx}>
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
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth sx={dialogPaperSx}>
      <DialogTitle sx={{ px: 3, pt: 3, pb: 0 }}>
        <DialogHeading
          tone="System configuration"
          title="Update Settings"
          subtitle="Manage workspace identity, notifications, and security defaults in one panel."
        />
      </DialogTitle>
      <DialogContent dividers sx={dialogContentSx}>
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
          {error ? <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert> : null}
          <Paper sx={{ p: 2.5, border: '1px solid', borderColor: 'divider', backgroundColor: alpha('#0059B3', 0.025) }}>
            <Stack spacing={2}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Profile & platform</Typography>
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
                  <TextField fullWidth type="number" label="Session Timeout (minutes)" {...register('session_timeout_minutes', { valueAsNumber: true })} error={Boolean(errors.session_timeout_minutes)} helperText={errors.session_timeout_minutes?.message} />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField fullWidth type="number" label="Password Rotation (days)" {...register('password_rotation_days', { valueAsNumber: true })} error={Boolean(errors.password_rotation_days)} helperText={errors.password_rotation_days?.message} />
                </Grid>
              </Grid>
            </Stack>
          </Paper>
          <Paper sx={{ p: 2.5, border: '1px solid', borderColor: 'divider', backgroundColor: alpha('#00A88F', 0.025) }}>
            <Stack spacing={2}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Alerts & security</Typography>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} sx={{ flexWrap: 'wrap' }}>
                <FormControlLabel control={<Switch {...register('email_notifications')} defaultChecked={value.notifications.email_notifications} />} label="Email notifications" />
                <FormControlLabel control={<Switch {...register('sms_notifications')} defaultChecked={value.notifications.sms_notifications} />} label="SMS notifications" />
                <FormControlLabel control={<Switch {...register('weekly_report')} defaultChecked={value.notifications.weekly_report} />} label="Weekly reports" />
                <FormControlLabel control={<Switch {...register('incident_alerts')} defaultChecked={value.notifications.incident_alerts} />} label="Incident alerts" />
                <FormControlLabel control={<Switch {...register('require_mfa_for_admins')} defaultChecked={value.security.require_mfa_for_admins} />} label="Require MFA for admins" />
              </Stack>
            </Stack>
          </Paper>
        </Stack>
      </DialogContent>
      <DialogActions sx={dialogActionsSx}>
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
  <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth sx={dialogPaperSx}>
    <DialogTitle sx={{ px: 3, pt: 3, pb: 0 }}>
      <DialogHeading
        tone="Confirmation"
        title={title}
        subtitle="Review the action before it is applied to the admin workspace."
      />
    </DialogTitle>
    <DialogContent dividers sx={dialogContentSx}>
      <Stack spacing={2}>
        {error ? <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert> : null}
        <Alert severity={color === 'error' ? 'warning' : 'info'} sx={{ borderRadius: 2 }}>{description}</Alert>
      </Stack>
    </DialogContent>
    <DialogActions sx={dialogActionsSx}>
      <Button onClick={onClose}>Cancel</Button>
      <Button variant="contained" color={color} disabled={isSubmitting} onClick={() => void onConfirm()}>
        {isSubmitting ? 'Working...' : confirmLabel}
      </Button>
    </DialogActions>
  </Dialog>
)
