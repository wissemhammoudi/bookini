import { useEffect, useMemo, useState } from 'react'
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
  const [pendingCoverFile, setPendingCoverFile] = useState<File | null>(null)
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null)
  const [pendingGalleryFiles, setPendingGalleryFiles] = useState<Array<{ file: File; previewUrl: string }>>([])

  const coverValue = watch('cover_image')
  const galleryValue = watch('gallery')
  const availabilityValue = watch('availability')
  const galleryItems = galleryValue.split(',').map((item: string) => item.trim()).filter(Boolean)
  const coverDisplayValue = coverPreviewUrl ?? coverValue
  const galleryDisplayItems = useMemo(
    () => [...galleryItems, ...pendingGalleryFiles.map((item) => item.previewUrl)],
    [galleryItems, pendingGalleryFiles],
  )

  useEffect(
    () => () => {
      if (coverPreviewUrl) {
        URL.revokeObjectURL(coverPreviewUrl)
      }

      pendingGalleryFiles.forEach((item) => URL.revokeObjectURL(item.previewUrl))
    },
    [coverPreviewUrl, pendingGalleryFiles],
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

  const clearCoverPending = () => {
    setPendingCoverFile(null)
    if (coverPreviewUrl) {
      URL.revokeObjectURL(coverPreviewUrl)
      setCoverPreviewUrl(null)
    }
  }

  const clearPendingGallery = () => {
    pendingGalleryFiles.forEach((item) => URL.revokeObjectURL(item.previewUrl))
    setPendingGalleryFiles([])
  }

  const handleCoverImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const validationError = validateImageFile(file)
    if (validationError) {
      setUploadError(validationError)
      event.target.value = ''
      return
    }

    clearCoverPending()
    setUploadError(null)

    setPendingCoverFile(file)
    setCoverPreviewUrl(URL.createObjectURL(file))
    event.target.value = ''
  }

  const handleGalleryUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    const nextPending: Array<{ file: File; previewUrl: string }> = []
    for (const file of Array.from(files)) {
      const validationError = validateImageFile(file)
      if (validationError) {
        nextPending.forEach((item) => URL.revokeObjectURL(item.previewUrl))
        setUploadError(validationError)
        event.target.value = ''
        return
      }

      nextPending.push({ file, previewUrl: URL.createObjectURL(file) })
    }

    setUploadError(null)
    setPendingGalleryFiles((previous) => [...previous, ...nextPending])
    event.target.value = ''
  }

  const removeGalleryItem = (targetIndex: number) => {
    if (targetIndex < galleryItems.length) {
      const nextGallery = galleryItems.filter((_, index) => index !== targetIndex)
      setValue('gallery', nextGallery.join(', '))
      return
    }

    const pendingIndex = targetIndex - galleryItems.length
    setPendingGalleryFiles((previous) => {
      const target = previous[pendingIndex]
      if (target) {
        URL.revokeObjectURL(target.previewUrl)
      }
      return previous.filter((_, index) => index !== pendingIndex)
    })
  }

  const clearCover = () => {
    clearCoverPending()
    setValue('cover_image', '')
  }

  const uploadPendingImagesIfNeeded = async (formValues: PlaceFormValues): Promise<PlaceFormValues> => {
    const nextValues: PlaceFormValues = { ...formValues }

    if (pendingCoverFile) {
      setIsUploadingCover(true)
      try {
        const response = await uploadImageRequest(pendingCoverFile)
        nextValues.cover_image = response.url
      } catch (err) {
        const typedError = err as { response?: { data?: { message?: string } }; message?: string }
        setUploadError(typedError.response?.data?.message || typedError.message || 'Failed to upload image')
        throw err
      } finally {
        setIsUploadingCover(false)
      }
    }

    if (pendingGalleryFiles.length > 0) {
      setIsUploadingGallery(true)
      try {
        const uploadedUrls = await Promise.all(
          pendingGalleryFiles.map(async (item) => {
            const response = await uploadImageRequest(item.file)
            return response.url
          }),
        )

        const existingGallery = nextValues.gallery.split(',').map((item: string) => item.trim()).filter(Boolean)
        nextValues.gallery = [...existingGallery, ...uploadedUrls].join(', ')
      } catch (err) {
        const typedError = err as { response?: { data?: { message?: string } }; message?: string }
        setUploadError(typedError.response?.data?.message || typedError.message || 'Failed to upload gallery images')
        throw err
      } finally {
        setIsUploadingGallery(false)
      }
    }

    return nextValues
  }

  const handleSubmitWithImageUploads = async (formValues: PlaceFormValues): Promise<PlaceFormValues> => {
    setUploadError(null)
    try {
      const nextValues = await uploadPendingImagesIfNeeded(formValues)
      clearCoverPending()
      clearPendingGallery()
      return nextValues
    } catch {
      throw new Error('Image upload failed')
    }
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
    clearCoverPending()
    clearPendingGallery()
    setUploadError(null)
    onClose()
  }

  return {
    uploadError,
    isUploadingCover,
    isUploadingGallery,
    coverValue: coverDisplayValue,
    galleryItems: galleryDisplayItems,
    hasPendingCover: Boolean(pendingCoverFile),
    pendingGalleryCount: pendingGalleryFiles.length,
    availabilityValue,
    handleCoverImageUpload,
    handleGalleryUpload,
    removeGalleryItem,
    clearCover,
    handleSubmitWithImageUploads,
    addAvailabilitySlot,
    removeAvailabilitySlot,
    handleClose,
  }
}
