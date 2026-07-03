import { Alert, Grid, MenuItem, Stack, TextField } from '@mui/material'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'

import { PlaceAvailabilityEditor } from '@/features/admin-workspace/dialogs/place-dialog/place-availability-editor'
import { PlaceImagesEditor } from '@/features/admin-workspace/dialogs/place-dialog/place-images-editor'
import type { PlaceFormValues } from '@/features/admin-workspace/dialogs/shared'
import type { OrganizationRecord } from '@/lib/api-types'

type PlaceDialogFormProps = {
  register: UseFormRegister<PlaceFormValues>
  errors: FieldErrors<PlaceFormValues>
  organizations: OrganizationRecord[]
  organizationId?: string
  error?: string
  uploadError?: string | null
  isUploadingCover: boolean
  isUploadingGallery: boolean
  coverValue: string
  galleryItems: string[]
  availabilityValue: PlaceFormValues['availability']
  onCoverUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>
  onGalleryUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>
  onClearCover: () => void
  onRemoveGalleryItem: (targetIndex: number) => void
  hasPendingCover?: boolean
  pendingGalleryCount?: number
  onAddAvailabilitySlot: () => void
  onRemoveAvailabilitySlot: (index: number) => void
}

export function PlaceDialogForm({
  register,
  errors,
  organizations,
  organizationId,
  error,
  uploadError,
  isUploadingCover,
  isUploadingGallery,
  coverValue,
  galleryItems,
  availabilityValue,
  onCoverUpload,
  onGalleryUpload,
  onClearCover,
  onRemoveGalleryItem,
  hasPendingCover = false,
  pendingGalleryCount = 0,
  onAddAvailabilitySlot,
  onRemoveAvailabilitySlot,
}: PlaceDialogFormProps) {
  return (
    <Stack spacing={2}>
      {error || uploadError ? <Alert severity="error" sx={{ borderRadius: 2 }}>{error || uploadError}</Alert> : null}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField
            fullWidth
            select
            label="Organization"
            defaultValue={organizationId ?? organizations[0]?.id ?? ''}
            {...register('organization_id')}
            error={Boolean(errors.organization_id)}
            helperText={errors.organization_id?.message}
          >
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

      <PlaceAvailabilityEditor
        register={register}
        errors={errors}
        availabilityValue={availabilityValue}
        onAddAvailabilitySlot={onAddAvailabilitySlot}
        onRemoveAvailabilitySlot={onRemoveAvailabilitySlot}
      />

      <TextField label="Description" multiline minRows={3} {...register('description')} error={Boolean(errors.description)} helperText={errors.description?.message} />

      <PlaceImagesEditor
        coverValue={coverValue}
        galleryItems={galleryItems}
        isUploadingCover={isUploadingCover}
        isUploadingGallery={isUploadingGallery}
        onCoverUpload={onCoverUpload}
        onGalleryUpload={onGalleryUpload}
        onClearCover={onClearCover}
        onRemoveGalleryItem={onRemoveGalleryItem}
        hasPendingCover={hasPendingCover}
        pendingGalleryCount={pendingGalleryCount}
      />

      <input type="hidden" {...register('cover_image')} />
      <input type="hidden" {...register('gallery')} />

      <TextField label="Feature Tags" {...register('features')} error={Boolean(errors.features)} helperText={errors.features?.message ?? 'Comma separated values'} />
      <TextField select label="Status" defaultValue="ACTIVE" {...register('status')} error={Boolean(errors.status)} helperText={errors.status?.message}>
        <MenuItem value="ACTIVE">Active</MenuItem>
        <MenuItem value="SUSPENDED">Suspended</MenuItem>
      </TextField>
    </Stack>
  )
}
