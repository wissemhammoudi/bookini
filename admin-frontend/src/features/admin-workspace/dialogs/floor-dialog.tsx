import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material'
import { useForm } from 'react-hook-form'

import { FloorDialogForm } from '@/features/admin-workspace/dialogs/floor-dialog/floor-dialog-form'
import { useFloorDialogState } from '@/features/admin-workspace/dialogs/floor-dialog/use-floor-dialog-state'
import {
  DialogHeading,
  dialogActionsSx,
  dialogContentSx,
  dialogPaperSx,
  floorSchema,
} from '@/features/admin-workspace/dialogs/shared'
import type {
  FloorDialogProps,
  FloorFormValues,
} from '@/features/admin-workspace/dialogs/shared'
import { FloorBuilderDialog } from '@/features/admin-workspace/sections/floor-builder/floor-builder-dialog'

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
  const {
    handleSubmit,
    register,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<FloorFormValues>({
    resolver: zodResolver(floorSchema),
    values: {
      place_id: value?.place_id ?? places[0]?.id ?? '',
      floor_name: value?.floor_name ?? '',
      floor_number: value?.floor_number ?? 0,
      floor_size_sqm: value?.floor_size_sqm ?? 100,
      floor_shape: value?.floor_shape ?? 'RECTANGLE',
      capacity: value?.capacity ?? 1,
      pricing: value?.pricing ?? 0,
      description: value?.description ?? '',
      blueprint_image: value?.blueprint_image ?? '',
      reservation_areas: value?.reservation_areas.map((area) => (typeof area === 'string' ? area : area.name)).join(', ') ?? '',
      status: value?.status ?? 'ACTIVE',
    },
  })

  const {
    isUploadingBlueprint,
    uploadError,
    buildFloorOpen,
    builderDesks,
    extractedReservationAreas,
    draftFloor,
    setBuildFloorOpen,
    handleBlueprintUpload,
    handleClose,
    handleReservationAreasInputChange,
    updateReservationArea,
    addReservationArea,
    removeReservationArea,
    handleBuildFloorSave,
    handleBuilderDesksLiveChange,
    extractReservationAreasFromBlueprint,
  } = useFloorDialogState({
    value,
    places,
    title,
    getValues,
    setValue,
    reset,
    onClose,
  })

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth sx={dialogPaperSx}>
        <DialogTitle sx={{ px: 3, pt: 3, pb: 0 }}>
          <DialogHeading tone="Floor planning" title={title} subtitle="Configure a floor, its capacity, and the reservation areas it exposes." />
        </DialogTitle>

        <DialogContent dividers sx={dialogContentSx}>
          <form
            id="floor-form"
            onSubmit={handleSubmit(async (formValues) => {
              const areaMap = new Map(extractedReservationAreas.map((area) => [area.name, area]))
              const reservationAreas = formValues.reservation_areas
                .split(',')
                .map((item: string) => item.trim())
                .filter(Boolean)
                .map((name) =>
                  areaMap.get(name) ?? {
                    name,
                    price: formValues.pricing,
                    includes: [],
                    is_reservable: true,
                  },
                )

              await onSubmit({
                ...formValues,
                blueprint_image: formValues.blueprint_image || undefined,
                reservation_areas: reservationAreas,
              })
            })}
          >
            <FloorDialogForm
              register={register}
              errors={errors}
              value={value}
              places={places}
              error={error}
              uploadError={uploadError}
              isUploadingBlueprint={isUploadingBlueprint}
              extractedReservationAreas={extractedReservationAreas}
              onBlueprintUpload={handleBlueprintUpload}
              onOpenBuilder={() => setBuildFloorOpen(true)}
              onReservationAreasInputChange={handleReservationAreasInputChange}
              onExtractReservationAreasFromBlueprint={extractReservationAreasFromBlueprint}
              onAddReservationArea={addReservationArea}
              onUpdateReservationArea={updateReservationArea}
              onRemoveReservationArea={removeReservationArea}
            />
          </form>
        </DialogContent>

        <DialogActions sx={dialogActionsSx}>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" form="floor-form" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save floor'}
          </Button>
        </DialogActions>
      </Dialog>

      <FloorBuilderDialog
        open={buildFloorOpen}
        floor={draftFloor}
        onClose={() => setBuildFloorOpen(false)}
        onSave={handleBuildFloorSave}
        isSaving={false}
        desksState={builderDesks}
        onDesksStateChange={handleBuilderDesksLiveChange}
      />
    </>
  )
}
