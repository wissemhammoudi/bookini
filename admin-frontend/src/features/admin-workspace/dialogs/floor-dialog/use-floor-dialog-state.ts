import { useEffect, useState } from 'react'
import type { ChangeEvent } from 'react'
import type { UseFormGetValues, UseFormReset, UseFormSetValue } from 'react-hook-form'

import { uploadImageRequest } from '@/lib/api'
import {
  buildDesksFromFloor,
} from '@/features/admin-workspace/dialogs/shared'
import {
  buildInitialReservationAreas,
} from '@/features/admin-workspace/dialogs/floor-dialog/area-utils'
import { useFloorDialogAreaState } from '@/features/admin-workspace/dialogs/floor-dialog/use-floor-dialog-area-state'
import type { FloorFormValues } from '@/features/admin-workspace/dialogs/shared'
import type { DeskZone } from '@/features/admin-workspace/sections/floor-builder/floor-layout-utils'
import type { FloorRecord, PlaceRecord } from '@/lib/api-types'

type UseFloorDialogStateParams = {
  value: FloorRecord | undefined
  places: PlaceRecord[]
  title: string
  getValues: UseFormGetValues<FloorFormValues>
  setValue: UseFormSetValue<FloorFormValues>
  reset: UseFormReset<FloorFormValues>
  onClose: () => void
}

export function useFloorDialogState({ value, places, title, getValues, setValue, reset, onClose }: UseFloorDialogStateParams) {
  const [isUploadingBlueprint, setIsUploadingBlueprint] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [pendingBlueprintFile, setPendingBlueprintFile] = useState<File | null>(null)
  const [blueprintPreviewUrl, setBlueprintPreviewUrl] = useState<string | null>(null)
  const [buildFloorOpen, setBuildFloorOpen] = useState(true)
  const [builderDesks, setBuilderDesks] = useState<DeskZone[]>(() => buildDesksFromFloor(value, value?.pricing ?? 0))
  const initialAreas = buildInitialReservationAreas(value?.reservation_areas, value?.pricing ?? 0)
  const {
    extractedReservationAreas,
    setExtractedReservationAreas,
    handleReservationAreasInputChange,
    updateReservationArea,
    addReservationArea,
    removeReservationArea,
    syncFromBuilderDesks,
    extractReservationAreasFromBlueprint,
  } = useFloorDialogAreaState({
    initialAreas,
    setBuilderDesks,
    getValues,
    setValue,
  })

  useEffect(
    () => () => {
      if (blueprintPreviewUrl) {
        URL.revokeObjectURL(blueprintPreviewUrl)
      }
    },
    [blueprintPreviewUrl],
  )

  const validateImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      return 'Only image files are allowed'
    }

    const maxBytes = 8 * 1024 * 1024
    if (file.size > maxBytes) {
      return 'Image size must be under 8MB'
    }

    return null
  }

  const clearPendingBlueprint = () => {
    setPendingBlueprintFile(null)
    if (blueprintPreviewUrl) {
      URL.revokeObjectURL(blueprintPreviewUrl)
      setBlueprintPreviewUrl(null)
    }
  }

  const handleBlueprintUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const validationError = validateImageFile(file)
    if (validationError) {
      setUploadError(validationError)
      event.target.value = ''
      return
    }

    clearPendingBlueprint()
    setUploadError(null)

    setPendingBlueprintFile(file)
    setBlueprintPreviewUrl(URL.createObjectURL(file))
    event.target.value = ''
  }

  const clearBlueprint = () => {
    clearPendingBlueprint()
    setValue('blueprint_image', '')
  }

  const handleSubmitWithBlueprintUpload = async (formValues: FloorFormValues): Promise<FloorFormValues> => {
    setUploadError(null)
    if (!pendingBlueprintFile) {
      return formValues
    }

    setIsUploadingBlueprint(true)
    try {
      const response = await uploadImageRequest(pendingBlueprintFile)
      clearPendingBlueprint()
      return {
        ...formValues,
        blueprint_image: response.url,
      }
    } catch (err) {
      const typedError = err as { response?: { data?: { message?: string } }; message?: string }
      setUploadError(typedError.response?.data?.message || typedError.message || 'Failed to upload blueprint')
      throw new Error('Blueprint upload failed')
    } finally {
      setIsUploadingBlueprint(false)
    }
  }

  const handleClose = () => {
    reset()
    clearPendingBlueprint()
    setUploadError(null)
    setExtractedReservationAreas([])
    setBuildFloorOpen(false)
    onClose()
  }

  const handleBuildFloorSave = async (desks: DeskZone[]) => {
    setValue('blueprint_image', JSON.stringify(desks), { shouldDirty: true, shouldValidate: true })
    syncFromBuilderDesks(desks)
    setUploadError(null)
    setBuildFloorOpen(false)
  }

  const handleBuilderDesksLiveChange = (desks: DeskZone[]) => {
    setBuilderDesks(desks)
    syncFromBuilderDesks(desks)
  }

  const handleExtractReservationAreasFromBlueprint = () => {
    const extractionError = extractReservationAreasFromBlueprint()
    if (extractionError) {
      setUploadError(extractionError)
      return
    }

    setUploadError(null)
  }

  const draftFloor: FloorRecord = {
    id: value?.id ?? 'draft-floor',
    place_id: getValues('place_id') || value?.place_id || places[0]?.id || '',
    floor_name: getValues('floor_name') || value?.floor_name || title,
    floor_number: Number(getValues('floor_number') ?? value?.floor_number ?? 0),
    floor_size_sqm: Number(getValues('floor_size_sqm') ?? value?.floor_size_sqm ?? 100),
    floor_shape: getValues('floor_shape') ?? value?.floor_shape ?? 'RECTANGLE',
    capacity: Number(getValues('capacity') ?? value?.capacity ?? 1),
    pricing: Number(getValues('pricing') ?? value?.pricing ?? 0),
    description: getValues('description') || value?.description || '',
    blueprint_image: getValues('blueprint_image') || value?.blueprint_image || '',
    reservation_areas: extractedReservationAreas,
    status: getValues('status') ?? value?.status ?? 'ACTIVE',
    created_date: value?.created_date ?? new Date().toISOString(),
  }

  return {
    isUploadingBlueprint,
    uploadError,
    blueprintValue: blueprintPreviewUrl ?? getValues('blueprint_image'),
    hasPendingBlueprint: Boolean(pendingBlueprintFile),
    buildFloorOpen,
    builderDesks,
    extractedReservationAreas,
    draftFloor,
    setBuildFloorOpen,
    handleBlueprintUpload,
    clearBlueprint,
    handleSubmitWithBlueprintUpload,
    handleClose,
    handleReservationAreasInputChange,
    updateReservationArea,
    addReservationArea,
    removeReservationArea,
    handleBuildFloorSave,
    handleBuilderDesksLiveChange,
    extractReservationAreasFromBlueprint: handleExtractReservationAreasFromBlueprint,
  }
}
