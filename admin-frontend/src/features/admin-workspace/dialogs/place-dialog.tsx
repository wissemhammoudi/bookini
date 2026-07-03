import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack } from '@mui/material'
import { useForm } from 'react-hook-form'

import { PlaceDialogForm } from '@/features/admin-workspace/dialogs/place-dialog/place-dialog-form'
import { usePlaceDialogState } from '@/features/admin-workspace/dialogs/place-dialog/use-place-dialog-state'
import { DialogHeading, dialogActionsSx, dialogContentSx, dialogPaperSx, placeSchema } from '@/features/admin-workspace/dialogs/shared'
import type { PlaceDialogProps, PlaceFormValues } from '@/features/admin-workspace/dialogs/shared'

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
  const {
    handleSubmit,
    register,
    reset,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<PlaceFormValues>({
    resolver: zodResolver(placeSchema),
    values: {
      organization_id: value?.organization_id ?? organizations[0]?.id ?? '',
      name: value?.name ?? '',
      description: value?.description ?? '',
      category: value?.category ?? '',
      capacity: value?.capacity ?? 1,
      address: value?.address ?? '',
      pricing: value?.pricing ?? 0,
      availability: value?.availability?.length
        ? value.availability
        : [{ day: 'MONDAY', start_time: '09:00', end_time: '17:00' }],
      cover_image: value?.cover_image ?? '',
      gallery: value?.gallery.join(', ') ?? '',
      features: value?.features.join(', ') ?? '',
      status: value?.status ?? 'ACTIVE',
    },
  })

  const {
    uploadError,
    isUploadingCover,
    isUploadingGallery,
    coverValue,
    galleryItems,
    hasPendingCover,
    pendingGalleryCount,
    availabilityValue,
    handleCoverImageUpload,
    handleGalleryUpload,
    removeGalleryItem,
    clearCover,
    handleSubmitWithImageUploads,
    addAvailabilitySlot,
    removeAvailabilitySlot,
    handleClose,
  } = usePlaceDialogState({
    getValues,
    setValue,
    watch,
    reset,
    onClose,
  })

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
        <Stack
          spacing={2}
          component="form"
          id="place-form"
          onSubmit={handleSubmit(async (formValues) => {
            const nextValues = await handleSubmitWithImageUploads(formValues)

            await onSubmit({
              ...nextValues,
              cover_image: nextValues.cover_image || undefined,
              gallery: nextValues.gallery.split(',').map((item: string) => item.trim()).filter(Boolean),
              features: nextValues.features.split(',').map((item: string) => item.trim()).filter(Boolean),
            })
          })}
        >
          <PlaceDialogForm
            register={register}
            errors={errors}
            organizations={organizations}
            organizationId={value?.organization_id}
            error={error}
            uploadError={uploadError}
            isUploadingCover={isUploadingCover}
            isUploadingGallery={isUploadingGallery}
            coverValue={coverValue}
            galleryItems={galleryItems}
            availabilityValue={availabilityValue}
            onCoverUpload={handleCoverImageUpload}
            onGalleryUpload={handleGalleryUpload}
            onClearCover={clearCover}
            onRemoveGalleryItem={removeGalleryItem}
            hasPendingCover={hasPendingCover}
            pendingGalleryCount={pendingGalleryCount}
            onAddAvailabilitySlot={addAvailabilitySlot}
            onRemoveAvailabilitySlot={removeAvailabilitySlot}
          />
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
