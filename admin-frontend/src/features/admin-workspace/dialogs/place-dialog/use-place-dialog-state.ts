import { useState } from 'react'
import type { ChangeEvent } from 'react'
import type { UseFormGetValues, UseFormReset, UseFormSetValue, UseFormWatch } from 'react-hook-form'

import { uploadImageRequest } from '@/lib/api'
import type { PlaceFormValues, AvailabilitySlot } from '@/features/admin-workspace/dialogs/shared'

type UsePlaceDialogStateParams = {
  getValues: UseFormGetValues<PlaceFormValues>
  setValue: UseFormSetValue<PlaceFormValues>
  watch: UseFormWatch<PlaceFormValues>
  reset: UseFormReset<PlaceFormValues>
  onClose: () => void
}

const defaultAvailabilitySlot: AvailabilitySlot = {
  day: 'MONDAY',
  start_time: '09:00',
  end_time: '17:00',
}

export function usePlaceDialogState({ getValues, setValue, watch, reset, onClose }: UsePlaceDialogStateParams) {
  const [isUploadingCover, setIsUploadingCover] = useState(false)
  const [isUploadingGallery, setIsUploadingGallery] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const coverValue = watch('cover_image')
  const galleryValue = watch('gallery')
  const availabilityValue = watch('availability')
  const galleryItems = galleryValue.split(',').map((item: string) => item.trim()).filter(Boolean)

  const handleCoverImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploadingCover(true)
    setUploadError(null)
    try {
      const response = await uploadImageRequest(file)
      setValue('cover_image', response.url)
    } catch (err) {
      const typedError = err as { response?: { data?: { message?: string } }; message?: string }
      setUploadError(typedError.response?.data?.message || typedError.message || 'Failed to upload image')
    } finally {
      setIsUploadingCover(false)
      event.target.value = ''
    }
  }

  const handleGalleryUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setIsUploadingGallery(true)
    setUploadError(null)
    try {
      const uploadedUrls = await Promise.all(
        Array.from(files).map(async (file) => {
          const response = await uploadImageRequest(file)
          return response.url
        }),
      )

      const existingGallery = getValues('gallery')
      const mergedGallery = [
        ...existingGallery.split(',').map((item: string) => item.trim()).filter(Boolean),
        ...uploadedUrls,
      ]
      setValue('gallery', mergedGallery.join(', '))
    } catch (err) {
      const typedError = err as { response?: { data?: { message?: string } }; message?: string }
      setUploadError(typedError.response?.data?.message || typedError.message || 'Failed to upload gallery images')
    } finally {
      setIsUploadingGallery(false)
      event.target.value = ''
    }
  }

  const removeGalleryItem = (targetIndex: number) => {
    const nextGallery = galleryItems.filter((_, index) => index !== targetIndex)
    setValue('gallery', nextGallery.join(', '))
  }

  const addAvailabilitySlot = () => {
    const nextAvailability = [...availabilityValue, { ...defaultAvailabilitySlot }]
    setValue('availability', nextAvailability, { shouldDirty: true, shouldValidate: true })
  }

  const removeAvailabilitySlot = (targetIndex: number) => {
    if (availabilityValue.length <= 1) return
    const nextAvailability = availabilityValue.filter((_, index) => index !== targetIndex)
    setValue('availability', nextAvailability, { shouldDirty: true, shouldValidate: true })
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return {
    uploadError,
    isUploadingCover,
    isUploadingGallery,
    coverValue,
    galleryItems,
    availabilityValue,
    handleCoverImageUpload,
    handleGalleryUpload,
    removeGalleryItem,
    addAvailabilitySlot,
    removeAvailabilitySlot,
    handleClose,
  }
}
